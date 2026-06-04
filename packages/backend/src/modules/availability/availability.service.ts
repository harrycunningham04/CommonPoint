/* eslint-disable no-await-in-loop */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable prefer-object-has-own */
/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Availability, } from 'src/modules/booking/dto/get-availability-slots.dto'
import type { AdminEditAvailabilityDto, GetAvailabilityDto, } from 'src/modules/booking/dto/get-available-slots.dto'
import { calculateTimeSlot, } from 'src/shared/utils/date-calculations.util'
import type {
	AvailabilitiesReqDto,
	EditAvailabilitiesDto,
	EditAvailabilitiesMobileDto,
	EditAvailabilitiesResDto,
} from '../contractor/dto/edit-availability.dto'
import { BookingRepository, } from 'src/repositories/booking/booking.repository'
import { endOfDay, startOfDay, } from 'date-fns'
import moment from 'src/shared/utils/moment.util'
import type { ContractorAvailableDay, } from '@prisma/client'

@Injectable()
export class AvailabilityService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly bookingRepository: BookingRepository,
	) {}

	public async getAvailabilities(
		userId: string,
		data: AvailabilitiesReqDto,
	): Promise<EditAvailabilitiesResDto> {
		const availabilities = await this.prisma.contractorAvailableDay.findMany({
			where: {
				contractor_id: userId,
				date_time:     {
					gte: data.start_date,
					lte: data.end_date,
				},
			},
		},)

		return {
			availabilities: availabilities.map((item,) => {
				const availability: Array<[number, number]> = item.from.map((from, index,) => {
					return [from, item.to[index] ?? 0,]
				},)
				return {
					...item,
					isChecked: true,
					availability,
				}
			},),
		}
	}

	public async availabilityUnableInterval(
		bookingAvailabilities: Array<ContractorAvailableDay>,
	): Promise<Array<{ contractorId?: string; availability: Array<Array<number>>; dateTime?: string }>> {
		const grouped: Record<string, Array<{ from: number; to: number }>> = {}

		for (const entry of bookingAvailabilities) {
			const key = `${entry.contractor_id}_${entry.date_time.toISOString()}`
			if (!grouped[key]) {
				grouped[key] = []
			}

			for (let i = 0; i < entry.from.length; i++) {
				grouped[key]?.push({ from: entry.from[i] ?? 0, to: entry.to[i] ?? 0, },)
			}
		}

		const result = []

		for (const key in grouped) {
			if (!Object.prototype.hasOwnProperty.call(grouped, key,)) {
				continue
			} const [contractorId, dateTime,] = key.split('_',)
			const ranges = grouped[key] as Array<{ from: number; to: number }>

			const merged: Array<{ from: number; to: number }> = []

			ranges
				.sort((a, b,) => {
					return a.from - b.from
				},)
				.forEach((range,) => {
					if (merged.length === 0 || (merged[merged.length - 1]?.to ?? 0) < range.from) {
						merged.push({ ...range, },)
					} else {
						const last = merged[merged.length - 1]
						if (last) {
							last.to = Math.max(last.to, range.to,)
						}
					}
				},)

			const unavailable: Array<[number, number]> = []
			let current = 8
			const end = 18

			for (const range of merged) {
				if (range.from > current) {
					unavailable.push([current, range.from,],)
				}
				current = Math.max(current, range.to,)
			}

			if (current < end) {
				unavailable.push([current, end,],)
			}

			result.push({
				contractorId,
				dateTime,
				availability: unavailable,
			},)
		}

		return result
	}

	public async getAvailabilitiesForContractors(
		contractorIds: Array<string>,
		data: AvailabilitiesReqDto,
	): Promise<EditAvailabilitiesResDto> {
		const availabilities = await this.prisma.contractorAvailableDay.findMany({
			where: {
				contractor_id: {
					in: contractorIds,
				},
				date_time:     {
					gte: new Date(data.start_date,),
					lte: new Date(data.end_date,),
				},
			},
		},)

		return {
			availabilities: availabilities.map((item,) => {
				const availability: Array<[number, number]> = item.from.map((from, index,) => {
					return [from, item.to[index] ?? 0,]
				},)
				return {
					...item,
					isChecked: true,
					availability,
				}
			},),
		}
	}

	public async checkAvailability({
		contractorId,
		startDate,
		endDate,
		availabilities,
	}: {
    startDate: Date;
    endDate: Date;
    contractorId: string;
    availabilities: EditAvailabilitiesDto['availabilities'];
  },): Promise<void> {
		const updatedStartDate = new Date(startDate,)
		updatedStartDate.setHours(0, 0, 0, 0,)
		const updatedEndDate = new Date(endDate,)
		updatedEndDate.setHours(23, 59, 59, 999,)
		const totalBookingCount = await this.bookingRepository.countBooking({
			contractorId,
			date_time: {
				gte: updatedStartDate,
				lte: updatedEndDate,
			},
		},)

		const bookingRange = availabilities.flatMap((it,) => {
			const availableDateStart = new Date(it.date_time,)
			const availableDateEnd = new Date(it.date_time,)
			return it.availability.map((availability,) => {
				availableDateStart.setHours(availability[0] ?? 0, 0, 0, 0,)
				availableDateEnd.setHours(availability[1] ?? 0, 0, 0, 0,)
				return {
					date_time: {
						gte: availableDateStart,
						lte: availableDateEnd,
					},
				}
			},)
		},)
		const bookingCountInAvailableRange =
      await this.bookingRepository.countBooking({
      	AND: [
      		{
      			contractorId,
      		},
      		{
      			OR: bookingRange,
      		},
      	],
      },)

		const bookingCountOutOfRange =
      totalBookingCount - bookingCountInAvailableRange

		if (bookingCountOutOfRange > 0) {
			throw new BadRequestException(
				'Some bookings are already booked in previous range',
			)
		}
	}

	public async checkBookedSlotsMobile({
		contractorId,
		updatedAvailabilities,
		deletedAvailabilities,
	}: {
		contractorId: string,
		updatedAvailabilities: EditAvailabilitiesDto['availabilities'],
		deletedAvailabilities: EditAvailabilitiesDto['availabilities'],
	},): Promise<void> {
		const availabilities = [...updatedAvailabilities, ...deletedAvailabilities,]
		const bookingDaysRange = availabilities.flatMap((it,) => {
			return  {
				date_time: {
					gte: startOfDay(new Date(it.date_time,),),
					lte: endOfDay(new Date(it.date_time,),),
				},
			}
		},)

		const totalBookingCount = await this.bookingRepository.countBooking({
			AND: [
				{
					contractorId,
				},
				{
					OR: bookingDaysRange,
				},
			],
		},)

		const bookingRange = updatedAvailabilities.flatMap((it,) => {
			const availableDateStart = new Date(it.date_time,)
			const availableDateEnd = new Date(it.date_time,)
			return it.availability.map((availability,) => {
				availableDateStart.setHours(availability[0] ?? 0, 0, 0, 0,)
				availableDateEnd.setHours(availability[1] ?? 0, 0, 0, 0,)
				return {
					date_time: {
						gte: availableDateStart,
						lte: availableDateEnd,
					},
				}
			},)
		},)
		const bookingCountInAvailableRange =
      await this.bookingRepository.countBooking({
      	AND: [
      		{
      			contractorId,
      		},
      		{
      			OR: bookingRange,
      		},
      	],
      },)

		const bookingCountOutOfRange =
      totalBookingCount - bookingCountInAvailableRange

		if (bookingCountOutOfRange > 0) {
			throw new BadRequestException(
				'Some bookings are already booked in previous range',
			)
		}
	}

	public async checkContractorAvailabilityIfNotSetThenSet(userId: string,): Promise<void> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id: userId,
			},
			select: {
				isAvailabilitySet: true,
			},
		},)
		if (!contractor) {
			throw new NotFoundException('Contractor not found',)
		}
		if (!contractor.isAvailabilitySet) {
			await this.prisma.contractor.update({
				where: {
					id: userId,
				},
				data: {
					isAvailabilitySet: true,
				},
			},)
		}
	}

	public async editContractorAvailability(
		userId: string,
		body: EditAvailabilitiesDto,
	): Promise<[Date, Date]> {
		if (body.availabilities.length === 0) {
			return [new Date(), new Date(),]
		}
		const startDate = Math.min(
			...body.availabilities.map((it,) => {
				return new Date(it.date_time,).getTime()
			},),
		)
		const endDate = Math.max(
			...body.availabilities.map((it,) => {
				return new Date(it.date_time,).getTime()
			},),
		)
		await this.checkAvailability({
			contractorId:   userId,
			startDate:      new Date(startDate,),
			endDate:        new Date(endDate,),
			availabilities: body.availabilities,
		},)

		const availabilitiesWithIds = body.availabilities.filter((it,) => {
			return it.id
		},)
		const availabilitiesWithoutIds = body.availabilities.filter((it,) => {
			return !it.id
		},)

		await this.checkContractorAvailabilityIfNotSetThenSet(userId,)

		await this.prisma.contractorAvailableDay.deleteMany({
			where: {
				contractor_id: userId,
				date_time:     {
					gte: new Date(startDate,),
					lte: new Date(endDate,),
				},
				NOT: {
					id: {
						in: availabilitiesWithIds.map((it,) => {
							return it.id ?? ''
						},),
					},
				},
			},
		},)

		await this.prisma.contractorAvailableDay.createMany({
			data: availabilitiesWithoutIds.flatMap((it,) => {
				return {
					contractor_id: userId,
					date_time:     it.date_time,
					from:          it.from,
					to:            it.to,
				}
			},),
		},)

		await Promise.all(
			availabilitiesWithIds.map(async(it,) => {
				return this.prisma.contractorAvailableDay.upsert({
					where: {
						id: it.id,
					},
					update: {
						from: it.from,
						to:   it.to,
					},
					create: {
						contractor_id: userId,
						date_time:     it.date_time,
						from:          it.from,
						to:            it.to,
					},
				},)
			},),
		)

		return [new Date(startDate,), new Date(endDate,),]
	}

	public async editContractorAvailabilityMobile(
		userId: string,
		body: EditAvailabilitiesMobileDto,
	): Promise<void> {
		const availabilitiesWithIds = body.availabilities.filter((it,) => {
			return it.id
		},)
		const availabilitiesWithoutIdsAndChecked = body.availabilities.filter((it,) => {
			return !it.id && it.isChecked
		},)

		const availabilityIdsMustBeDeleted = availabilitiesWithIds.filter((it,) => {
			return !it.isChecked
		},)

		const availabilitiesMustByUpdated = availabilitiesWithIds.filter((it,) => {
			return it.isChecked
		},)

		await this.checkBookedSlotsMobile({
			contractorId:          userId,
			updatedAvailabilities: availabilitiesMustByUpdated,
			deletedAvailabilities: availabilityIdsMustBeDeleted,
		},)

		await this.checkContractorAvailabilityIfNotSetThenSet(userId,)

		await Promise.all([this.prisma.contractorAvailableDay.deleteMany({
			where: {
				id: {
					in: availabilityIdsMustBeDeleted.map((it,) => {
						return it.id ?? ''
					},),
				},
			},
		},),
		this.prisma.contractorAvailableDay.deleteMany({
			where: {
				contractor_id: userId,
				OR:            availabilitiesWithoutIdsAndChecked.map((it,) => {
					return {
						date_time: {
							gte: startOfDay(new Date(it.date_time,),),
							lte: endOfDay(new Date(it.date_time,),),
						},
					}
				},),
			},
		},),
		],)

		await this.prisma.contractorAvailableDay.createMany({
			data: availabilitiesWithoutIdsAndChecked.flatMap((it,) => {
				return {
					contractor_id: userId,
					date_time:     it.date_time,
					from:          it.from,
					to:            it.to,
				}
			},),
		},)

		await Promise.all(
			availabilitiesMustByUpdated.map(async(it,) => {
				return this.prisma.contractorAvailableDay.upsert({
					where: {
						id: it.id,
					},
					create: {
						contractor_id: userId,
						date_time:     it.date_time,
						from:          it.from,
						to:            it.to,
					},
					update: {
						from: it.from,
						to:   it.to,
					},
				},)
			},),
		)
	}

	public async editContractorAvailabilityContractor(
		contractorId: string,
		body: EditAvailabilitiesDto,
	): Promise<EditAvailabilitiesResDto> {
		const [startDate, endDate,] = await this.editContractorAvailability(contractorId, {
			availabilities: body.availabilities,
		},)

		return this.getAvailabilities(contractorId, {
			start_date: new Date(startDate,),
			end_date:   new Date(endDate,),
		},)
	}

	public async editContractorAvailabilityAdmin(
		contractorId: string,
		body: AdminEditAvailabilityDto,
	): Promise<Array<Availability>> {
		await this.editContractorAvailability(contractorId, {
			availabilities: body.availabilities,
		},)

		return this.getAvailability(contractorId, {
			startDate: body.startDate,
			endDate:   body.endDate,
		},)
	}

	public async getAvailability(contractorId: string, data: GetAvailabilityDto,): Promise<Array<Availability>> {
		const { startDate, endDate, } = data

		const results: Array<Availability> = []

		let current = moment(startDate,).utc()
			.startOf('day',)
		const last = moment(endDate,).utc()
			.endOf('day',)

		while (current.isSameOrBefore(last,)) {
			const dayOfWeek = current.day()
			if (dayOfWeek === 0 || dayOfWeek === 6) {
				current = current.clone().add(1, 'day',)
				continue
			}

			const dayStart = current.clone().startOf('day',)
			const dayEnd = current.clone().endOf('day',)

			const vacation = await this.prisma.vacation.findFirst({
				where: {
					contractorId,
					startDate: {
						lte: dayEnd.toDate(),
					},
					endDate: {
						gte: dayStart.toDate(),
					},
				},
			},)

			const availableDay = await this.prisma.contractorAvailableDay.findFirst({
				where: {
					date_time: {
						gte: dayStart.toDate(),
						lte: dayEnd.toDate(),
					},
					contractor_id: contractorId,
				},
			},)

			const dateTime = dayStart.toDate()

			if (!availableDay) {
				results.push({
					date_time:         dateTime,
					availability: [],
					booked:       0,
					isVacation:   Boolean(vacation,),
				},)
				current = current.clone().add(1, 'day',)
				continue
			}

			const { _count: booked, } = await this.prisma.booking.aggregate({
				_count: true,
				where:  {
					date_time: {
						gte: dayStart.toDate(),
						lte: dayEnd.toDate(),
					},
					contractorId,
				},
			},)

			results.push({
				id:           availableDay.id,
				date_time:         availableDay.date_time,
				availability: availableDay.from.map((from, index,) => {
					return [from, availableDay.to[index]!,]
				},),
				booked,
				isVacation:   Boolean(vacation,),
			},)
			current = current.clone().add(1, 'day',)
		}

		return results
	}

	public async getAvailableHoursInSpecificDayForContractors(
		contractorIds: Array<string>,
		date: Date,
	): Promise<Array<{contractorId: string, availableHours: number, }>> {
		const specificDay = new Date(date,)
		const startOfDay = new Date(specificDay.setHours(0, 0, 0, 0,),)
		const endOfDay = new Date(specificDay.setHours(23, 59, 59, 999,),)
		const availability = await this.prisma.contractorAvailableDay.findMany({
			where: {
				contractor_id: {
					in: contractorIds,
				},
				date_time:     {
					gte: startOfDay,
					lt:  endOfDay,
				},
			},
		},)

		if (!availability.length) {
			return []
		}

		const availableHoursMap = new Map<string, number>()
		availability.forEach((it,) => {
			const availableHours = calculateTimeSlot(
				it,
				0,
				1,
			)
			availableHoursMap.set(it.contractor_id, availableHours,)
		},)

		return Array.from(availableHoursMap.entries(),)
			.map(([contractorId, availableHours,],) => {
				return {
					contractorId,
					availableHours,
				}
			},)
	}

	public async getAverageBookingDuration(): Promise<number> {
		const booking = await this.prisma.booking.aggregate({
			_avg: {
				duration: true,
			},
		},)
		// eslint-disable-next-line no-underscore-dangle
		return booking._avg.duration ?? 0
	}

	public async deleteAvailabilitiesForDateRange(contractorId: string, startDate: Date, endDate: Date,): Promise<void> {
		await this.prisma.contractorAvailableDay.deleteMany({
			where: {
				contractor_id: contractorId,
				date_time:     {
					gte: startDate,
					lte: endDate,
				},
			},
		},)
	}
}
