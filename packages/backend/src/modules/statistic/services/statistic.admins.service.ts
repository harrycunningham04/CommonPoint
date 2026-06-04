import { BadRequestException, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { StatisticBookingClient, StatisticDto, } from '../dto/get-revenue.dto'

import { startOfMonth, endOfMonth, getDate, differenceInWeeks, endOfWeek, startOfWeek, } from 'date-fns'
import type { Prisma,} from '@prisma/client'
import { BookingStatus, } from '@prisma/client'

@Injectable()
export class StatisticAdminsService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getTotalBookingsStatistic(data: StatisticDto,) {
		const { month, year, } = data

		const startDate = startOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const endDate = endOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const bookings = await this.prisma.booking.findMany({
			where: {
				date_time: {
					gte: startDate,
					lte: endDate,
				},
			},
		},)

		const dailyStats = Array(31,)
			.fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
				}
			},)
		bookings.forEach((booking,) => {
			const day = getDate(booking.date_time,)
			// @ts-ignore
			dailyStats[day - 1].value += 1
		},)
		const weeklyStats = Array(4,)
			.fill(0,)
			.map((_, index,) => {
				return {
					name:  `${index + 1} Week`,
					value: 0,
				}
			},)
		bookings.forEach((booking,) => {
			const weekNumber = Math.min(
				differenceInWeeks(booking.date_time, startDate,),
				3,
			)
			// @ts-ignore
			weeklyStats[weekNumber].value += 1
		},)
		return {
			daily:  dailyStats,
			weekly: weeklyStats,
		}
	}

	public async getBookingPerClientData(isBrand:boolean,) {
		const b2cTransformed = await this.prisma.b2CClients.findMany({
			select: {
				id:        true,
				firstName: true,
				lastName:  true,
			},
		},)

		const b2bTransformed = await this.prisma.b2BClients.findMany({
			select: {
		  id:        true,
		  firstName: true,
		  lastName:  true,
			},
	  },)

		return { clients: isBrand ?
			b2bTransformed :
			b2cTransformed,  }
	}

	public async getBookingPerClient(data: StatisticBookingClient,) {
		const { month, year, clientId, } = data

		const startDate = startOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const endDate = endOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		let selectedClientId = clientId
		let isB2CClient = true

		if (!selectedClientId) {
			const firstB2CClient = await this.prisma.b2CClients.findFirst({
				select: { id: true, },
			},)

			if (firstB2CClient) {
				selectedClientId = firstB2CClient.id
				isB2CClient = true
			} else {
				const firstB2BClient = await this.prisma.b2BClients.findFirst({
					select: { id: true, },
				},)

				if (!firstB2BClient) {
					throw new BadRequestException('No clients found.',)
				}

				selectedClientId = firstB2BClient.id
				isB2CClient = false
			}
		} else {
			const b2cClient = await this.prisma.b2CClients.findUnique({
				where: { id: selectedClientId, },
			},)

			isB2CClient = Boolean(b2cClient,)
		}

		const bookings = await this.prisma.booking.findMany({
			where: {
				date_time: {
					gte: startDate,
					lte: endDate,
				},
				...(isB2CClient ?
					{ b2CClientsId: selectedClientId, } :
					{ b2BClientsId: selectedClientId, }),
			},
		},)

		const dailyStats = Array(31,).fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
				}
			},)
		bookings.forEach((booking,) => {
			const day = getDate(booking.date_time,)
			// @ts-ignore

			dailyStats[day - 1].value += 1
		},)
		const numberOfWeeks = Math.min(differenceInWeeks(endDate, startDate,) + 1, 4,)
		const weeklyStats = Array(numberOfWeeks,).fill(0,)
			.map((_, index,) => {
				return {
					name:  `${index + 1} Week`,
					value: 0,
				}
			},)
		bookings.forEach((booking,) => {
			const weekNumber = differenceInWeeks(booking.date_time, startDate,)
			if (weekNumber < numberOfWeeks) {
				// @ts-ignore

				weeklyStats[weekNumber].value += 1
			}
		},)

		return {
			daily:  dailyStats,
			weekly: weeklyStats,
		}
	}

	public async getBookingCancelPercent(data: StatisticDto,isCancel:boolean,) {
		const { month, year, } = data
		const startDate = startOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const endDate = endOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const bookings = await this.prisma.booking.findMany({
	  where: {
				date_time: {
		  gte: startDate,
		  lte: endDate,
				},
	  },
		},)

		const dailyStats = Array(31,).fill(0,)
			.map((_, index,) => {
				return {
	  day:      index + 1,
	  value:    0,
	  canceled: 0,
				}
			},)
		const numberOfWeeks = differenceInWeeks(endDate, startDate,) + 1
		const weeklyStats = Array(numberOfWeeks,).fill(0,)
			.map((_, index,) => {
				return {
	  name:     `${index + 1} Week`,
	  value:    0,
	  canceled: 0,
				}
			},)
		bookings.forEach((booking,) => {
	  const day = getDate(booking.date_time,)
	  const weekNumber = differenceInWeeks(booking.date_time, startDate,)

	  const stautus = isCancel ?
				BookingStatus.CANCELED :
				BookingStatus.BOOKED
	  if (booking.booking_status === stautus) {
				// @ts-ignore
				dailyStats[day - 1].canceled += 1
				// @ts-ignore
				weeklyStats[weekNumber].canceled += 1
	  }
			// @ts-ignore

			dailyStats[day - 1].value += 1
			// @ts-ignore

	  weeklyStats[weekNumber].value += 1
		},)
		const dailyPercentages = dailyStats.map((stat,) => {
			return {
	  day:   stat.day,
	  value: stat.value === 0 ?
					0 :
					(stat.canceled / stat.value) * 100,
			}
		},)
		const weeklyPercentages = weeklyStats.map((stat,) => {
			return {
	  name:  stat.name,
	  value: stat.value === 0 ?
					0 :
					(stat.canceled / stat.value) * 100,
			}
		},)
		return {
	  daily:  dailyPercentages,
	  weekly: weeklyPercentages,
		}
	}

	public async getBookingBrandStats(data: StatisticBookingClient,) {
		const { month, year, clientId, } = data
		const startDate = startOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const endDate = endOfMonth(new Date(Number(year,), Number(month,) - 1,),)

		// @ts-ignore
		const selectedClientId = clientId || (await this.prisma.b2BClients.findFirst()).id

		const bookings = await this.prisma.booking.findMany({
			where: {
				b2BClients: {
					id: selectedClientId,
				},
				date_time: {
					gte: startDate,
					lte: endDate,
				},
			},
		},)

		const dailyStats = Array(31,).fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
				}
			},)
		const maxWeeks = 4
		const numberOfWeeks = Math.min(differenceInWeeks(endDate, startDate,) + 1, maxWeeks,)

		const weeklyStats = Array(numberOfWeeks,).fill(0,)
			.map((_, index,) => {
				return {
					name:  `${index + 1} Week`,
					value: 0,
				}
			},)
		bookings.forEach((booking,) => {
			const day = getDate(booking.date_time,)
			const weekNumber = Math.min(differenceInWeeks(booking.date_time, startDate,), maxWeeks - 1,)

			// @ts-ignore
			dailyStats[day - 1].value += 1
			// @ts-ignore
			weeklyStats[weekNumber].value += 1
		},)
		return {
			daily:  dailyStats,
			weekly: weeklyStats,
		}
	}

	public async getBookingRepeatAmount(data: StatisticDto,) {
		const { month, year, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const selectObj: Prisma.BookingSelect = {
			repeat:    true,
			date_time: true,
		}
		const bookings = await this.prisma.booking.findMany({
			where: {
				repeat:    true,
				date_time: {
					gte: startDate,
					lte: endDate,
				},
			},select: selectObj,
		},)

		const dailyData = Array(getDate(endDate,),).fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
				}
			},)
		const numberOfWeeks = Math.min(differenceInWeeks(endDate, startDate,) + 1, 4,)
		const weeklyData = Array(numberOfWeeks,).fill(0,)
			.map((_, index,) => {
				return {
					name:  `${index + 1} Week`,
					value: 0,
				}
			},)
		bookings.forEach((booking,) => {
			const bookingDate = new Date(booking.date_time,)
			const day = getDate(bookingDate,)
			const weekIndex = Math.floor((day - 1) / 7,)

			if (bookingDate >= startDate && bookingDate <= endDate) {
				// @ts-ignore
				dailyData[day - 1].value += 1
			}

			const bookingWeekStart = startOfWeek(bookingDate, { weekStartsOn: 1, },)
			const bookingWeekEnd = endOfWeek(bookingDate, { weekStartsOn: 1, },)
			if (bookingDate >= bookingWeekStart && bookingDate <= bookingWeekEnd) {
				if (weekIndex < numberOfWeeks) {
					// @ts-ignore
					weeklyData[weekIndex].value += 1
				}
			}
		},)

		return {
			daily:  dailyData,
			weekly: weeklyData,
		}
	}

	public async getFulfitmentRateStatistic(data:StatisticDto,) {
		const { month, year, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const bookings = await this.prisma.booking.findMany({
			where: {
				created_at: {
					gte: startDate,
					lte: endDate,
				},
			},select: {
				booking_status: true,
				date_time:      true,
			},
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate()

		const cancelBookingStats = Array.from({ length: daysInMonth, }, (_, i,) => {
			return {
				day:      i + 1,
				canceled: 0,
				total:    0,
			}
		},)
		bookings.forEach((booking,) => {
			const day = booking.date_time.getDate()
			// @ts-ignore
			cancelBookingStats[day - 1].total += 1
			if (booking.booking_status === BookingStatus.DONE) {
				// @ts-ignore
				cancelBookingStats[day - 1].canceled += 1
			}
		},)

		const dailyResult = cancelBookingStats.map(({ day, canceled, total, },) => {
			const cancelPercentage = total > 0 ?
				(canceled / total) * 100 :
				0
			return {
				day,
				value: cancelPercentage,
			}
		},)

		const weeklyStats = [
			{ name: '1 Week', canceled: 0, total: 0, },
			{ name: '2 Week', canceled: 0, total: 0, },
			{ name: '3 Week', canceled: 0, total: 0, },
			{ name: '4 Week', canceled: 0, total: 0, },
		]
		cancelBookingStats.forEach(({ day, canceled, total, },) => {
			const weekIndex = Math.min(Math.floor((day - 1) / 7,), 3,)
			// @ts-ignore

			weeklyStats[weekIndex].total += total
			// @ts-ignore

			weeklyStats[weekIndex].canceled += canceled
		},)
		const weeklyResult = weeklyStats.map(({ name, canceled, total, },) => {
			const cancelPercentage = total > 0 ?
				(canceled / total) * 100 :
				0
			return {
				name,
				value: cancelPercentage,
			}
		},)

		return {
			daily:  dailyResult,
			weekly: weeklyResult,
		}
	}
}
