import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException, } from '@nestjs/common'
import type { Prisma, Worker, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { BookingGroupService, } from 'src/modules/booking-group/booking-group.service'
import type { IBookingWithAllInfo, } from 'src/modules/booking-group/dto/booking-client-group.dto'
import type {  SkillDto, } from 'src/modules/booking/dto'
import { EClientType, } from 'src/shared/types/client.type'
import { CryptoService, } from 'src/modules/crypto/crypto.service'
import { MailService, } from 'src/modules/mail/mail.service'
import { ConfigService, } from '@nestjs/config'
import type { CreateWorkerDto, UpdateWorkerDto, GetBookingsForWorkerDto, GetWorkersQueryDto, } from '../dto/worker.dto'
import { WorkerResponseDto, PagedWorkersResponseDto, } from '../dto/worker-response.dto'
import { OfficeResponseDto, } from '../dto/office-response.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { ICreateClientOptions, } from '../types/client-service.types'
import { ClientBasicService, } from './client-basic.service'
import { Template, templateDictionary } from 'src/modules/mail/types/template.enum'

@Injectable()
export class WorkerService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly bookingGroupService: BookingGroupService,
    private cryptoService : CryptoService,
    private mailService : MailService,
    private readonly configService: ConfigService,
    private readonly clientBasicService: ClientBasicService,
	) {}

	public async getBookingsForWorker(params: GetBookingsForWorkerDto,): Promise<Array<IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>}>> {
		const { workerId, bookingWhere, take, skip, bookingInclude, bookingGroupWhere, } = params

		const workerOffices = await this.prisma.workerOnOffice.findMany({
			where: {
				worker_id: workerId,
			},
			select: {
				office_id: true,
			},
		},)
		const officeIds = workerOffices.map((assignment,) => {
			return assignment.office_id
		},)
		const officeWhere: Prisma.BookingGroupWhereInput = {
			AND: [
				{
					officeId: {
						in: officeIds,
					},
				},
			],
		}
		const bookings = await this.bookingGroupService.getBookingsForClient({
			where: {
				...officeWhere,
				...bookingGroupWhere,
			},
			include: {
				bookings: {
					where:   bookingWhere,
					include: {
						...bookingInclude,
					},
				},
			},
			take,
			skip,
		},)

		return bookings
	}

	public async detectClientType(clientId: string,): Promise<EClientType> {
		const b2c = await this.prisma.b2CClients.findUnique({
			where: {
				id: clientId,
			},
			select: {
				id: true,
			},
		},)

		if (b2c) {
			return EClientType.B2C
		}

		const b2b = await this.prisma.b2BClients.findUnique({
			where: {
				id: clientId,
			},
			select: {
				id: true,
			},
		},)

		if (b2b) {
			return EClientType.B2B
		}

		return EClientType.WORKER
	}

	public async getWorkers(query: GetWorkersQueryDto,): Promise<PagedResDto<WorkerResponseDto>> {
		const { search, role, officeId, sortBy, sortOrder, take, skip, } = query

		const where: Prisma.WorkerWhereInput = {}

		if (search) {
			where.OR = [
				{
					firstName: { contains: search, mode: 'insensitive', },
				},
				{
					lastName: { contains: search, mode: 'insensitive',},
				},
				{
					email: { contains: search, mode: 'insensitive', },
				},
				{
					role: { contains: search, mode: 'insensitive', },
				},
			]
		}

		if (role) {
			where.role = role
		}

		if (officeId) {
			where.offices = {
				some: {
					office_id: officeId,
				},
			}
		}

		const orderBy: Prisma.WorkerOrderByWithRelationInput = {}
		if (sortBy) {
			const sortField = sortBy === 'createdAt' ?
				'created_at' :
				sortBy
			orderBy[sortField as keyof Prisma.WorkerOrderByWithRelationInput] = sortOrder ?? 'asc'
		} else {
			orderBy.created_at = 'desc'
		}

		const [workers, totalCount,] = await Promise.all([
			this.prisma.worker.findMany({
				where,
				orderBy,
				take,
				skip,
				include: {
					offices: true,
				},
			},),
			this.prisma.worker.count({ where,},),
		],)

		const workerDtos = workers.map((worker,) => {
			return WorkerResponseDto.cast(worker,)
		},)

		return {
			data:    workerDtos,
			hasNext: totalCount > skip + take,
		}
	}

	public async getWorkerById(id: string,): Promise<WorkerResponseDto> {
		const worker = await this.prisma.worker.findUnique({
			where:   { id, },
			include: {
				offices: true,
			},
		},)

		if (!worker) {
			throw new HttpException('Worker not found', HttpStatus.NOT_FOUND,)
		}

		return WorkerResponseDto.cast(worker,)
	}

	public async createWorker(data: CreateWorkerDto, options: ICreateClientOptions = {},): Promise<WorkerResponseDto> {
		const { checkEmail = true, } = options

		if (checkEmail) {
			const isTaken = await this.clientBasicService.checkIfEmailIsTaken(data.email,)
			if (isTaken.isTaken) {
				throw new ConflictException(
					`User with email ${data.email} already exists in the system. Change email to create worker`,
				)
			}
		}

		const generatedPassword = this.cryptoService.generateRandomPassword()
		const password = await this.cryptoService.hashString(generatedPassword,)

		const newWorker = await this.prisma.worker.create({
			data: {
				firstName:   data.firstName,
				lastName:    data.lastName,
				email:       data.email,
				phoneNumber: data.phoneNumber,
				role:        data.role,
				password,
			},
		},)

		if (data.officeIds?.length) {
			await this.prisma.workerOnOffice.createMany({
				data: data.officeIds.map((officeId,) => {
					return {
						worker_id: newWorker.id,
						office_id: officeId,
					}
				},),
			},)
		}

		await this.mailService.sendEmailWithTemplate(Template.BASIC, {
			clickLondonUrl:       `${this.configService.getOrThrow('CLIENT_REDIRECT_URL',)}/sign-in` ,
			email:                newWorker.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].message,
			password:             generatedPassword,
		}, {
			to:      newWorker.email,
			subject: 'New worker account',
		},)

		return WorkerResponseDto.cast(newWorker,)
	}

	public async updateWorker(workerId: string, data: UpdateWorkerDto,): Promise<WorkerResponseDto> {
		if (data.email) {
			const isTaken = await this.clientBasicService.checkIfEmailIsTaken(data.email,)
			if (isTaken.isTaken) {
				throw new ConflictException(
					`User with email ${data.email} already exists in the system. Change email to update worker`,
				)
			}
		}

		const updatedWorker = await this.prisma.worker.update({
			where: { id: workerId, },
			data:  {
				firstName:   data.firstName,
				lastName:    data.lastName,
				email:       data.email,
				phoneNumber: data.phoneNumber,
				role:        data.role,
			},
		},)

		if (data.officeIds !== undefined) {
			const currentOffices = await this.prisma.workerOnOffice.findMany({
				where:  { worker_id: workerId, },
				select: { office_id: true, },
			},)
			const currentOfficeIds = currentOffices.map((assignment,) => {
				return assignment.office_id
			},)

			const officesToRemove = currentOfficeIds.filter((officeId,) => {
				return !data.officeIds?.includes(officeId,)
			},)
			const officesToAdd = data.officeIds.filter((officeId,) => {
				return !currentOfficeIds.includes(officeId,)
			},)

			if (officesToRemove.length > 0) {
				await Promise.all(
					officesToRemove.map(async(officeId,) => {
						await this.prisma.workerOnOffice.delete({
							where: {
								worker_id_office_id: {
									worker_id: workerId,
									office_id: officeId,
								},
							},
						},)
						return this.prisma.office.update({
							where: { id: officeId, },
							data:  { numberOfWorkers: { decrement: 1, }, },
						},)
					},),
				)
			}

			if (officesToAdd.length > 0) {
				await this.prisma.workerOnOffice.createMany({
					data: officesToAdd.map((officeId,) => {
						return { worker_id: workerId, office_id: officeId, }
					},),
				},)
				await Promise.all(
					officesToAdd.map(async(officeId,) => {
						return this.prisma.office.update({
							where: { id: officeId, },
							data:  { numberOfWorkers: { increment: 1, }, },
						},)
					},),
				)
			}
		}

		return WorkerResponseDto.cast(updatedWorker,)
	}

	public async deleteWorker(workerId: string,): Promise<WorkerResponseDto> {
		await this.prisma.workerOnOffice.deleteMany({
			where: { worker_id: workerId, },
		},)

		const deletedWorker = await this.prisma.worker.delete({ where: { id: workerId, }, },)

		return WorkerResponseDto.cast(deletedWorker,)
	}

	public async getWorkersByOfficeId(officeId: string,): Promise<Array<WorkerResponseDto>> {
		const workers = await this.prisma.worker.findMany({
			where: {
				offices: {
					some: {
						office_id: officeId,
					},
				},
			},
			include: {
				offices: true,
			},
		},)

		return workers.map((worker,) => {
			return WorkerResponseDto.cast(worker,)
		},)
	}

	public async addWorker(officeId: string, data: Prisma.WorkerCreateInput,): Promise<WorkerResponseDto> {
		const [b2cUser, b2bUser, worker,] = await Promise.all([
			this.prisma.b2CClients.findFirst({ where: { email: data.email, }, },),
			this.prisma.b2BClients.findFirst({ where: { email: data.email, }, },),
			this.prisma.worker.findFirst({ where: { email: data.email, }, },),
		],)

		if (b2bUser ?? b2cUser ?? worker) {
			throw new HttpException(
				`User with email ${data.email} already exists in the system. Change email to create worker`,
				HttpStatus.CONFLICT,
			)
		}

		const generatedPassword = this.cryptoService.generateRandomPassword()
		const password = await this.cryptoService.hashString(generatedPassword,)

		const newWorker = await this.prisma.worker.create({
			data: {
				...data,
				password,
			},
		},)

		await this.prisma.workerOnOffice.create({
			data: {
				worker_id: newWorker.id,
				office_id: officeId,
			},
		},)

		await this.mailService.sendEmail({
			to:      newWorker.email,
			subject: 'New worker account',
			html:    `<p>email: ${newWorker.email}<p><p>password: ${generatedPassword}<p><br><a href='${this.configService.getOrThrow('CLIENT_REDIRECT_URL',)}/sign-in'>Login Page</a>`,
		},)
		return WorkerResponseDto.cast(newWorker,)
	}

	public async getOfficesByWorkerId(workerId: string,): Promise<Array<OfficeResponseDto>> {
		const workerWithOffices = await this.prisma.worker.findUnique({
			where:   { id: workerId, },
			include: {
				offices: {
					include: {
						office: true,
					},
				},
			},
		},)

		if (!workerWithOffices) {
			return []
		}

		const offices = workerWithOffices.offices.map(((workerOnOffice,) => {
			return OfficeResponseDto.cast(workerOnOffice.office,)
		}),)

		return offices
	}

	public async deleteWorkerFromOffice(workerId: string, officeId: string,): Promise<void> {
		const existingAssignment = await this.prisma.workerOnOffice.findUnique({
			where: {
				worker_id_office_id: {
					worker_id: workerId,
					office_id: officeId,
				},
			},
		},)

		if (!existingAssignment) {
			throw new NotFoundException('Worker is not assigned to this office',)
		}

		await this.prisma.workerOnOffice.delete({
			where: { worker_id_office_id: { worker_id: workerId, office_id: officeId, }, },
		},)

		await this.prisma.office.update({
			where: { id: officeId, },
			data:  { numberOfWorkers: { decrement: 1, }, },
		},)
	}

	public async assignWorkerToOffice(workerId: string, officeId: string,): Promise<WorkerResponseDto> {
		const worker = await this.prisma.worker.findUnique({ where: { id: workerId, }, },)

		if (!worker) {
			throw new NotFoundException('Worker not found',)
		}

		const office = await this.prisma.office.findUnique({ where: { id: officeId, }, },)

		if (!office) {
			throw new NotFoundException('Office not found',)
		}

		const existingAssignment = await this.prisma.workerOnOffice.findUnique({
			where: {
				worker_id_office_id: {
					worker_id: workerId,
					office_id:  officeId,
				},
			},
		},)

		if (existingAssignment) {
			throw new ConflictException('Worker is already assigned to this office',)
		}

		await this.prisma.workerOnOffice.create({
			data: {
				worker_id: workerId,
				office_id:  officeId,
			},
		},)

		await this.prisma.office.update({
			where: { id: officeId, },
			data:  { numberOfWorkers: { increment: 1, }, },
		},)

		return WorkerResponseDto.cast(worker,)
	}
}
