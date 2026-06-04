/* eslint-disable no-negated-condition */
import { Injectable, Logger, } from '@nestjs/common'
import type { InvoiceSentToStripe,} from '@prisma/client'
import { InvoiceStatus, StripeInvoiceStatus, type ClientInvoiceB2B, type Prisma, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import type { GetStatisticDto, GetStatisticResponseDto, } from '../dto/get-statistic.dto'
import { EClientType, } from 'src/shared/types/client.type'
import { getDateRange, } from '../utils/date-range.filter'
import { EBookingStatus, } from 'src/shared/types/booking.types'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { GetInvoiceClientQuery,} from '../dto/get-client-dto'
import { BasicInvoiceClientDto, } from '../dto/get-client-dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

@Injectable()
export class InvoiceClientService {
	private readonly logger = new Logger(InvoiceClientService.name,)

	constructor(private readonly prisma : PrismaService,) {}

	private async getWorkerInvoices(workerId:string,): Promise<Array<ClientInvoiceB2B>> {
		const workerOffices = await this.prisma.workerOnOffice.findMany({
			where: {
				worker_id: workerId,
			},
			select: {
				office_id: true,
			},
		},)

		const officeIds = workerOffices.map((assigment,) => {
			return assigment.office_id
		},)

		const officeWhere:Prisma.ClientInvoiceB2BWhereInput = {
			AND: [
				{
					officeId: {
						in: officeIds,
					},
				},
			],
		}

		const invoices = await this.prisma.clientInvoiceB2B.findMany({
			where: {
				...officeWhere,
			},
			include: {
				office: true,
			},
		},)

		return invoices
	}

	public async getInvoicesWorker(clientId : string,):Promise<Array<ClientInvoiceB2B>> {
		const invoices = await this.getWorkerInvoices(clientId,)

		return invoices
	}

	public async getInvoicesClient(clientId: string,query : GetInvoiceClientQuery,):Promise<PagedResDto<BasicInvoiceClientDto>> {
		const clientInvoices = await this.prisma.clientInvoiceB2B.findMany({
			where: {
				office: {
					b2BClientsId: clientId,
					id:           {
						in: query.officeIds,
					},
				},
			},
			take:    query.take,
			skip:    query.skip,
			include: {
				clientDisputes: true,
				bookingGroups:  true,
				office:         {
					select: {
						title: true,
					},
				},
			},
		},)

		const totalInvoices = await this.prisma.clientInvoiceB2B.count({
			where: {
				office: {
					b2BClientsId: clientId,
				},
			},
		},)

		const allInvoices = clientInvoices.map((invoice,) => {
			return new BasicInvoiceClientDto({
				id:               invoice.id,
				sum:              invoice.sum,
				status:           invoice.status,
				createdAt:        invoice.created_at,
				isDisputeCreated: invoice.clientDisputes.length > 0,
				officeName:       invoice.office.title,
				bookingGroupId:   invoice.bookingGroups[0]?.id ?? '',
			},)
		},)
		return {
			data:    allInvoices,
			hasNext: totalInvoices > query.skip + query.take,
		}
	}

	public async getInvoicesByOffice(officeId: string, query: GetInvoiceClientQuery,): Promise<PagedResDto<BasicInvoiceClientDto>> {
		const officeInvoices = await this.prisma.clientInvoiceB2B.findMany({
			where: {
				officeId,
			},
			take:    query.take,
			skip:    query.skip,
			include: {
				clientDisputes: true,
				bookingGroups:  true,
				office:         {
					select: {
						name: true,
					},
				},
			},
		},)

		const totalInvoices = await this.prisma.clientInvoiceB2B.count({
			where: {
				officeId,
			},
		},)

		const allInvoices = officeInvoices.map((invoice,) => {
			return new BasicInvoiceClientDto({
				id:               invoice.id,
				sum:              invoice.sum,
				status:           invoice.status,
				createdAt:        invoice.created_at,
				isDisputeCreated: invoice.clientDisputes.length > 0,
				officeName:       invoice.office.name,
				bookingGroupId:        invoice.bookingGroups[0]?.id ?? '',
			},)
		},)
		return {
			data:    allInvoices,
			hasNext: totalInvoices > query.skip + query.take,
		}
	}

	public async getBookingInvoiceStatistic(data:GetStatisticDto,) : Promise<GetStatisticResponseDto> {
		const {clientId,clientType,officeIds,dateRange,} = data

		let bookingInProgress = 0
		let totalSpentBooking = 0
		let totalBookings = 0

		let dateFilter: { gte?: Date; lte?: Date } = {}
		if (dateRange) {
			dateFilter = getDateRange(dateRange,)
		}

		if (clientType !== EClientType.WORKER) {
			const bookings = await this.prisma.booking.findMany({
				where: {
					officeId: {
						in: officeIds,
					},
					b2BClientsId: clientId,
					date_time:    dateFilter,
				},
			},)

			bookingInProgress = bookings.filter((booking,) => {
				return booking.booking_status === EBookingStatus.PROGRESS
			},).length
			totalBookings = bookings.length
			totalSpentBooking = bookings.reduce((sum, booking,) => {
				return sum + parseFloat(booking.total_sum,)
			}, 0,)
		} else {
			const workerOnOffices = await this.prisma.workerOnOffice.findMany({
				where: {
					worker_id: clientId,
				},
				select: {
					office_id: true,
				},
			},)

			const allOfficeIds = workerOnOffices.map((assigment,) => {
				return assigment.office_id
			},)

			const bookings = await this.prisma.booking.findMany({
				where: {
					officeId: {
						in: officeIds?.length ?
							officeIds :
							allOfficeIds,
					},
					date_time: dateFilter,
				},
			},)

			bookingInProgress = bookings.filter((booking,) => {
				return booking.booking_status === EBookingStatus.PROGRESS
			},).length
			totalBookings = bookings.length
			totalSpentBooking = bookings.reduce((sum, booking,) => {
				return sum + parseFloat(booking.total_sum,)
			}, 0,)
		}

		return {
			totalBookings,
			totalSpentBooking,
			bookingInProgress,
		}
	}

	public async getUniqueClientsWithInvoices({
		param,
		startDate,
		endDate,
	}:{
        param: PageOptionsDto,
        startDate: Date,
        endDate: Date,
    },): Promise<Array<{ clientId: string; }>> {
		const result = await this.prisma.clientInvoiceB2B.findMany({
			where: {
				created_at: {
					gte: startDate,
					lt:  endDate,
				},
			},
			take:     param.take,
			skip:     param.skip,
			distinct: ['officeId',],
			select:   {
				office: {
					select: {
						b2BClientsId: true,
					},
				},
			},
		},)
		return result.map((invoice,) => {
			return {
				clientId: invoice.office.b2BClientsId ?? '',
			}
		},)
	}

	public async getInvoicesByClientId({
		clientId,
		param,
		endDate,
	}: {
        clientId: string,
        param: PageOptionsDto,
        endDate: Date,
    },): Promise<{
        data: Array<{ sum: string; stripeInvoiceId?: string; clientId: string; id: string}>;
        count: number;
    }> {
		const where: Prisma.ClientInvoiceB2BWhereInput = {
			created_at: {
				lt:  endDate,
			},
			office: {
				b2BClientsId: clientId,
			},
			status: {
				in: [
					InvoiceStatus.AWAITING_PAYMENT,
				],
			},
		}
		const [result, count,] = await Promise.all([
			this.prisma.clientInvoiceB2B.findMany({
				where,
				take:   param.take,
				skip:   param.skip,
				select: {
					sum:             true,
					id:              true,
					stripeInvoiceId: true,
					office:          {
						select: {
							b2BClientsId: true,
						},
					},
				},
			},),
			this.prisma.clientInvoiceB2B.count({
				where,
			},),
		],)
		return {
			data: result.map((invoice,) => {
				return {
					sum:      invoice.sum,
					clientId: invoice.office.b2BClientsId ?? '',
					id:       invoice.id,
				}
			},),
			count,
		}
	}

	public async createInvoice(data: Prisma.ClientInvoiceB2BCreateInput,): Promise<ClientInvoiceB2B> {
		return this.prisma.clientInvoiceB2B.create({
			data,
		},)
	}

	public async updateInvoice({
		where,
		data,
	}: {
		where: Prisma.ClientInvoiceB2BWhereUniqueInput;
		data: Prisma.ClientInvoiceB2BUpdateInput;
	},): Promise<ClientInvoiceB2B>  {
		return this.prisma.clientInvoiceB2B.update({
			where,
			data,
		},)
	}

	public async updateManyInvoice({
		where,
		data,
	}: {
		where: Prisma.ClientInvoiceB2BWhereInput;
		data: Prisma.ClientInvoiceB2BUpdateInput;
	},): Promise<Prisma.BatchPayload>  {
		return this.prisma.clientInvoiceB2B.updateMany({
			where,
			data,
		},)
	}

	public async createInvoiceSentToStripe(data: Prisma.InvoiceSentToStripeCreateInput,): Promise<InvoiceSentToStripe> {
		return this.prisma.invoiceSentToStripe.create({
			data,
		},)
	}

	public async updateInvoicesSentToStripe({where, data,}:{
		where: Prisma.InvoiceSentToStripeWhereInput;
		data: Prisma.InvoiceSentToStripeUpdateInput
	},): Promise<Prisma.BatchPayload> {
		return this.prisma.invoiceSentToStripe.updateMany({
			where,
			data,
		},)
	}

	public async deleteInvoicesSentToStripe({where,}:{
		where: Prisma.InvoiceSentToStripeWhereInput;
	},): Promise<Prisma.BatchPayload> {
		return this.prisma.invoiceSentToStripe.deleteMany({
			where,
		},)
	}

	public async getIsInvoiceNotPaid(clientId: string,): Promise<boolean> {
		const oldestNotPaidInvoice = await this.prisma.invoiceSentToStripe.findFirst({
			where: {
				clientId,
				status: StripeInvoiceStatus.SENT,
			},
			orderBy: {
				createdAt: 'asc',
			},
		},)

		if (!oldestNotPaidInvoice) {
			return false
		}

		const expirationDays = 1
		const date = new Date(oldestNotPaidInvoice.createdAt,)
		const lastValidDate = new Date()
		lastValidDate.setDate(lastValidDate.getDate() - expirationDays,)

		if (date.getTime() < lastValidDate.getTime()) {
			return true
		}

		return false
	}

	public async getIsLastInvoiceMoreThen60Days(officeId: string,): Promise<boolean> {
		const lastInvoice = await this.prisma.clientInvoiceB2B.findFirst({
			where: {
				officeId,
			},
			orderBy: {
				created_at: 'desc',
			},
		},)

		if (!lastInvoice) {
			return false
		}

		const sixtyDaysAgo = new Date()
		sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60,)

		return lastInvoice.created_at < sixtyDaysAgo
	}
}