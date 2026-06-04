/* eslint-disable no-underscore-dangle */
import { Injectable, Logger, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { BookingStatus, NotificationCategory, NotificationUrgency, type Booking, type KeyLocation, type Location, type Prisma, } from '@prisma/client'
import { NotificationContractorService, } from 'src/modules/notifications/services/notification-contractor.service'

@Injectable()
export class BookingBasicService {
	constructor(
    private readonly prisma: PrismaService,
	private readonly notificationContractorService: NotificationContractorService,
	) {}

	public async getEarliestBookingsWithUniqueContractorIds({date, contractorIds,}:{date: {from: Date, to: Date,}, contractorIds: Array<string>,},): Promise<Array<{
		contractorId: string | null,
		date_time: Date | null,
		keyLocation: KeyLocation | null,
		location: Location | null,
	}>> {
		const earliestBookings = await this.prisma.booking.groupBy({
			where: {
				contractorId: {
					in: contractorIds,
				},
				date_time: {
					gte: date.from,
					lte: date.to,
				},
			},
			by:   ['contractorId',],
			_min: {
				date_time: true,
			},
		},)
		return this.prisma.booking.findMany({
			where: {
				OR: earliestBookings.map((b,) => {
					return {
						contractorId: b.contractorId,
						date_time:    b._min.date_time ?? new Date(),
					}
				},),
			},
			distinct: ['contractorId',],
			select:   {
				contractorId: true,
				date_time:    true,
				keyLocation:  true,
				location:     true,
			},
		},)
	}

	public async getBookings({where, select, skip, take,}:{where: Prisma.BookingWhereInput, select: Prisma.BookingSelect, skip: number, take: number,},): Promise<Array<Booking>> {
		return this.prisma.booking.findMany({
			where,
			select,
			skip,
			take,
		},)
	}

	public async getCount({where,}:{where: Prisma.BookingWhereInput,},): Promise<number> {
		return this.prisma.booking.count({
			where,
		},)
	}

	public async getBookingById({where, include,}:{where: Prisma.BookingWhereUniqueInput, include: Prisma.BookingInclude,},): Promise<Booking | null> {
		return this.prisma.booking.findUnique({
			where,
			include,
		},)
	}

	public async createNotificationsForBookingGroup(bookingGroupId: string,): Promise<void> {
		const where: Prisma.BookingWhereInput = {
			bookingGroupId,
		}

		const select: Prisma.BookingSelect = {
			id:           true,
			contractorId: true,
		}

		const limit = 10
		const total = await this.getCount({where,},)

		if (!total) {
			return
		}

		const pageCount = Math.ceil(total / limit,)
		const pages = Array.from({ length: pageCount, }, (_, i,) => {
			return i + 1
		},)

		await pages.reduce(async(prevPromise, page,) => {
			await prevPromise
			await this.processBookingGroupPage(page, where, select, limit,)
		}, Promise.resolve(),)
	}

	private async processBookingGroupPage(
		page: number,
		where: Prisma.BookingWhereInput,
		select: Prisma.BookingSelect,
		limit: number,): Promise<void> {
		const bookings = await this.getBookings({
			where,
			select,
			skip: (page - 1) * limit,
			take: limit,
		},)

		const notifications = bookings.filter((booking,) => {
			return booking.contractorId
		},)
			.map((booking,) => {
				return {
					contractorId: booking.contractorId!,
					bookingId:    booking.id,
					message:      `You have a new booking`,
					category:     NotificationCategory.BOOKINGS_NEW_BOOKING,
					urgency:      NotificationUrgency.NORMAL,
				}
			},)

		await this.notificationContractorService.createNotifications(notifications,)
	}

	public async updateManyBookings(where: Prisma.BookingWhereInput, data: Prisma.BookingUpdateInput,): Promise<void> {
		await this.prisma.booking.updateMany({
			where,
			data,
		},)
	}

	public async getAllBookingIdsForContractor(
		contractorId: string,
		startDate: Date,
		endDate: Date,
	): Promise<Array<string>> {
		const bookings = await this.prisma.booking.findMany({
			where: {
				OR: [
					{
						AND: [
							{ contractorId, },
							{ bookingCompletedAt: { gte: startDate, lte: endDate, }, },
							{ isContractorPaid: false, },
							{ booking_status: BookingStatus.DONE, },
						],
					},
					{
						AND: [
							{
								BookingToProductType: {
									some: {
										productType: {
											additionalProduct: {
												contractorId,
											},
										},
									},
								},
							},
							{ bookingCompletedAt: { gte: startDate, lte: endDate, }, },
							{ isContractorPaid: false, },
							{ booking_status: BookingStatus.DONE, },
						],
					},
				],
			},
			select: {
				id: true,
			},
		},)

		return bookings.map((booking,) => {
			return booking.id
		},)
	}
}