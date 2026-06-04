/* eslint-disable max-depth */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-await-in-loop */
import { HttpException, Injectable, Logger, UseFilters, } from '@nestjs/common'
import { ClientsB2BService, } from '../clients/services/b2b.service'
import { StripeService, } from '../stripe/stripe.service'
import { InvoiceClientService, } from '../invoice/services/invoice-client.service'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { Cron, CronExpression, } from '@nestjs/schedule'
import type { Prisma,} from '@prisma/client'
import { BookingStage, BookingStatus, ContractorSkillNama, InvoiceStatus, NotificationCategory, NotificationType, NotificationUrgency, PaymentType, StatisticType, } from '@prisma/client'
import { StatisticTrackingService, } from '../statistic-tracking/services/statistic-tracking.service'
import { AvailabilityService, } from '../availability/availability.service'
import { BasicContractorService, } from '../contractor/services/basic-contractor.service'
import { BookingBasicService, } from '../booking/services/booking-basic.service'
import { BOOKING_PROCESSING_LIMIT, CONTRACTOR_PROCESSING_LIMIT, } from './task.const'
import { NotificationContractorService, } from '../notifications/services/notification-contractor.service'
import { addDays, getDate, startOfMonth, isSameDay, lastDayOfMonth, } from 'date-fns'
import { getContractorPayoutPeriod, } from './util/get-contractor-pay-period.util'
import { CalculationService, } from '../calculation/calculation.service'
import { ContractorPayoutService, } from '../contractor/services/contractor-payout-service'
import { InvoiceContractorService, } from '../invoice/services/invoice-contractor.service'
import { BookingGroupService, } from '../booking-group/booking-group.service'
import { groupByClientAndOffice, } from './util/group-by-b2b-client-id.util'
import { XeroService, } from '../xero/services/xero.service'
import { AdminService, } from '../admin/services/admin.service'

@Injectable()
@UseFilters(HttpExceptionFilter,)
export class TaskService {
	private isInvoiceProcessing = false

	private readonly CONTRACTORS_PROCESSING_LIMIT = 100

	constructor(
    private readonly b2bService: ClientsB2BService,
    private readonly stripeService: StripeService,
    private readonly invoiceService: InvoiceClientService,
		private readonly invoiceContractorService: InvoiceContractorService,
		private readonly statisticTrackingService: StatisticTrackingService,
		private readonly availabilityService: AvailabilityService,
		private readonly basicContractorService: BasicContractorService,
		private readonly bookingBasicService: BookingBasicService,
		private readonly notificationContractorService: NotificationContractorService,
		private readonly calculationService : CalculationService,
		private readonly contractorPayoutService: ContractorPayoutService,
		private readonly bookingGroupService: BookingGroupService,
		private readonly xeroService: XeroService,
		private readonly adminService: AdminService,
	) {}

	public async processInvoicesByClient(clientId: string,): Promise<void> {
		const endDate = new Date()
		// endDate.setDate(1,)
		// endDate.setHours(0,)
		// endDate.setMinutes(0,)
		// endDate.setSeconds(0,)
		// endDate.setMilliseconds(0,)

		const client = await this.b2bService.getBasicInfo(clientId,)

		if (!client) {
			throw new HttpException('Client not found', 404,)
		}
		let stripeClient = await this.stripeService.findCustomerByEmail(client.email,)
		if (!stripeClient) {
			stripeClient = await this.stripeService.createCustomer({
				email: client.email,
				name:  `${client.firstName} ${client.lastName}`,
			},)
		}

		if (!stripeClient.id) {
			throw new HttpException('Stripe client not found', 404,)
		}

		const invoice = await this.stripeService.createInvoice({
			customerId:    stripeClient.id,
			b2bCustomerId: client.id,
		},)
		const limit = 20

		const { data: invoicesData, count, } = await this.invoiceService.getInvoicesByClientId({
			clientId,
			endDate,
			param: PageOptionsDto.cast({
				page: 1,
				limit,
			},),
		},)

		if (count === 0) {
			throw new HttpException('No invoices found', 404,)
		}
		const pageCount = Math.ceil(count / limit,)

		const pageIteration = Array.from({ length: pageCount, }, (_, i,) => {
			return i + 1
		},)

		await pageIteration.reduce(async(promise, page,) => {
			await promise

			const { data: invoices, } = await this.invoiceService.getInvoicesByClientId({
				clientId,
				endDate,
				param: PageOptionsDto.cast({
					page,
					limit,
				},),
			},)

			await this.stripeService.createInvoiceItems({
				invoiceId:    invoice.id,
				customerId:   stripeClient?.id ?? '',
				invoiceItems: invoices.map((invoice,) => {
					return {
						id:     invoice.id,
						amount: Number(invoice.sum,),
					}
				},),
			},)
		}, Promise.resolve(),)

		await this.stripeService.sendInvoice(invoice.id,)

		const stripeInvoiceId = invoicesData.at(0,)?.stripeInvoiceId

		if (stripeInvoiceId) {
			await this.invoiceService.updateInvoicesSentToStripe({
				where: {
					stripeInvoiceId,
				},
				data: {
					stripeInvoiceId: invoice.id,
				},
			},)
		}

		await this.invoiceService.createInvoiceSentToStripe({
			client: {
				connect: {
					id: client.id,
				},
			},
			stripeInvoiceId: invoice.id,
		},)

		await this.invoiceService.updateManyInvoice({
			where: {
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
			},
			data: {
				status:          InvoiceStatus.SENT,
				stripeInvoiceId: invoice.id,
			},
		},)
	}

