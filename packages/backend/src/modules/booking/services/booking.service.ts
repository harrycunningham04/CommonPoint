/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable max-lines */
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { FilterDto, GetBookingsDto, } from '../dto/get-bookings.dto'
import type { BookingListColumns, OrderListColumns,} from '@prisma/client'
import { BookingStatus, ContractorTransportation, EditRequestType, } from '@prisma/client'
import {
	BookingStage,
	BookingType,
	ClientStatus,
	Prisma,
	type Booking,
} from '@prisma/client'
import type { CreateBookingDto, } from '../dto/create-booking.dto'
import { unparse, } from 'papaparse'

import type { Response, } from 'express'
import { addDays, addMinutes, format, getDay, isSameDay, } from 'date-fns'
import type { UploadFileBookingDto, } from '../dto/upload-file.dto'
import { UploadService, } from 'src/modules/upload/upload.service'
import ffmpeg from 'fluent-ffmpeg'
import * as path from 'path'
import ffmpeginst from '@ffmpeg-installer/ffmpeg'

import type { MaterialTypeContent, } from '../booking.types'
import { BookingUniqueSkills, MapInfoDto, type SkillDto, } from '../dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { BookingAdminListResDto, } from '../dto/booking-admin-list.res.dto'
import { BookingAdminDetailsDto, } from '../dto/booking-admin-detaIls.dto'
import { IncludeAllBookingInfo, SelectBookingSkills, } from '../booking.const'
import { BookingReportDto, } from '../dto/booking-report.dto'
import type { BookingCalendarAvailabilityDto, BookingCalendarResponseDto, GetBookingCalendarDto, UpdateBookingCalendarDto, UpdateCalendarRouteDto, } from '../dto/booking-calendar.dto'
import { BookingCalendarDto, BookingRouteDto, } from '../dto/booking-calendar.dto'
import { BookingContractorService, } from './booking-contractor.service'
import { AvailabilityService, } from 'src/modules/availability/availability.service'
import { parseDateToUTCStart, } from '../utils/parseDateToUTCStrt'
import { MapService, } from 'src/modules/map/map.service'
import { checkTravelTimeOverlaps, } from '../utils/checkTravelOverlaps'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { EditRequestDto, } from '../dto/booking-edit-request.dto'
@Injectable()
export class BookingService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
	private readonly bookingContractorService: BookingContractorService,
	private readonly availabilityService: AvailabilityService,
	private readonly mapService: MapService,
	) {
		ffmpeg.setFfmpegPath(ffmpeginst.path,)
	}

	public async getBookingsByClientId(clientId: string, query: PageOptionsDto,): Promise<PagedResDto<Booking>> {
		const { skip, take, } = query
		const where = {
			OR: [
				{ b2BClientsId: clientId, },
				{ b2CClientsId: clientId, },
			],
		}
		const bookings = await this.prisma.booking.findMany({
			where,
			include: {
				contractor: true,
				b2CClients: true,
				b2BClients: true,
			},
			orderBy: [
				{
					date_time: 'desc',
				},
			],
			take,
			skip,
		},)

		const totalCount = await this.prisma.booking.count({
			where,
		},)

		return {
			data:    bookings,
			hasNext: skip + take < totalCount,
		}
	}

	public async getBookingsBySubbrandId(subbrandId: string,): Promise<Array<Booking>> {
		return this.prisma.booking.findMany({
		  where:   { subbrandId, },
		  include: {
				contractor: true,
		  },
		},)
	}

	public async getBookingsByOfficeId(officeId: string, query: PageOptionsDto,): Promise<PagedResDto<Booking>> {
		const { skip, take, } = query
		const where = {
			officeId,
		}
		const bookings = await this.prisma.booking.findMany({
			where,
			include: {
				contractor: true,
				b2CClients: true,
				b2BClients: true,
			},
			orderBy: [
				{
					date_time: 'desc',
				},
			],
			take,
			skip,
		},)

		const totalCount = await this.prisma.booking.count({
			where,
		},)

		return {
			data:    bookings,
			hasNext: skip + take < totalCount,
		}
	}

	public async searchBookings(
		query: string,
	): Promise<Prisma.BookingWhereInput> {
		const [nameQuery, surnameQuery,] = query.split(' ',)
		return {
			OR: [
				{
					address: {
						contains: query,
						mode:     'insensitive',
					},
				},
				{
					contractor: {
						OR: [
							{
								AND: [
									{
										name: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
									{
										surname: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								AND: [
									{
										name: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
									{
										surname: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								email: {
									contains: query,
									mode:     'insensitive',
								},
							},
							{
								phone: {
									contains: query,
									mode:     'insensitive',
								},
							},
						],
					},
				},
				{
					b2CClients: {
						OR: [
							{
								AND: [
									{
										firstName: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
									{
										lastName: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								AND: [
									{
										firstName: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
									{
										lastName: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								email: {
									contains: query,
									mode:     'insensitive',
								},
							},
							{
								phoneNumber: {
									contains: query,
									mode:     'insensitive',
								},
							},
						],
					},
				},
				{
					b2BClients: {
						OR: [
							{
								AND: [
									{
										firstName: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
									{
										lastName: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								AND: [
									{
										firstName: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
									{
										lastName: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								email: {
									contains: query,
									mode:     'insensitive',
								},
							},
							{
								phoneNumber: {
									contains: query,
									mode:     'insensitive',
								},
							},
						],
					},
				},
			],
		}
	}

	public getBookingFiltersWhere(
		filter: FilterDto | undefined,
		isOrder: boolean,
		isDashboard: boolean = false,
	): Prisma.BookingWhereInput {
		const filterWhere: Prisma.BookingWhereInput = {}
		console.log('isDashboard', isDashboard,)

		if (filter) {
			const {
				showArchive,
				address,
				priority,
				statuses,
				contractors,
				clients,
				startDate,
				endDate,
				stages,
			} = filter

			console.log(showArchive, 'showArchive', typeof showArchive,)

			if (statuses && statuses.length > 0) {
				Object.assign(filterWhere, {
					booking_status: {
						in: statuses,
					},
				},)
			}

			if (stages && stages.length > 0) {
				Object.assign(filterWhere, {
					booking_stage: {
						hasSome: stages,
					},
				},)
			}

			if (priority) {
				const hasTrue = priority.includes('true',)
				const hasFalse = priority.includes('false',)

				if (hasTrue && hasFalse) {
				} else if (hasTrue) {
					Object.assign(filterWhere, {
						OR: [
							{
								b2CClients: {
									mark: ClientStatus.PRIORITIZED,
								},
							},
							{
								b2BClients: {
									officeStatus: ClientStatus.PRIORITIZED,
								},
							},
						],
					},)
				} else if (hasFalse) {
					Object.assign(filterWhere, {
						OR: [
							{
								b2CClients: {
									mark: {
										not: ClientStatus.PRIORITIZED,
									},
								},
							},
							{
								b2BClients: {
									officeStatus: {
										not: ClientStatus.PRIORITIZED,
									},
								},
							},
						],
					},)
				}
			}
			if (contractors && contractors.length > 0) {
				Object.assign(filterWhere, {
					contractorId: {
						in: contractors,
					},
				},)
			}

			if (address && address.length > 0) {
				Object.assign(filterWhere, {
					address: {
						in: address,
					},
				},)
			}

			if (clients) {
				Object.assign(filterWhere, {
					OR: [
						{
							b2CClientsId: {
								in: clients,
							},
						},
						{
							b2BClientsId: {
								in: clients,
							},
						},
					],
				},)
			}

			if (startDate && endDate) {
				Object.assign(filterWhere, {
					date_time: {
						gte: startDate,
						lte: endDate,
					},
				},)
			} else if (startDate) {
				Object.assign(filterWhere, {
					date_time: {
						gte: startDate,
					},
				},)
			} else if (endDate) {
				Object.assign(filterWhere, {
					date_time: {
						lte: endDate,
					},
				},)
			}

			if (showArchive === 'true') {
				Object.assign(filterWhere, {
					archived: true,
				},)
			}
		}
		if (isOrder) {
			Object.assign(filterWhere, {
				bookingType: BookingType.ORDER,
			},)
		} else {
			Object.assign(filterWhere, {
				bookingType: BookingType.BOOKING,
			},)
		}

		if (isDashboard) {
			const today = new Date()
			today.setHours(0, 0, 0, 0,)
			const tomorrow = new Date(today,)
			tomorrow.setDate(tomorrow.getDate() + 1,)

			Object.assign(filterWhere, {
				date_time: {
					gte: today,
					lt:  tomorrow,
				},
			},)
		}

		return filterWhere
	}

	public async filteredBookings(
		data: GetBookingsDto,
	): Promise<PagedResDto<BookingAdminListResDto>> {
		const { take,skip, search, filter, isOrder, isDashboard,} = data

		let where: Prisma.BookingWhereInput = {}

		if (search) {
			const searchWhere = await this.searchBookings(search,)
			where = {
				...where,
				...searchWhere,
			}
		}

		const isOrderBool = isOrder === 'true'
		const isDashboardBool = isDashboard === 'true'

		const filterWhere = this.getBookingFiltersWhere(filter, isOrderBool, isDashboardBool,)

		if (filterWhere) {
			where = {
				AND: [where, filterWhere,],
			}
		}

		let orderBy: Array<Prisma.BookingOrderByWithRelationInput> = []

		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = [
					{ b2CClients: { firstName: filter.sortDirection! as Prisma.SortOrder, }, },
					{ b2BClients: { firstName: filter.sortDirection! as Prisma.SortOrder, }, },
				]
			} else if (filter.sortBy === 'priority') {
				orderBy = [
					{ b2CClients: { mark: filter.sortDirection! as Prisma.SortOrder, }, },
					{ b2BClients: { officeStatus: filter.sortDirection! as Prisma.SortOrder, }, },
				]
			} else {
				orderBy = [
					{ booking_status: filter.sortDirection! as Prisma.SortOrder, },
				]
			}
		}

		const bookings = await this.prisma.booking.findMany({
			where,
			orderBy,
			include: {
				contractor:     true,
				b2CClients:     true,
				...SelectBookingSkills,
				// rawMaterial:    true,
				// editedMaterial: {
				// 	include: {
				// 		editRequest: {
				// 			include: {
				// 				editRequestMaterial: true,
				// 			},
				// 		},
				// 	},
				// },
				b2BClients:           true,
				worker:             true,
			},
			take,
			skip,
		},)

		console.log(where,)

		let sortedBookings = bookings
		if (filter?.sortBy === 'stage') {
			const statusOrderAsc = ['IN_PROGRESS', 'BOOKED', 'DONE', 'CANCELED',]
			const statusOrderDesc = ['CANCELED', 'DONE', 'BOOKED', 'IN_PROGRESS',]
			const statusOrder =
				filter.sortDirection === 'asc' ?
					statusOrderAsc :
					statusOrderDesc

			sortedBookings = bookings.sort(
				(a, b,) => {
					return statusOrder.indexOf(a.booking_status,) - statusOrder.indexOf(b.booking_status,)
				},
			)
		}

		const totalCount = await this.prisma.booking.count({
			where,
		},)

		return {
			data:   sortedBookings.map((booking,) => {
				return BookingAdminListResDto.cast(booking,)
			},),
			hasNext: totalCount > take + skip,
		}
	}

	public async getBookingAdminDetails(bookingId: string,): Promise<BookingAdminDetailsDto> {
		const booking = await this.prisma.booking.findUnique({
			where:   { id: bookingId, },
			include: IncludeAllBookingInfo,
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}
		return BookingAdminDetailsDto.cast(booking,)
	}

	public async changeBooking(
		id: string,
		data: Prisma.BookingUpdateInput,
	): Promise<Booking> {
		const currentBooking = await this.prisma.booking.findUnique({
			where:  { id, },
			select: {
				booking_stage:       true,
				contractorArrivedAt: true,
				bookingCompletedAt:  true,
			},
		},)

		if (!currentBooking) {
			throw new Error('Booking not found',)
		}

		const previousStages = currentBooking.booking_stage
		const newStages = data.booking_stage as Array<BookingStage> | undefined

		const isContractorArrived = newStages?.includes(BookingStage.CONTRACTOR_ARRIVED_ON_SITE,)
		const isBookingCompleted = newStages?.includes(BookingStage.DONE,)

		const updateData: Prisma.BookingUpdateInput = {
			...data,
		}
		if (isContractorArrived && !currentBooking.contractorArrivedAt) {
			updateData.contractorArrivedAt = new Date()
		}

		if (isBookingCompleted && !currentBooking.bookingCompletedAt) {
			updateData.bookingCompletedAt = new Date()
		}

		const isRepeat = previousStages.includes(BookingStage.FLOORPLAN_SKETCH_UPLOADED,) &&
      newStages?.includes(BookingStage.FLOORPLAN_IN_PROGRESS,)

		if (isRepeat) {
			updateData.repeat = true
		}

		if (data.address) {
			const location = await this.mapService.getCoordFromAddress(data.address as string,)
			updateData.location = {
				update: {
					placeId:   location?.placeId ?? '',
					latitude:  location?.lat ?? 0,
					longitude: location?.lng ?? 0,
				},
			}
		}

		const updatedBooking = await this.prisma.booking.update({
			where: { id, },
			data:  updateData,
		},)

		return updatedBooking
	}

	public async getBookingListColumns(): Promise<BookingListColumns> {
		const listColumns = await this.prisma.bookingListColumns.findFirst()

		return listColumns!
	}

	public async changeListColumns(
		body: Prisma.BookingListColumnsUpdateInput,
	): Promise<BookingListColumns> {
		const listColumns = await this.getBookingListColumns()
		const updated = await this.prisma.bookingListColumns.update({
			where: {
				id: listColumns.id,
			},
			data: body,
		},)

		return updated
	}

	public async exportBookingsItem(query: any, res: Response, isOrder: boolean,): Promise<void> {
		let where: Prisma.BookingWhereInput = {}
		const { page, limit, search, filter, } = query

		if (search) {
			const searchWhere = await this.searchBookings(search,)
			where = {
				...where,
				...searchWhere,
			}
		}

		const filterWhere = this.getBookingFiltersWhere(filter, isOrder,)

		if (filterWhere) {
			where = {
				AND: [where, filterWhere,],
			}
		}

		let orderBy: Prisma.BookingOrderByWithRelationInput = {}

		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = {
					b2CClients: { firstName: filter.sortDirection! as Prisma.SortOrder, },
				}
			} else if (filter.sortBy === 'priority') {
				orderBy = {
					b2CClients: { mark: filter.sortDirection! as Prisma.SortOrder, },
				}
			} else {
				orderBy = { booking_status: filter.sortDirection! as Prisma.SortOrder, }
			}
		}

		const bookings = await this.prisma.booking.findMany({
			where,
			orderBy,
			include: {
				contractor: true,
				b2CClients: true,
				b2BClients: true,
			},
		},)

		const csvDataBooking = bookings.map((booking,) => {
			const client = booking.b2CClients || booking.b2BClients

			const priority = booking.b2CClients ?
				(booking.b2CClients.mark === 'PRIORITIZED' ?
					'High priority' :
					'Standard') :
				(booking.b2BClients && booking.b2BClients.officeStatus === 'PRIORITIZED' ?
					'High priority' :
					'Standard')
			return {
				name:
          `${client?.firstName} ${client?.lastName}`,
				contactInfo: client?.phoneNumber,
				priority,
				dateTime:    format(booking.created_at, 'dd.MM.yyyy HH:mm',),
				address:     booking.address,
				contractor:  `${booking.contractor?.name} ${booking.contractor?.surname}`,
				stage:       booking.booking_status,
			}
		},)

		const csvDataOrder = bookings.map((booking,) => {
			const client = booking.b2CClients || booking.b2BClients

			const priority = booking.b2CClients ?
				(booking.b2CClients.mark === 'PRIORITIZED' ?
					'High priority' :
					'Standard') :
				(booking.b2BClients && booking.b2BClients.officeStatus === 'PRIORITIZED' ?
					'High priority' :
					'Standard')
			return {
				name:
          `${client?.firstName} ${client?.lastName}`,
				contactInfo: client?.phoneNumber,
				priority,
				dateTime:    format(booking.created_at, 'dd.MM.yyyy HH:mm',),
				contractor:  `${booking.contractor?.name} ${booking.contractor?.surname}`,
				stage:       booking.booking_status,
			}
		},)

		const csvData = unparse(
			isOrder ?
				csvDataOrder :
				csvDataBooking,
		)
		res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv',)
		res.setHeader('Content-Type', 'text/csv',)
		res.send(csvData,)
	}

	// public async findOneBooking (bookingId:string):Promise<Booking>{

	// }

	public async getOrderListColumns(userId: string,): Promise<OrderListColumns> {
		const listColumns = await this.prisma.orderListColumns.findFirst({
			where: { adminId: userId, },
		},)
		if (!listColumns) {
			return this.prisma.orderListColumns.create({
				data: {
					adminId: userId,
				},
			},)
		}
		return listColumns
	}

	public async changeOrderListColumns(
		userId: string,
		body: Prisma.OrderListColumnsUpdateInput,
	): Promise<OrderListColumns> {
		const updated = await this.prisma.orderListColumns.upsert({
			where: {
				adminId: userId,
			},
			create: {
				adminId: userId,
			},
			update: {
				...body,
			},
		},)

		return updated
	}

	public async findBooking(where: Prisma.BookingWhereInput,): Promise<Booking | null> {
		return this.prisma.booking.findFirst({
			where,
		},)
	}

	public async getBookingReport(bookingId: string,): Promise<PagedResDto<BookingReportDto>> {
		const bookingReport = await this.prisma.contractorDispute.findMany({
			where: {
				bookingId,
				report: {
					isNot: null,
				},
			},
			include: {
				report:     true,
				contractor: true,
			},
		},)

		return {
			data: bookingReport.map((report,) => {
				return BookingReportDto.cast(report,)
			},),
			hasNext: false,
		}
	}

	public async getBookingCalendar(query: GetBookingCalendarDto,): Promise<BookingCalendarResponseDto> {
		const { todayDate, isThreeDays, contractorIds, } = query

		const today = parseDateToUTCStart(todayDate,)
		const isThreeDaysBool = isThreeDays === 'true'
		const daysToAdd = isThreeDaysBool ?
			3 :
			1

		const isWeekend = (date: Date,): boolean => {
			const day = date.getUTCDay()
			return day === 0 || day === 6
		}
		const dateRange: Array<Date> = []
		const current = new Date(today,)
		while (dateRange.length < daysToAdd) {
			if (!isWeekend(current,)) {
				dateRange.push(new Date(current,),)
			}
			current.setUTCDate(current.getUTCDate() + 1,)
		}

		const lastDate = dateRange[dateRange.length - 1]
		const rangeEnd = new Date(lastDate!,)
		rangeEnd.setUTCDate(lastDate!.getUTCDate() + 1,)

		const where: Prisma.BookingWhereInput = {
			contractorId: {
				in: contractorIds,
			},
			date_time: {
				gte: today,
				lt:  rangeEnd,
			},
			booking_status: {
				not: BookingStatus.CANCELED,
			},
		}

		const [bookings, bookingAvailabilities,] = await Promise.all([
			this.prisma.booking.findMany({
				where,
				include: {
					contractor: {
						include: {
							ContractorLocation: true,
						},
					},
					bookingRoute: true,
					location:     true,
					keyLocation:  true,
					...SelectBookingSkills,
				},
			},),
			this.prisma.contractorAvailableDay.findMany({
				where: {
					contractor_id: {
						in: contractorIds,
					},
					date_time: {
						gte: today,
						lt:  rangeEnd,
					},
				},
			},),
		],)

		const durations = await this.bookingContractorService.getBookingsTimeEstimation(bookings,)
		const unavailableIntervals = await this.availabilityService.availabilityUnableInterval(bookingAvailabilities,)

		const isSameUTCDate = (d1: Date, d2: Date,): boolean => {
			return (
				d1.getUTCFullYear() === d2.getUTCFullYear() &&
				d1.getUTCMonth() === d2.getUTCMonth() &&
				d1.getUTCDate() === d2.getUTCDate()
			)
		}
		for (const contractorId of contractorIds) {
			for (const date of dateRange) {
				const hasAvailability = bookingAvailabilities.some((av,) => {
					return av.contractor_id === contractorId && isSameUTCDate(new Date(av.date_time,), date,)
				},)

				if (!hasAvailability) {
					unavailableIntervals.push({
						contractorId,
						dateTime:     date.toISOString(),
						availability: [[8, 18,],],
					},)
				}
			}
		}

		return {
			bookings: bookings.map((booking,) => {
				const duration = durations.find((d,) => {
					return d.id === booking.id
				},)
				return new BookingCalendarDto({
					id:           booking.id,
					dateTime:     booking.date_time,
					duration:     booking.duration ?? 0,
					contractorId: booking.contractorId ?? '',
					address:      booking.address ?? '',
					mapInfo:      new BookingRouteDto({
						id:                      booking.bookingRoute?.id ?? '',
						estimatedTimeToLocation: booking.bookingRoute?.duration ?? 0,
					},),
					uniqueSkills: BookingUniqueSkills.getUniqueSkills(booking,).map((skill,) => {
						return skill.name
					},),
				},)
			},),
		}
	}

	private checkLocation(location: {
		latitude: number | null,
		longitude: number | null,
	} | null,): {
		lat: number,
		lng: number,
	} {
		if (!location?.latitude || !location.longitude) {
			return {
				lat: 0,
				lng: 0,
			}
		}
		return {
			lat: location.latitude,
			lng: location.longitude,
		}
	}

	public async updateBookingCalendar(
		bookingId: string,
		body: UpdateBookingCalendarDto,
	  ): Promise<Array<BookingCalendarDto>> {
		const { previousBookingId, nextBookingId, dateTime, duration, contractorId, } = body

		const booking = await this.prisma.booking.findUnique({
			where:   { id: bookingId, },
			include: {
				bookingRoute: true,
			},
		},)
		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const start = new Date(dateTime ?? booking.date_time,)
		const end = addMinutes(start, duration ?? booking.duration ?? 0,)

		const endOfTheDay = new Date(start,)
		endOfTheDay.setHours(23, 59, 59, 999,)

		const allSpecificBookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time: {
					gte: start,
					lt:  endOfTheDay,
				},
			},
		},)

		const contractorAvailability = await this.prisma.contractorAvailableDay.findFirst({
			where: {
				contractor_id: contractorId,
				date_time:     {
					gte: start,
					lt:  endOfTheDay,
				},
			},
		},)

		const hasOverlap = allSpecificBookings.some((other,) => {
			if (other.id === booking.id) {
				return false
			}

			const otherStart = new Date(other.date_time,)
			const otherEnd = addMinutes(otherStart, other.duration ?? 0,)

			return start < otherEnd && end > otherStart
		},)

		const startHour = start.getHours()
		const endHour = end.getHours()

		let isInAvailableSlot = false

		if (contractorAvailability) {
			const { from, to, } = contractorAvailability

			isInAvailableSlot = from.some((startAvailable, index,) => {
				const endAvailable = to[index] ?? 0
				return startHour >= startAvailable && endHour <= endAvailable
			},)
		}

		if (false) {
			throw new ConflictException('Booking is outside contractor\'s availability',)
		}

		if (hasOverlap) {
			throw new ConflictException('Booking overlaps with another booking',)
		}
		const updatedBooking = await this.prisma.booking.update({
		  where: { id: bookingId, },
		  data:  {
				date_time: dateTime,
				contractorId,
				duration,
		  },
		  include: {
				contractor: {
			  include: { ContractorLocation: true, },
				},
				...SelectBookingSkills,
				location:     true,
				keyLocation:  true,
				bookingRoute: true,
		  },
		},)

		return [updatedBooking,].map((booking,) => {
			return new BookingCalendarDto({
				id:           booking.id,
				dateTime:     booking.date_time,
				duration:     booking.duration ?? 0,
				contractorId: booking.contractorId ?? '',
				address:      booking.address ?? '',
				uniqueSkills: BookingUniqueSkills.getUniqueSkills(booking,).map((skill,) => {
					return skill.name
				},),
				mapInfo:      new BookingRouteDto({
					id:                      booking.bookingRoute?.id ?? '',
					estimatedTimeToLocation: booking.bookingRoute?.duration ?? 0,
				},),
			},)
		},)
	}

	public async getEditRequest(bookingId: string, query: PageOptionsDto,): Promise<PagedResDto<EditRequestDto>> {
		const { take, skip, } = query

		const sessions = await this.prisma.editRequestSession.findMany({
			where: {
				bookingId,
				clientDisputeId: {
					equals: null,
				},
			},
			take,
			skip,
			orderBy: {
				createdAt: Prisma.SortOrder.desc,
			},
			include: {
				editRequests: {
					include: {
						editRequestMaterials: true,
						admin:                true,
					},
				},
			},
		},)

		const groupedEditRequests = await this.prisma.editRequest.findMany({
			where: {
				bookingId,
				type:            EditRequestType.GROUP_BY_CONTENT_TYPE,
				clientDisputeId: {
					equals: null,
				},
			},
			include: {
				admin:                true,
				editRequestMaterials: true,
			},
		},)

		const allEditRequests: Array<EditRequestDto> = [
			...EditRequestDto.castEditRequestSingle(sessions,),
			...EditRequestDto.castGroupedEditRequest(groupedEditRequests,),
		]

		const sortedEditRequests = allEditRequests.sort((a, b,) => {
			return new Date(b.dateTime,).getTime() - new Date(a.dateTime,).getTime()
		},
		)

		const paginatedEditRequests = sortedEditRequests.slice(skip, skip + take,)

		return {
			data:    paginatedEditRequests,
			hasNext: sortedEditRequests.length > skip + take,
		}
	}

	public async markBookingDone(bookingId: string,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId, },
		},)
		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		if (booking.booking_status === BookingStatus.DONE) {
			throw new BadRequestException('Booking already done',)
		}

		await this.prisma.booking.update({
			where: { id: bookingId, },
			data:  { booking_status: BookingStatus.DONE, bookingCompletedAt: new Date(), },
		},)
	}

	public async getBookingCalendarAvailability(query: GetBookingCalendarDto,): Promise<BookingCalendarAvailabilityDto> {
		const { todayDate, isThreeDays, contractorIds, } = query

		const today = parseDateToUTCStart(todayDate,)
		const isThreeDaysBool = isThreeDays === 'true'
		const daysToAdd = isThreeDaysBool ?
			3 :
			1

		const isWeekend = (date: Date,): boolean => {
			const day = date.getUTCDay()
			return day === 0 || day === 6
		}

		const dateRange: Array<Date> = []
		const current = new Date(today,)
		while (dateRange.length < daysToAdd) {
			if (!isWeekend(current,)) {
				dateRange.push(new Date(current,),)
			}
			current.setUTCDate(current.getUTCDate() + 1,)
		}

		const lastDate = dateRange[dateRange.length - 1]
		const rangeEnd = new Date(lastDate!,)
		rangeEnd.setUTCDate(lastDate!.getUTCDate() + 1,)

		const availability = await this.prisma.contractorAvailableDay.findMany({
			where: {
				contractor_id: {
					in: contractorIds,
				},
				date_time: {
					gte: today,
					lt:  rangeEnd,
				},
			},
		},)

		const unavailableIntervals = await this.availabilityService.availabilityUnableInterval(availability,)

		const isSameUTCDate = (d1: Date, d2: Date,): boolean => {
			return (
				d1.getUTCFullYear() === d2.getUTCFullYear() &&
				d1.getUTCMonth() === d2.getUTCMonth() &&
				d1.getUTCDate() === d2.getUTCDate()
			)
		}

		for (const contractorId of contractorIds) {
			for (const date of dateRange) {
				const hasAvailability = availability.some((av,) => {
					return av.contractor_id === contractorId && isSameUTCDate(new Date(av.date_time,), date,)
				},)

				if (!hasAvailability) {
					unavailableIntervals.push({
						contractorId,
						dateTime:     date.toISOString(),
						availability: [[8, 18,],],
					},)
				}
			}
		}

		return {
			unavailableIntervals,
		}
	}

	public async updateCalendarRoute(id: string, body: UpdateCalendarRouteDto,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: { id, },
		},)
		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const bookingRoute = await this.prisma.bookingRoute.findFirst({
			where: { bookingId: id, },
		},)
		if (!bookingRoute) {
			throw new NotFoundException('Booking route not found',)
		}

		const { duration, } = body

		await this.prisma.bookingRoute.update({
			where: { id: bookingRoute.id, },
			data:  { duration, },
		},)
	}
}
