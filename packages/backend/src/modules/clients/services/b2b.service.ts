/* eslint-disable no-await-in-loop */
/* eslint-disable no-inline-comments */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
import { Injectable, BadRequestException, Body, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { CryptoService, } from '../../crypto/crypto.service'
import { MailService, } from '../../mail/mail.service'
import { OfficeService, } from './office.service'
import type { Office,} from '@prisma/client'
import { type ClientStatus, type Prisma, type Preference, InvoiceStatus, } from '@prisma/client'
import type  { ClientsDto, ChangeClientDto, IB2BClientListReturn, } from '../dto/b2b.dto'
import { SortBy, SortDirection, } from '../dto/b2b.dto'
import { text, } from 'src/shared/text/en'
import type { ChangePasswordDto, } from '../dto/b2c.dto'
import type { ICreateOffice, } from '../types/create-office.type'
import type { PageOptionsDto, PageSearchCommonDto, } from 'src/shared/dto/page-options.dto'
import { PackagesBrandDto, } from '../dto/packages-brand.dto'
import { B2BClientResponseDto, } from '../dto/b2b-client-response.dto'
import type { CreateB2BDto, } from '../dto/create-b2b.dto'
import { ClientBasicService, } from './client-basic.service'
import { StripeService, } from '../../stripe/stripe.service'
import { Template, templateDictionary, } from 'src/modules/mail/types/template.enum'
import { ConfigService, } from '@nestjs/config'
import type { SubbrandDto,} from '../dto/subbrand-dto'
import { SubbrandResponseDto, } from '../dto/subbrand-dto'

@Injectable()
export class ClientsB2BService {
	constructor(
        private readonly prisma: PrismaService,
        private readonly cryptoService: CryptoService,
        private readonly mailService: MailService,
		private readonly officeService: OfficeService,
		private readonly clientBasicService: ClientBasicService,
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService,
	) {}

	private buildB2BSearchConditions(search: string,): Prisma.B2BClientsWhereInput['OR'] {
		const searchConditions: Prisma.B2BClientsWhereInput['OR'] = [
			{ firstName: { contains: search, mode: 'insensitive', }, },
			{ lastName: { contains: search, mode: 'insensitive', }, },
			{ address: { contains: search, mode: 'insensitive', }, },
			{ phoneNumber: { contains: search, mode: 'insensitive', }, },
			{ companyName: { contains: search, mode: 'insensitive', }, },
			{ email: { contains: search, mode: 'insensitive', }, },
		]

		// handle name and surname combinations
		const searchTerms = search.trim().split(/\s+/,)
		if (searchTerms.length >= 2) {
			const firstName = searchTerms[0]
			const lastName = searchTerms[searchTerms.length - 1]

			// add condition for first name in firstName field and last name in lastName field
			searchConditions.push({
				AND: [
					{ firstName: { contains: firstName, mode: 'insensitive', }, },
					{ lastName: { contains: lastName, mode: 'insensitive', }, },
				],
			},)

			// add condition for last name in firstName field and first name in lastName field (reverse order)
			searchConditions.push({
				AND: [
					{ firstName: { contains: lastName, mode: 'insensitive', }, },
					{ lastName: { contains: firstName, mode: 'insensitive', }, },
				],
			},)
		}

		return searchConditions
	}

	public async get(query: ClientsDto,): Promise<IB2BClientListReturn> {
		const { filter, search, skip, take, } = query
		const where: Prisma.B2BClientsWhereInput = {
			archived: false,
		}
		if (filter) {
			if (filter.brand) {
				where.companyName = filter.brand
			}

			if (filter.officeStatus) {
				where.officeStatus = Array.isArray(filter.officeStatus,) ?
					{ in: filter.officeStatus, } :
					filter.officeStatus as ClientStatus
			}

			if (filter.status !== undefined) {
				where.status = filter.status === 'true'
			}

			if (filter.showArchived) {
				where.archived = undefined
			}
		}

		if (search) {
			where.OR = [
				...(where.OR ?? []),
				...this.buildB2BSearchConditions(search,)!,
			]
		}

		const orderBy: Array<Prisma.B2BClientsOrderByWithRelationInput> = []

		if (filter?.sortBy === SortBy.ALPHABETIC) {
			orderBy.push({ companyName: filter.sortDirection || SortDirection.ASC, },)
		}

		if (filter?.sortBy === SortBy.AMOUNT_OF_OFFICES) {
			orderBy.push({
				offices: {
					_count: filter.sortDirection || 'asc',
				},
			},)
		}

		const clients = await this.prisma.b2BClients.findMany({
			where,
			orderBy,
			skip,
			take,
			include: {
				offices: true,
			},
		},)

		const totalCount = await this.prisma.b2BClients.count({
			where,
		},)

		const maxPage = Math.max(1, Math.ceil(totalCount / take,),)

		return {
			clients: clients.map((client,) => {
				return B2BClientResponseDto.cast({
					...client,
					officesCount: client.offices.length,
				},)
			},),
			maxPage,
		}
	}

	public async getClientById(id: string,): Promise<B2BClientResponseDto | null> {
		const client = await this.prisma.b2BClients.findUnique({
			where:   { id, },
			include: {
				offices: true,
			},
		},)

		if (!client) {
			return null
		}

		return B2BClientResponseDto.cast({
			...client,
			officesCount: client.offices.length,
		},)
	}

	public async addClient(data: CreateB2BDto,): Promise<B2BClientResponseDto> {
		const isTaken = await this.clientBasicService.checkIfEmailIsTaken(data.email,)

		if (isTaken.isTaken) {
			throw new BadRequestException(`Email ${data.email} is already taken`,)
		}

		const generatedPassword = this.cryptoService.generateRandomPassword(12,)
		const hashedPassword = await this.cryptoService.hashString(generatedPassword,)

		const { offices, ...clientData } = data

		const client = await this.prisma.b2BClients.create({
			data: {
				...clientData,
				status:   true,
				password: hashedPassword,
			},
		},)

		if (offices?.length) {
			await Promise.all(offices.map(async(office,) => {
				await this.officeService.createOffice({ ...office, b2BClientsId: client.id, }, { checkEmail: false, },)
			},),)
		}
		const fullName = `${client.firstName} ${client.lastName}`

		await this.stripeService.createCustomer({
			email: client.email,
			name:  fullName ?? client.companyName,
		},)

		await this.mailService.sendEmailWithTemplate(Template.BASIC, {
			clickLondonUrl:       `${this.configService.getOrThrow('CLIENT_REDIRECT_URL',)}/sign-in` ,
			email:                client.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].message,
			password:             generatedPassword,
		}, {
			to:      client.email,
			subject: 'Client Account Created',
		},)

		return B2BClientResponseDto.cast(client,)
	  }

	public async getUniqueBrands(): Promise<Array<string>> {
		const clients = await this.prisma.b2BClients.findMany({
			select:   { companyName: true, },
			distinct: ['companyName',],
			where:    {
				companyName: {
					not: null,
				},
			},
		},)

		return clients.map((client,) => {
			return client.companyName
		},) as Array<string>
	}

	public async updateB2B(clientId: string, data: ChangeClientDto,): Promise<B2BClientResponseDto> {
		const client = await this.prisma.b2BClients.findUnique({
			where:   { id: clientId, },
		},)

		if (!client) {
			throw new BadRequestException('Client not found',)
		}

		const updatedClient = await this.prisma.b2BClients.update({
			where:   { id: clientId, },
			data,
			include: {
				offices: true,
			},
		},)

		return B2BClientResponseDto.cast(updatedClient,)
	}

	public async getPreferences(clientId: string,): Promise<Array<Preference>> {
		return this.prisma.preference.findMany({
		  where: { clientsB2B: { some: { b2bClientId: clientId, }, }, },
		},)
	  }

	  public async updatePreferences(preferenceId: string, preferencesData: Partial<Preference>,): Promise<Preference> {
		return this.prisma.preference.update({
		  where: { id: preferenceId, },
		  data:  preferencesData,
		},)
	  }

	  public async addPreference(clientId: string, preferencesData: Omit<Preference, 'id'>,): Promise<Preference> {
		const clientExists = await this.prisma.b2BClients.findUnique({
			where: { id: clientId, },
		},)

		if (!clientExists) {
			throw new Error('B2B Client does not exist.',)
		}

		return this.prisma.preference.create({
			data: {
				...preferencesData,
				clientsB2B: { connect: { id: clientId, }, },
			},
		},)
	}

	public async changePassword(id:string,dto:ChangePasswordDto,): Promise<{ message: string; }> {
		const {newPassword,oldPassword,} = dto

		const client = await this.prisma.b2BClients.findFirst({where: {id,},},)

		if (!client) {
			throw new BadRequestException(text.userNotExist,)
		}

		const same = await this.cryptoService.comparePasswords(oldPassword, client.password,)

		if (!same) {
			throw new BadRequestException(text.samePassword,)
		}

		const newHashedPassword = await this.cryptoService.hashString(newPassword,)

		await this.prisma.b2BClients.update({
			where: {
				id,
			},
			data: {
				password: newHashedPassword,
			},
		},)

		return { message: 'Password changed', }
	}

	public async changeWokerPassword(id:string, dto:ChangePasswordDto,): Promise<{ message: string; }> {
		const {newPassword,oldPassword,} = dto

		const client = await this.prisma.worker.findFirst({where: {id,},},)

		if (!client) {
			throw new BadRequestException(text.userNotExist,)
		}

		const same = await this.cryptoService.comparePasswords(oldPassword, client.password,)

		if (!same) {
			throw new BadRequestException(text.samePassword,)
		}

		const newHashedPassword = await this.cryptoService.hashString(newPassword,)

		await this.prisma.worker.update({
			where: {
				id,
			},
			data: {
				password: newHashedPassword,
			},
		},)

		return { message: 'Password changed', }
	}

	  public async deletePreference(preferenceId: string,): Promise<Preference> {
		return this.prisma.preference.delete({
		  where: { id: preferenceId, },
		},)
	  }

	public async createOffice(data: ICreateOffice,): Promise<Office> {
		const { preferences, worker, ...officeData } = data

		const superAdminId = await this.prisma.admin.findFirst({
			select: { id: true, },
		},)

		  const newOffice = await this.prisma.office.create({
			data: {
			  title:               '',
			  name:                officeData.name,
			  billing_address:     officeData.billing_address,
			  address_coordinates: officeData.address,
			  numberOfWorkers:     worker.length,
			  phone_number:        officeData.phone_number,
			  surname:             '',
			  address:             officeData.address,
			  b2BClientsId:        officeData.clientId,
			  admin_id:            superAdminId!.id,
			  email:               officeData.email,
			  propertyTypes:       [],
			  officeType:          officeData.officeType,
			  officeClientType:    officeData.officeClientType,
			  paymentPreferences:  officeData.paymentPreferences,
			},
		  },)

		//   if (worker.length > 0) {
		// 	await Promise.all(
		// 	  worker.map(async(w,) => {
		// 			return this.workerService.addWorker(newOffice.id, {
		// 		  firstName:                w.firstName,
		// 		  lastName:                 w.lastName,
		// 		  role:                     w.role,
		// 		  email:                    w.email,
		// 		  phoneNumber:              w.phoneNumber,
		// 		  notification_preferences: {
		// 					create: [],
		// 		  },
		// 			},)
		// 		},
		// 	  ),
		// 	)
		//   }

		  if (preferences.length > 0) {
			await this.prisma.office.update({
			  where: { id: newOffice.id, },
			  data:  {
					officePreference: {
				  connect: preferences.map((pref,) => {
							return { id: pref.id, }
						},),
					},
			  },
			},)
		  }

		  return newOffice
	  }

	public async getBasicInfo(clientId: string,): Promise<{
		id: string;
		companyName: string | null;
		firstName: string;
		lastName: string;
		email: string;
	} | null > {
		const client = await this.prisma.b2BClients.findUnique({
			where:  { id: clientId, },
			select: {
				id:          true,
				companyName: true,
				firstName:   true,
				lastName:    true,
				email:       true,
			},
		},)

		return {
			id:          client?.id ?? '',
			companyName: client?.companyName ?? '',
			firstName:   client?.firstName ?? '',
			lastName:    client?.lastName ?? '',
			email:       client?.email ?? '',
		}
	}

	public async getClientIdsWithUnpaidInvoices(param: PageOptionsDto,): Promise<Array<string>> {
		const clientsWithUnpaidInvoices = await this.prisma.b2BClients.findMany({
			select: {
				id: true,
			},
			where:  {
				offices: {
					some: {
						ClientInvoices: {
							some: {
								status: InvoiceStatus.AWAITING_PAYMENT,
							},
						},
					},
				},
			},
			take:   param.take,
			skip:   param.skip,
		},)

		return clientsWithUnpaidInvoices.map((client,) => {
			return client.id
		},)
	}

	public async getB2BClientIdByWorkerId(workerId:string,): Promise<string | undefined> {
		const client = await this.prisma.b2BClients.findFirst({
			where: {
				offices: {
					some: {
						workers: {
							some: {
								worker_id: workerId,
							},
						},
					},
				},
			},
			select: {
				id: true,
			},
		},)

		return client?.id
	}

	public async getPackagesBrand(query: PageSearchCommonDto,): Promise<Array<PackagesBrandDto>> {
		const { search, } = query

		const brands = await this.prisma.b2BClients.findMany({
			where: {
				companyName: {
					not: null,
				},
				OR: [
					{
						companyName: {
							contains: search,
							mode:     'insensitive',
						},
					},
				],
			},
		},)

		return brands.map((brand,) => {
			return new PackagesBrandDto({
				id:       brand.id,
				fullName: brand.companyName ?? '',
			},)
		},)
	}
}