	@Cron(CronExpression.EVERY_DAY_AT_1AM,)
	public async processInvoices(): Promise<void> {
		if (this.isInvoiceProcessing) {
			return
		}
		this.isInvoiceProcessing = true

		const limit = 5
		let page = 1
		let isProcessing = true

		try {
			while (isProcessing) {
				const clients = await this.b2bService.getClientIdsWithUnpaidInvoices(PageOptionsDto.cast({
					page,
					limit,
				},),)
				Logger.log(`Processing invoices for ${clients.length} clients`, 'TaskService',)
				page = page + 1

				if (clients.length < limit) {
					isProcessing = false
				}

				if (clients.length === 0) {
					break
				}

				await clients.reduce(async(promise, client,) => {
					await promise
					await this.processInvoicesByClient(client,)
				}, Promise.resolve(),)
			}
			this.isInvoiceProcessing = false
		} finally {
			this.isInvoiceProcessing = false
		}
	}

	public async processBookingPhotoSla(pageNumber: number, where: Prisma.BookingWhereInput,): Promise<void> {
		const bookings = await this.bookingBasicService.getBookings({
			where,
			select: {
				id:            true,
				contractorId:  true,
				booking_stage: true,
			},
			skip: (pageNumber - 1) * BOOKING_PROCESSING_LIMIT,
			take: BOOKING_PROCESSING_LIMIT,
		},)

		if (bookings.length === 0) {
			return
		}

		const data: Array<Prisma.StatisticCreateManyInput> = bookings.map((booking,) => {
			return {
				contractorId:  booking.contractorId ?? '',
				payload:       {
					bookingId: booking.id,
				},
				type:          booking.booking_stage.includes(BookingStage.RAW_MATERIALS_UPLOADED,) ?
					StatisticType.BOOKING_PHOTO_SLA_FAILED :
					StatisticType.BOOKING_PHOTO_SLA,
			}
		},)

		await this.statisticTrackingService.createMany(data,)
	}

	@Cron(CronExpression.EVERY_DAY_AT_8PM,)
	public async processBookingsPhotoSla(): Promise<void> {
		const now = new Date()
		const startAt = new Date(now.setHours(0, 0, 0, 0,),)
		const endAt = new Date(now.setHours(23, 59, 59, 999,),)
		const where: Prisma.BookingWhereInput = {
			date_time: {
				gte: startAt,
				lte: endAt,
			},
			contractorId: {
				not: null,
			},
			BookingToProductType: {
				some: {
					productType: {
						productTypeSkills: {
							some: {
								skill: {
									name: ContractorSkillNama.PHOTO,
								},
							},
						},
					},
				},
			},
		}
		const count = await this.bookingBasicService.getCount({
			where,
		},)
		Logger.log(`Processing bookings for ${count} bookings`, 'TaskService',)
		if (!count) {
			return
		}

		const pageCount = Math.ceil(count / BOOKING_PROCESSING_LIMIT,)

		const pageIteration = Array.from({ length: pageCount, }, (_, i,) => {
			return i + 1
		},)

		await pageIteration.reduce(async(promise, page,) => {
			await promise
			await this.processBookingPhotoSla(page, where,)
		}, Promise.resolve(),)

		Logger.log('Bookings processed', 'TaskService',)
	}

