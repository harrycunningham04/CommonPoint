import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'

import type {
	StatisticDto,
	StatisticRegion,
	StatisticContractor,
} from '../dto/get-revenue.dto'
import {
	startOfMonth,
	endOfMonth,
	getDate,
	startOfWeek,
	endOfWeek,
	differenceInWeeks,
} from 'date-fns'
import { BookingStatus, } from '@prisma/client'
import { ContractorService, } from 'src/modules/contractor/services/contractor.service'

@Injectable()
export class StatisticSalesService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly contractorService: ContractorService,
	) {}

	public async getMonthlyRevenueStats(data: StatisticDto,) {
		const { year, month, } = data
		const startDate = startOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const endDate = endOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const bookings = await this.prisma.booking.findMany({
			where: {
				date_time: {
					gte: startDate,
					lte: endDate,
				},
			},
			select: {
				date_time: true,
				total_sum: true,
			},
		},)

		const dailyRevenue = Array.from({ length: 31, }, (_, index,) => {
			return {
				day:   index + 1,
				value: 0,
			}
		},)
		const weeklyRevenue = [
			{ name: '1 Week', value: 0, },
			{ name: '2 Week', value: 0, },
			{ name: '3 Week', value: 0, },
			{ name: '4 Week', value: 0, },
		]
		console.log(bookings,)

		bookings.forEach((booking,) => {
			const localDateTime = new Date(booking.date_time,)

			const day = localDateTime.getDate()
			const week = Math.ceil(day / 7,)

			// @ts-ignore
			dailyRevenue[day - 1].value += parseFloat(booking.total_sum,)
			// @ts-ignore
			weeklyRevenue[week - 1].value += parseFloat(booking.total_sum,)
		},)

		return { daily: dailyRevenue, weekly: weeklyRevenue, }
	}

	public async getCancelBooking(data: StatisticDto,) {
		const { year, month, } = data

		const bookings = await this.prisma.booking.findMany({
			where: {
				date_time: {
					gte: new Date(Number(year,), Number(month,) - 1, 1,),
					lt:  new Date(Number(year,), Number(month,), 1,),
				},
			},
			select: {
				date_time:      true,
				booking_status: true,
			},
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate() // отримуємо кількість днів у місяці

		// статистика по дням
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
			if (booking.booking_status === BookingStatus.CANCELED) {
				// @ts-ignore
				cancelBookingStats[day - 1].canceled += 1
			}
		},)

		// обчислюємо відсоток скасованих замовлень для кожного дня
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
			const weekIndex = Math.min(Math.floor((day - 1) / 7,), 3,) // обмежуємо до 4 тижнів (індекси 0-3)
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
			daily:      dailyResult,
			weekly:     weeklyResult,
			comparison: dailyResult,
		}
	}

	public async getAvarageBookingRevenue(data: StatisticDto,) {
		const { year, month, } = data

		const bookings = await this.prisma.booking.findMany({
			where: {
				date_time: {
					gte: new Date(Number(year,), Number(month,) - 1, 1,),
					lt:  new Date(Number(year,), Number(month,), 1,),
				},
			},
			select: {
				date_time: true,
				total_sum: true,
			},
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate()

		const dailyRevenueStats = Array.from({ length: daysInMonth, }, (_, i,) => {
			return {
				day:           i + 1,
				totalRevenue:  0,
				totalBookings: 0,
			}
		},)
		bookings.forEach((booking,) => {
			const day = booking.date_time.getDate()
			// @ts-ignore
			dailyRevenueStats[day - 1].totalRevenue += Number(booking.total_sum,)
			// @ts-ignore

			dailyRevenueStats[day - 1].totalBookings += 1
		},)
		const dailyResult = dailyRevenueStats.map(
			({ day, totalRevenue, totalBookings, },) => {
				console.log(
					`Day: ${day}, Total Revenue: ${totalRevenue}, Total Bookings: ${totalBookings}`,
				)
				const averageRevenue =
          totalBookings > 0 ?
          	totalRevenue / totalBookings :
          	0
				return {
					day,
					value: averageRevenue,
				}
			},
		)
		const weeklyStats = [
			{ name: '1 Week', totalRevenue: 0, totalBookings: 0, },
			{ name: '2 Week', totalRevenue: 0, totalBookings: 0, },
			{ name: '3 Week', totalRevenue: 0, totalBookings: 0, },
			{ name: '4 Week', totalRevenue: 0, totalBookings: 0, },
		]
		dailyRevenueStats.forEach(({ day, totalRevenue, totalBookings, },) => {
			const weekIndex = Math.min(Math.floor((day - 1) / 7,), 3,)
			// @ts-ignore

			weeklyStats[weekIndex].totalRevenue += totalRevenue
			// @ts-ignore
			weeklyStats[weekIndex].totalBookings += totalBookings
		},)
		const weeklyResult = weeklyStats.map(
			({ name, totalRevenue, totalBookings, },) => {
				const averageRevenue =
          totalBookings > 0 ?
          	totalRevenue / totalBookings :
          	0
				return {
					name,
					value: averageRevenue,
				}
			},
		)
		return {
			daily:  dailyResult,
			weekly: weeklyResult,
		}
	}

	public async getRevenueByContractor(data: StatisticContractor,) {
		const { year, month, contractorId, } = data

		const firstContractor = await this.prisma.contractor.findFirst({
			select: { id: true, },
		},)

		const bookings = await this.prisma.booking.findMany({
			where: {
				contractorId: contractorId || firstContractor?.id,
				date_time:    {
					gte: new Date(Number(year,), Number(month,) - 1, 1,),
					lt:  new Date(Number(year,), Number(month,), 1,),
				},
			},
			select: {
				date_time: true,
				total_sum: true,
			},
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate()

		const dailyRevenueStats = Array.from({ length: daysInMonth, }, (_, i,) => {
			return {
				day:   i + 1,
				value: 0,
			}
		},)
		bookings.forEach((booking,) => {
			const day = booking.date_time.getDate()
			// @ts-ignore
			dailyRevenueStats[day - 1].value += Number(booking.total_sum,)
		},)

		const weeklyRevenueStats = [
			{ name: '1 Week', value: 0, },
			{ name: '2 Week', value: 0, },
			{ name: '3 Week', value: 0, },
			{ name: '4 Week', value: 0, },
		]
		dailyRevenueStats.forEach(({ day, value, },) => {
			const weekIndex = Math.min(Math.floor((day - 1) / 7,), 3,)
			// @ts-ignore
			weeklyRevenueStats[weekIndex].value += value
		},)
		return {
			daily:  dailyRevenueStats,
			weekly: weeklyRevenueStats,
		}
	}

	public async getRevenueContractorData() {
		const contractorsData = await this.prisma.contractor.findMany({
			select: {
				id:      true,
				name:    true,
				surname: true,
			},
		},)

		return contractorsData
	}

	public async getNewClientsStatistic(data: StatisticDto,) {
		const { month, year, } = data

		const startDate = startOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const endDate = endOfMonth(new Date(Number(year,), Number(month,) - 1,),)
		const b2cClients = await this.prisma.b2CClients.findMany({
			where: {
				created_at: {
					gte: startDate,
					lte: endDate,
				},
			},
		},)

		const b2bClients = await this.prisma.b2BClients.findMany({
			where: {
				created_at: {
					gte: startDate,
					lte: endDate,
				},
			},
		},)

		const allClients = [...b2cClients, ...b2bClients,]

		const dailyStats = Array(31,)
			.fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
				}
			},)
		allClients.forEach((client,) => {
			const day = getDate(client.created_at,)
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
		allClients.forEach((client,) => {
			const weekNumber = Math.min(
				differenceInWeeks(client.created_at, startDate,),
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

	public async getRegionData() {
		const regions = await this.prisma.region.findMany({
			where: {
				Booking: {
					some: {},
				},
			},
			select: {
				id:   true,
				name: true,
			},
		},)

		return regions
	}

	public async getRegionRevenue(data: StatisticRegion,) {
		const {regionId,} = data

		const defaultRegionId = await this.prisma.region.findFirst({
			where: {
				Booking: {
					some: {},
				},
			},
			select: {
				id: true,
			},
		},)

		const bookings = await this.prisma.booking.findMany({
			where: {
				regionId: regionId || defaultRegionId?.id,
			},
			select: {
				total_sum: true,
				date_time: true,
			},
		},)

		const dailyRevenue = Array.from({ length: 31, }, (_, i,) => {
			return {
				day:   i + 1,
				value: 0,
			}
		},)
		const weeklyRevenue = Array.from({ length: 4, }, (_, i,) => {
			return {
				name:  `${i + 1} Week`,
				value: 0,
			}
		},)
		bookings.forEach((booking,) => {
			const date = new Date(booking.date_time,)
			const day = date.getDate()
			const week = this.getWeekNumber(date,)

			// @ts-ignore
			dailyRevenue[day - 1].value += parseFloat(booking.total_sum,)
			// @ts-ignore

			weeklyRevenue[week - 1].value += parseFloat(booking.total_sum,)
		},)

		return {
			daily:  dailyRevenue,
			weekly: weeklyRevenue,
		}
	}

	private getWeekNumber(date: Date,): number {
		const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1,)
		const firstDayWeekday = firstDayOfMonth.getDay()
		const dayOfMonth = date.getDate()

		return Math.ceil((dayOfMonth + firstDayWeekday) / 7,)
	}
}
