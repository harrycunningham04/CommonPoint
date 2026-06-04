import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { DRAFT, } from '../constants/draft'
import type { StatisticContractor,} from '../dto/get-revenue.dto'
import { StatisticDto, } from '../dto/get-revenue.dto'
import { startOfMonth, endOfMonth, getDate, differenceInWeeks, startOfDay, startOfWeek, endOfDay, endOfWeek, } from 'date-fns'
import type { Prisma,} from '@prisma/client'
import { BookingStatus, } from '@prisma/client'

@Injectable()
export class StatisticContractorService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getStatisticDraft() {
		return DRAFT
	}

	private async getSingleContractor() {
		const contractor = await this.prisma.contractor.findFirst({
			where:  {},
			select: { id: true, },
		},)

		return contractor?.id!
	}

	private async getBookingWhere({
		contractorId,
		select,
		startDate,
		endDate,
	}: {
    contractorId: string;
    select: Prisma.BookingSelect;
    startDate: Date;
    endDate: Date;
  },) {
		console.log(`CONTRACTOR ID ${contractorId}`,)

		const bookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time: {
					gte: startDate,
					lt:  endDate,
				},
			},
			select,
		},)

		return bookings
	}

	public async getSketchPercent(data: StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const contractorIdDefault = await this.getSingleContractor()

		const selectObj: Prisma.BookingSelect = {
			id:          true,
			date_time:   true,
			rawMaterial: {
				select: {
					contentType: true,
				},
			},
			editedMaterial: {
				select: {
					contentType: true,
				},
			},
		}
		const totalBookings = await this.getBookingWhere({
			contractorId: contractorId || contractorIdDefault,
			select:       { id: true, },
			startDate,
			endDate,
		  },)

		const bookingsWithSketch = await this.getBookingWhere({
			contractorId: contractorId || contractorIdDefault,
			select:       selectObj,
			startDate,
			endDate,
		},)

		const dailyData = Array(getDate(endDate,),)
			.fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
				}
			},)

		let bookingSketchesCount = 0

		bookingsWithSketch.forEach((booking,) => {
			const bookingDay = getDate(booking.date_time,)
			const hasSketches =
        booking.rawMaterial.some(
        	(material,) => {
        		return material.contentType === 'SKETCHES'
        	},
        ) ||
        booking.editedMaterial.some(
        	(material,) => {
        		return material.contentType === 'SKETCHES'
        	},
        )

			if (hasSketches) {
				// @ts-ignore
				dailyData[bookingDay - 1].value += 1
				bookingSketchesCount = bookingSketchesCount + 1
			}
		},)

		dailyData.forEach((dayData,) => {
			const dayBookings = bookingsWithSketch.filter(
				(booking,) => {
					return getDate(booking.date_time,) === dayData.day
				},
			).length

			if (dayBookings > 0) {
				dayData.value = (dayData.value / dayBookings) * 100
			}
		},)

		const maxWeeks = 4
		const numberOfWeeks = Math.min(
			differenceInWeeks(endDate, startDate,) + 1,
			maxWeeks,
		)
		const weeklyData = Array(numberOfWeeks,)
			.fill(0,)
			.map((_, index,) => {
				return {
					name:  `${index + 1} Week`,
					value: 0,
				}
			},)
		weeklyData.forEach((weekData, weekIndex,) => {
			const weekBookings = bookingsWithSketch.filter((booking,) => {
				const bookingDay = getDate(booking.date_time,)
				return Math.floor((bookingDay - 1) / 7,) === weekIndex
			},)
			const sketchBookings = weekBookings.filter(
				(booking,) => {
					return booking.rawMaterial.some(
						(material,) => {
							return material.contentType === 'SKETCHES'
						},
					) ||
          booking.editedMaterial.some(
          	(material,) => {
          		return material.contentType === 'SKETCHES'
          	},
          )
				},
			)
			if (weekBookings.length > 0) {
				weekData.value = (sketchBookings.length / weekBookings.length) * 100
			}
		},)

		const totalCount = totalBookings.length
		const sketchCount = bookingSketchesCount

		const percentNum = totalCount > 0 ?
			(sketchCount / totalCount) * 100 :
			0

		const percent = {
			percent:      parseFloat(percentNum.toFixed(2,),),
			percentTotal: totalCount,
			persentSolve: sketchCount,
		}

		return {
			daily:  dailyData,
			weekly: weeklyData,
			percent,
		}
	}

	public async getCancelationRateStatistic(data: StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const contractorIdDefault = await this.getSingleContractor()

		const selectObj: Prisma.BookingSelect = {
			date_time:      true,
			booking_status: true,
		}
		const bookings = await this.getBookingWhere({
			contractorId: contractorId || contractorIdDefault,
			select:       selectObj,
			startDate,
			endDate,
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate()

		const cancelBookingStats = Array.from({ length: daysInMonth, }, (_, i,) => {
			return {
				day:      i + 1,
				canceled: 0,
				total:    0,
			}
		},)

		let bookingCancelNum = 0

		bookings.forEach((booking,) => {
			const day = booking.date_time.getDate()
			// @ts-ignore
			cancelBookingStats[day - 1].total += 1
			if (booking.booking_status === BookingStatus.CANCELED) {
				// @ts-ignore
				cancelBookingStats[day - 1].canceled += 1
				bookingCancelNum = bookingCancelNum + 1
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

		const totalCount = bookings.length
		const sketchCount = bookingCancelNum

		const percentNum = totalCount > 0 ?
			(sketchCount / totalCount) * 100 :
			0

		const percent = {
		  percent:      parseFloat(percentNum.toFixed(2,),),
		  percentTotal: totalCount,
		  persentSolve: sketchCount,
		}

		return {
			daily:  dailyResult,
			weekly: weeklyResult,
			percent,
		}
	}

	public async getContractorEarningStatistic(data:StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const contractorIdDefault = await this.getSingleContractor()

		const selectObj: Prisma.BookingSelect = {
			total_sum: true,
			date_time: true,
	  }

	  const bookings = await this.getBookingWhere({
			contractorId: contractorId || contractorIdDefault,
			select:       selectObj,
			startDate,
			endDate,
	  },)
	  const dailyEarnings = Array(getDate(endDate,),).fill(0,)
			.map((_, index,) => {
				return {
					day:   index + 1,
					value: 0,
	  }
			},)
		const maxWeeks = 4
	  const numberOfWeeks = Math.min(differenceInWeeks(endDate, startDate,) + 1, maxWeeks,)

	  const weeklyEarnings = Array(numberOfWeeks,).fill(0,)
			.map((_, index,) => {
				return {
					name:  `${index + 1} Week`,
					value: 0,
	  }
			},)
		bookings.forEach((booking,) => {
			const bookingDay = getDate(booking.date_time,)
			// @ts-ignore
			dailyEarnings[bookingDay - 1].value += Number(booking.total_sum,)
	  },)

	  dailyEarnings.forEach((dayData, index,) => {
			const weekIndex = Math.floor(index / 7,)
			if (weekIndex < maxWeeks) {
				// @ts-ignore
		  weeklyEarnings[weekIndex].value += dayData.value
			}
	  },)

	  return {
			daily:  dailyEarnings,
			weekly: weeklyEarnings,
	  }
	}

	public async getPhotosEdited(data: StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const contractorIdDefault = await this.getSingleContractor()

		const bookings = await this.prisma.booking.findMany({
	  where: {
				contractorId: contractorId || contractorIdDefault,
				date_time:    {
		  gte: startDate,
		  lt:  endDate,
				},
	  },
	  select: {
				date_time:      true,
				editedMaterial: {
		  select: {
						contentType: true,
		  },
				},
	  },
		},)

		const dailyData = Array(getDate(endDate,),).fill(0,)
			.map((_, index,) => {
				return {
	  day:          index + 1,
	  totalPhotos:  0,
	  bookingCount: 0,
				}
			},)
		const maxWeeks = 4
		const numberOfWeeks = Math.min(differenceInWeeks(endDate, startDate,) + 1, maxWeeks,)

		const weeklyData = Array(numberOfWeeks,).fill(0,)
			.map((_, index,) => {
				return {
	  name:         `${index + 1} Week`,
	  totalPhotos:  0,
	  bookingCount: 0,
				}
			},)
		bookings.forEach((booking,) => {
	  const bookingDay = getDate(booking.date_time,)
	  const editedPhotosCount = booking.editedMaterial.filter(
				(material,) => {
					return material.contentType === 'PHOTOS'
				},
	  ).length

	  // @ts-ignore
	  dailyData[bookingDay - 1].totalPhotos += editedPhotosCount
	  // @ts-ignore

	  dailyData[bookingDay - 1].bookingCount += 1
		},)
		dailyData.forEach((dayData, index,) => {
	  const weekIndex = Math.floor(index / 7,)
	  if (weekIndex < maxWeeks) {
	  // @ts-ignore

				weeklyData[weekIndex].totalPhotos += dayData.totalPhotos
	  // @ts-ignore
				weeklyData[weekIndex].bookingCount += dayData.bookingCount
	  }
		},)

		const dailyAverages = dailyData.map((dayData,) => {
			return {
				day:   dayData.day,
				value: dayData.bookingCount > 0 ?
					Math.round(dayData.totalPhotos / dayData.bookingCount,) :
					0,
	  }
		},)
		const weeklyAverages = weeklyData.map((weekData,) => {
			return {
				name:  weekData.name,
				value: weekData.bookingCount > 0 ?
					Math.round(weekData.totalPhotos / weekData.bookingCount,) :
					0,
	  }
		},)
		return {
	  daily:  dailyAverages,
	  weekly: weeklyAverages,
		}
	}

	public async getTotalBookingStatistic(data: StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const todayStart = startOfDay(new Date(),)
		const todayEnd = endOfDay(new Date(),)

		const contractorIdDefault = await this.getSingleContractor()

		const selectObj: Prisma.BookingSelect = {
	  date_time: true,
		}

		// fetch all bookings within the given month
		const bookings = await this.getBookingWhere({
	  contractorId: contractorId || contractorIdDefault,
	  select:       selectObj,
	  startDate,
	  endDate,
		},)

		console.log(bookings,)

		// initialize daily and weekly data arrays
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

		// fill daily and weekly data
		bookings.forEach((booking,) => {
	  const bookingDate = new Date(booking.date_time,)
	  const day = getDate(bookingDate,)
	  const weekIndex = Math.floor((day - 1) / 7,)

	  // count bookings for each day
	  if (bookingDate >= startDate && bookingDate <= endDate) {
				// @ts-ignore
				dailyData[day - 1].value += 1
	  }

	  // count bookings for each week
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

	public async getRepeatedRate(data:StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const contractorIdDefault = await this.getSingleContractor()

		const selectObj: Prisma.BookingSelect = {
			date_time: true,
			repeat:    true,
		}
		const bookings = await this.getBookingWhere({
			contractorId: contractorId || contractorIdDefault,
			select:       selectObj,
			startDate,
			endDate,
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate()

		const repeatBookingStats = Array.from({ length: daysInMonth, }, (_, i,) => {
			return {
				day:      i + 1,
				repeated: 0,
				total:    0,
			}
		},)

		let bookingRepeatedCount = 0

		bookings.forEach((booking,) => {
			const day = booking.date_time.getDate()
			// @ts-ignore
			repeatBookingStats[day - 1].total += 1
			if (booking.repeat) {
				// @ts-ignore
				repeatBookingStats[day - 1].repeated += 1
				bookingRepeatedCount = bookingRepeatedCount + 1
			}
		},)

		const dailyResult = repeatBookingStats.map(({ day, repeated, total, },) => {
			const repeatPercentage = total > 0 ?
				(repeated / total) * 100 :
				0
			return {
				day,
				value: repeatPercentage,
			}
		},)

		const weeklyStats = [
			{ name: '1 Week', repeated: 0, total: 0, },
			{ name: '2 Week', repeated: 0, total: 0, },
			{ name: '3 Week', repeated: 0, total: 0, },
			{ name: '4 Week', repeated: 0, total: 0, },
		]
		repeatBookingStats.forEach(({ day, repeated, total, },) => {
			const weekIndex = Math.min(Math.floor((day - 1) / 7,), 3,)
			// @ts-ignore

			weeklyStats[weekIndex].total += total
			// @ts-ignore

			weeklyStats[weekIndex].repeated += repeated
		},)
		const weeklyResult = weeklyStats.map(({ name, repeated, total, },) => {
			const repeatPercentage = total > 0 ?
				(repeated / total) * 100 :
				0
			return {
				name,
				value: repeatPercentage,
			}
		},)

		const totalCount = bookings.length

		const sketchCount = bookingRepeatedCount

		const percentNum = totalCount > 0 ?
			(sketchCount / totalCount) * 100 :
			0

		const percent = {
		  percent:      parseFloat(percentNum.toFixed(2,),),
		  percentTotal: totalCount,
		  persentSolve: sketchCount,
		}

		return {
			daily:  dailyResult,
			weekly: weeklyResult,
			percent,
		}
	}

	public async getAvarageTimeOnSite(data:StatisticContractor,) {
		const { month, year, contractorId, } = data

		const startDate = startOfMonth(new Date(`${year}-${month}-01`,),)
		const endDate = endOfMonth(startDate,)

		const contractorIdDefault = await this.getSingleContractor()

		const selectObj: Prisma.BookingSelect = {
			date_time:           true,
			contractorArrivedAt: true,
			bookingCompletedAt:  true,
		}
		const bookings = await this.getBookingWhere({
			contractorId: contractorId || contractorIdDefault,
			select:       selectObj,
			startDate,
			endDate,
		},)

		const daysInMonth = new Date(Number(year,), Number(month,), 0,).getDate()

		const timeStats = Array.from({ length: daysInMonth, }, (_, i,) => {
			return {
				day:           i + 1,
				totalDuration: 0,
				count:         0,
			}
		},)
		bookings.forEach((booking,) => {
			const { contractorArrivedAt, bookingCompletedAt, } = booking
			if (contractorArrivedAt && bookingCompletedAt) {
				const duration = (bookingCompletedAt.getTime() - contractorArrivedAt.getTime()) / (1000 * 60) // duration in minutes
				const day = booking.date_time.getDate()
				// @ts-ignore
				timeStats[day - 1].totalDuration += duration
				// @ts-ignore
				timeStats[day - 1].count += 1
			}
		},)

		const dailyResult = timeStats.map(({ day, totalDuration, count, },) => {
			const averageDuration = count > 0 ?
				totalDuration / count :
				0
			return {
				day,
				value: averageDuration, // in minutes
			}
		},)

		const weeklyStats = [
			{ name: '1 Week', totalDuration: 0, count: 0, },
			{ name: '2 Week', totalDuration: 0, count: 0, },
			{ name: '3 Week', totalDuration: 0, count: 0, },
			{ name: '4 Week', totalDuration: 0, count: 0, },
		]
		timeStats.forEach(({ day, totalDuration, count, },) => {
			const weekIndex = Math.min(Math.floor((day - 1) / 7,), 3,)
			// @ts-ignore
			weeklyStats[weekIndex].totalDuration += totalDuration
			// @ts-ignore
			weeklyStats[weekIndex].count += count
		},)
		const weeklyResult = weeklyStats.map(({ name, totalDuration, count, },) => {
			const averageDuration = count > 0 ?
				totalDuration / count :
				0
			return {
				name,
				value: averageDuration, // in minutes
			}
		},)

		return {
			daily:  dailyResult,
			weekly: weeklyResult,
		}
	}
}