	public async processContractorExpectedEarning(pageNumber: number, where: Prisma.ContractorWhereInput, date: Date,): Promise<void> {
		const contractors = await this.basicContractorService.getContractors({
			where,
			skip:   (pageNumber - 1) * CONTRACTOR_PROCESSING_LIMIT,
			take:   CONTRACTOR_PROCESSING_LIMIT,
			select: {
				id: true,
			},
		},)

		if (contractors.length === 0) {
			return
		}

		const availabilities = await this.availabilityService.getAvailableHoursInSpecificDayForContractors(
			contractors.map((contractor,) => {
				return contractor.id
			},),
			date,
		)

		const data: Array<Prisma.StatisticCreateManyInput> = availabilities.map(({ contractorId, availableHours, },) => {
			return {
				contractorId,
				payload:      {
					earning: availableHours * 100,
					unit:    'USD',
				},
				type:         StatisticType.CONTRACTOR_EXPECTED_EARNING,
			}
		},)

		await this.statisticTrackingService.createMany(data,)
	}

	@Cron(CronExpression.EVERY_DAY_AT_3AM,)
	public async processContractorExpectedEarnings(): Promise<void> {
		const now = new Date()
		const prevDay = new Date(now.setDate(now.getDate() - 1,),)

		const where: Prisma.ContractorWhereInput = {
			archived: false,
			onSite:   true,
		}

		const count = await this.basicContractorService.getCount(where,)

		Logger.log(`Processing contractor expected earnings for ${count} contractors`, 'TaskService',)

		if (!count) {
			return
		}

		const pageCount = Math.ceil(count / CONTRACTOR_PROCESSING_LIMIT,)

		const pageIteration = Array.from({ length: pageCount, }, (_, i,) => {
			return i + 1
		},)

		await pageIteration.reduce(async(promise, page,) => {
			await promise
			await this.processContractorExpectedEarning(page, where, prevDay,)
		}, Promise.resolve(),)
	}

	@Cron(CronExpression.EVERY_5_MINUTES,)
	public async checkPaymentStatus(): Promise<void> {
		const minutesForCheck = 30
		const now = new Date()
		now.setMinutes(now.getMinutes() - minutesForCheck,)
		await this.bookingBasicService.updateManyBookings({
			booking_status: BookingStatus.AWAITING_PAYMENT,
			date_time:      {
				lte: now,
			},
		}, {
			booking_status: BookingStatus.CANCELED,
		},)
	}

	@Cron(CronExpression.EVERY_DAY_AT_6PM, {timeZone: 'Europe/London',},)
	public async processContractors(): Promise<void> {
		Logger.log(`Starting notification creation for contractors`, 'TastService',)
		const where: Prisma.ContractorWhereInput = {
			archived: false,
		}

		const limit = this.CONTRACTORS_PROCESSING_LIMIT

		const total = await this.basicContractorService.getCount(where,)

		if (!total) {
			return
		}

		const pageCount = Math.ceil(total / limit,)
		let totalNotificationsCreated = 0

		const pages = Array.from({ length: pageCount, }, (_, i,) => {
			return i + 1
		},)

		await pages.reduce(async(prevPromise, page,) => {
			await prevPromise
			const result = await this.processPage(page, where, limit,)
			totalNotificationsCreated = totalNotificationsCreated + result
		}, Promise.resolve(),)
		Logger.log(`Finished. Total notifications created: ${totalNotificationsCreated}`, 'TastService',)
	}

	private async processPage(page: number, where: Prisma.ContractorWhereInput, limit: number,): Promise<number> {
		const contractors = await this.basicContractorService.getContractors({
			where,
			skip:   (page - 1) * limit,
			take:   limit,
			select: {
				id: true,
			},
		},)

		if (!contractors.length) {
			return 0
		}

		const notifications = contractors.map((contractor,) => {
			return {
				contractorId: contractor.id,
				message:      'Set up the availability',
				category:     NotificationCategory.CONTRACTOR_NO_AVAILABILITY_NEXT_WEEK,
				urgency:      NotificationUrgency.NORMAL,
			}
		},)

		const result = await this.notificationContractorService.createNotifications(notifications,)
		return result.count ?? 0
	}

