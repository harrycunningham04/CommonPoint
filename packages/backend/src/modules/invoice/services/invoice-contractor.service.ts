/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { SearchInvoicesDto, } from '../dto/search.dto'
import { ContractorInvoiceDto, ContractorInvoiceStatisticDto,} from '../dto/contractor-invoice.dto'
import { ContractorInvoicesDto, } from '../dto/contractor-invoice.dto'
import { BookingStatus, InvoiceContractor, StatisticType, type Prisma, } from '@prisma/client'
import type { PagedCountResDto, } from 'src/shared/dto/pageg-count-res.dto'
import type { StatisticInvoicesDto, } from '../dto/statistic.dto'
import { getDateRange, } from '../utils/date-range.filter'
import { StatisticTrackingService, } from 'src/modules/statistic-tracking/services/statistic-tracking.service'
import { CalculationService, } from 'src/modules/calculation/calculation.service'

@Injectable()
export class InvoiceContractorService {
	constructor(private readonly prisma : PrismaService,
		private readonly statisticTrackingService : StatisticTrackingService,
		private readonly calculationService : CalculationService,
	) {}

	public async getInvoices(userId:string, data: SearchInvoicesDto,): Promise<PagedCountResDto<ContractorInvoiceDto>> {
		const where: Prisma.ContractorInvoiceWhereInput = {
			contractor_id: userId,
			Booking:       {
				address: {
					contains: data.search,
					mode:     'insensitive',
				},
			},
		}
		const [invoices, count,] = await Promise.all([this.prisma.contractorInvoice.findMany({
			where,
			skip:    data.skip,
			take:    data.take,
			include: {
				Booking: {
					select: {
						id:        true,
						address:   true,
						date_time: true,
						office:    {
							select: {
								name: true,
							},
						},
					},
				},
			},
		},), this.prisma.contractorInvoice.count({
			where,
		},),],)

		return {
			data:    ContractorInvoicesDto.cast(invoices,).invoices,
			count,
			hasNext: count > data.skip + data.take,
		}
	}

	public async createInvoice(data: Prisma.ContractorInvoiceCreateInput,): Promise<ContractorInvoiceDto> {
		const invoice = await this.prisma.contractorInvoice.create({
			data,
			include: {
				Booking: {
					select: {
						id:        true,
						address:   true,
						date_time: true,
					},
				},
			},
		},)

		await this.statisticTrackingService.createStatistic({
			contractor: {
				connect: {
					id: invoice.contractor_id,
				},
			},
			type:         StatisticType.CONTRACTOR_INVOICE_CREATED,
			payload:      {
				amount: invoice.sum,
			},
		},)

		return ContractorInvoiceDto.cast(invoice,)
	}

	public async getContractorInvoiceStatistic(userId: string, data: StatisticInvoicesDto,): Promise<ContractorInvoiceStatisticDto> {
		const { dateRange, } = data
		const dateFilter = getDateRange(dateRange,)

		console.log(dateFilter,)

		const [invoicesSum,jobsProgress, totalJobs,totalDuration,] = await Promise.all([
			this.prisma.contractorInvoice.aggregate({
				_sum:  { sum: true, },
				where: { contractor_id: userId, created_at: dateFilter, },
			},),
			this.prisma.booking.count({
				where: {
					contractorId:   userId,
					booking_status: BookingStatus.IN_PROGRESS,
					date_time:      dateFilter,
				},
			},),
			this.prisma.booking.count({
				where: { contractorId: userId, date_time: dateFilter, },
			},),
			this.prisma.booking.aggregate({
				_sum: {
					duration: true,
				},
				where: {
					contractorId: userId,
					date_time:    dateFilter,
				},
			},),
		],)

		return {
			totalInvoicesSum: invoicesSum._sum.sum ?? 0,
			jobsInProgress:   jobsProgress,
			totalJobs,
			totalDuration:    totalDuration._sum.duration ?? 0,
		}
	}

	public async createManyInvoices(contractorId: string, bookingIds: Array<string>,): Promise<void> {
		const firstAdmin = await this.prisma.admin.findFirst({
			where:  {},
			select: {
				id: true,
			},
		},)

		if (!firstAdmin) {
			throw new NotFoundException('No admin found',)
		}

		for (const bookingId of bookingIds) {
			const contractorSalaryBooking = await this.calculationService.calculateBookingContractorPayment(bookingId,)

			await this.prisma.contractorInvoice.create({
				data: {
					contractor_id: contractorId,
					admin_id:      firstAdmin.id,
					bookingId,
					sum:           contractorSalaryBooking,
					status:        InvoiceContractor.PAID,
				},
			},)
		}
	}
}