	// @Cron('0 10 15,28-31 * *', { name: 'contractor-payout-task', timeZone: 'Europe/London',},)
	@Cron(CronExpression.EVERY_2_HOURS, { timeZone: 'Europe/London',},)
	public async processContractorPayout(): Promise<void> {
		Logger.log(`Starting contractor payout`, 'TastService',)

		// const period = getContractorPayoutPeriod()

		// if (!period) {
		// 	return
		// }

		const today = new Date()
		today.setHours(0, 0, 0, 0,)

		const endOfToday = new Date(today,)
		endOfToday.setHours(23, 59, 59, 999,)

		const period = {
			startDate: today,
			endDate:   endOfToday,
		}

		Logger.log(`Running contractor transfers creation for: ${period.startDate.toISOString()} - ${period.endDate.toISOString()}`,)

		try {
			const contractors = await this.basicContractorService.getContractorsPay(period.startDate, period.endDate,)
			const bookingIds: Set<string> = new Set()

			await contractors.reduce(async(prevPromise, contractor,) => {
				await prevPromise

				const contractorPrice = await this.calculationService.calculateBasicContractorPayment({
					startDate:    period.startDate,
					endDate:      period.endDate,
					contractorId: contractor.id,
				},)

				Logger.log(`Contractor ${contractor.fullName} salary: ${contractorPrice}`, 'TastService',)

				const adjustmentFees = await this.basicContractorService.getContractorAdjustmentFeesPrice(contractor.id,)

				const totalPrice = contractorPrice + adjustmentFees.bonus - adjustmentFees.penalty

				const contractorBookingIds = await this.bookingBasicService.getAllBookingIdsForContractor(
					contractor.id,
					period.startDate,
					period.endDate,
				)

				Logger.log(`Booking ids: ${contractorBookingIds.length}`, 'TastService',)

				if (contractorBookingIds.length === 0) {
					Logger.log(`No bookings found for contractor ${contractor.fullName}`, 'TastService',)
					return
				}

				Logger.log(`Try to create transfer for contractor ${contractor.fullName}`, 'TastService',)

				const transfer = await this.stripeService.transferToContractor(
					contractor.stripeId,
					Math.round(totalPrice * 100,),
				)

				await this.invoiceContractorService.createManyInvoices(contractor.id, contractorBookingIds,)

				contractorBookingIds.forEach((bookingId,) => {
					bookingIds.add(bookingId,)
				},)

				if (contractor.paymentType === PaymentType.BANK_PAYOUT) {
					await this.contractorPayoutService.createContractorPayout({
						contractorId: contractor.id,
						amount:       totalPrice,
						transferId:   transfer.id,
					},)
				}

				await this.basicContractorService.updateManyAdjustmentFeesStatus(adjustmentFees.ids,)

				Logger.log(`Transfer ${transfer.id} created for contractor ${contractor.fullName}`, 'TastService',)
			}, Promise.resolve(),)

			if (bookingIds.size > 0) {
				await this.bookingBasicService.updateManyBookings({
					id: {
						in: Array.from(bookingIds,),
					},
				}, {
					isContractorPaid: true,
				},)
			}
		} catch (error) {
			Logger.error(`Error processing contractor transfers: ${error}`, 'TastService',)
		}
	}

	@Cron(CronExpression.EVERY_5_MINUTES,)
	public async processContractorPayoutCron(): Promise<void> {
		const pendingPayouts = await this.contractorPayoutService.getContractorsPendingPayouts()
		Logger.log(`Processing ${pendingPayouts.length} pending payouts`, 'TastService',)

		if (pendingPayouts.length === 0) {
			Logger.log('No pending payouts found', 'TaskService',)
			return
		}

		for (const payout of pendingPayouts) {
			try {
				const transferStatus = await this.stripeService.getTransferStatus(payout.transferId,)

				if (transferStatus !== 'succeeded') {
					Logger.log(`Transfer ${payout.transferId} is not yet paid. Skipping...`, 'TaskService',)
					continue
				}
				const payoutStripe = await this.stripeService.payoutToContractor(payout.contractorStripeId, Math.round(payout.amount * 100,),)
				await this.contractorPayoutService.markPayoutAsPaid(payout.id,)
				Logger.log(`Payout ${payoutStripe.id} created for contractor ${payout.contractorId}`, 'TaskService',)
			} catch (error) {
				Logger.error(`Error processing contractor payout: ${error}`, 'TastService',)
			}
		}
	}

	// @Cron('59 23 28-31 * *', {
	// 	name: 'generateInvoices',
	//   },)
	@Cron(CronExpression.EVERY_2_HOURS, { timeZone: 'Europe/London',},)
	public async handleGenerateInvoices(): Promise<void> {
		// const today = new Date()
		// const tomorrow = new Date(today,)
		// tomorrow.setDate(today.getDate() + 1,)

		// if (tomorrow.getDate() === 1) {
		await this.generateInvoicesForMonth()
		// }
	}

	private async generateInvoicesForMonth(): Promise<void> {
		Logger.log('Starting monthly client invoices generation', 'TaskService',)
		const startOfMonthDate = startOfMonth(new Date(),)
		const endOfMonthDate = lastDayOfMonth(new Date(),)

		try {
			const bookingGroups = await this.bookingGroupService.getBookingGroupsForInvoiceGeneration(startOfMonthDate, endOfMonthDate,)

			if (bookingGroups.length === 0) {
				Logger.log('No booking groups to invoice this month', 'InvoiceService',)
				return
			}

			Logger.log(`Found ${bookingGroups.length} booking groups to invoice this month`, 'TaskService',)

			const groupsByClientAndOffice = groupByClientAndOffice(bookingGroups,)

			const adminId = await this.adminService.getFirstAdminId()

			for (const [clientId, officeMap,] of Object.entries(groupsByClientAndOffice,)) {
				for (const [officeId, bookingGroups,] of Object.entries(officeMap,)) {
					const totalPrice = bookingGroups.reduce((acc, bg,) => {
						return acc + bg.sumOfPrices
					}, 0,)

					await this.xeroService.createInvoiceAndSendToClient(
						clientId,
						totalPrice,
						bookingGroups.map((bg,) => {
							return bg.id
						},),
						officeId,
					)

					await this.invoiceService.createInvoice({
						office: {
							connect: {
								id: officeId,
							},
						},
						sum:             totalPrice.toString(),
						admin:           {
							connect: {
								id: adminId,
							},
						},
						bookingGroups:   {
							connect: bookingGroups.map((bg,) => {
								return {
									id: bg.id,
								}
							},),
						},
					},)

					// for (const bookingGroup of bookingGroups) {
					// 	await this.bookingGroupService.updateBookingGroup(bookingGroup.id, {
					// 		isPaid: true,
					// 	},)
					// }
				}
			}
		} catch (error) {
			Logger.error(`Error generating invoices for month: ${error}`, 'TaskService',)
		}
	}

	// @Cron('*/5 * * * * *', { timeZone: 'Europe/London', },)
	// public async processContractorMaterialUploadReminders(): Promise<void> {
	// 	logger.log('Starting contractor material upload reminders', 'TaskService',)

	// 	try {
	// 		const now = new Date()
	// 		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000,)

	// 		const where: Prisma.BookingWhereInput = {
	// 			contractorId: {
	// 				not: null,
	// 			},
	// 			booking_status: BookingStatus.IN_PROGRESS,
	// 			date_time: {
	// 				gte: twentyFourHoursAgo,
	// 			},
	// 			nOT: {
	// 				booking_stage: {
	// 					has: BookingStage.RAW_MATERIALS_UPLOADED,
	// 				},
	// 			},
	// 		}

	// 		const bookings = await this.bookingBasicService.getBookings({
	// 			where,
	// 			select: {
	// 				id:           true,
	// 				contractorId: true,
	// 				address:      true,
	// 				date_time:    true,
	// 			},
	// 			skip: 0,
	// 			// process in batches to avoid overwhelming the system
	// 			take: 50,
	// 		},)

	// 		if (bookings.length === 0) {
	// 			logger.log('No bookings requiring material upload reminders', 'TaskService',)
	// 			return
	// 		}

	// 		logger.log(`Found ${bookings.length} bookings requiring material upload reminders`, 'TaskService',)

	// 		const notifications = bookings.map((booking,) => {
	// 			return {
	// 				contractorId: booking.contractorId!,
	// 				bookingId:    booking.id,
	// 				title:        'Upload Materials Required',
	// 				message:      `Please upload materials for your booking at ${booking.address}`,
	// 				category:     NotificationCategory.BOOKING_MATERILAS_IN_PROGRESS,
	// 				urgency:      NotificationUrgency.URGENT,
	// 				type:         NotificationType.CONTRACTOR,
	// 			}
	// 		},)

	// 		const result = await this.notificationContractorService.createNotifications(notifications,)
	// 		logger.log(`Created ${result.count ?? 0} material upload reminder notifications`, 'TaskService',)
	// 	} catch (error) {
	// 		logger.error(`Error processing contractor material upload reminders: ${error}`, 'TaskService',)
	// 	}
	// }
}
