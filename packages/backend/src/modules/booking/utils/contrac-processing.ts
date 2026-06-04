import type { EditAvailabilityResDto, } from 'src/modules/contractor/dto/edit-availability.dto'
import type { ContractorBookedAndAvailableSlots, IBookingInSlot, IContractorBookedAndAvailableSlotsSlot, MapContractorBookedAndAvailableSlots, } from '../booking.types'

import type { ContractorBookedAndAvailableSlotsDay, } from '../booking.types'
import { getFormattedDate, } from './get-formated-date'

const MINUTES_IN_HOUR = 60

const processAvailabilityAndBookingsByDay = ({
	availability,
	bookings,
	durationInMinutes,
}: {
  availability: EditAvailabilityResDto,
  bookings: Array<IBookingInSlot>,
  durationInMinutes: number,
},): ContractorBookedAndAvailableSlotsDay => {
	const availabilityDate = new Date(availability.date_time,)
	const dateObject = {
		year:  availabilityDate.getFullYear(),
		month: availabilityDate.getMonth(),
		day:   availabilityDate.getDate(),
	}

	if (bookings.length === 0) {
		const slots = availability.availability.map((slot,) => {
			const fromInMinutes = (slot[0] * MINUTES_IN_HOUR)
			const toInMinutes = (slot[1] * MINUTES_IN_HOUR)
			const durationInMinutesForSlot = toInMinutes - fromInMinutes
			const isAvailable = durationInMinutesForSlot >= durationInMinutes
			const fromDate = new Date()
			fromDate.setUTCFullYear(dateObject.year, dateObject.month, dateObject.day,)
			fromDate.setUTCHours(fromInMinutes / MINUTES_IN_HOUR, fromInMinutes % MINUTES_IN_HOUR, 0, 0,)
			const toDate = new Date()
			toDate.setUTCFullYear(dateObject.year, dateObject.month, dateObject.day,)
			toDate.setUTCHours(toInMinutes / MINUTES_IN_HOUR, toInMinutes % MINUTES_IN_HOUR, 0, 0,)

			return {
				from:              fromDate,
				to:                toDate,
				durationInMinutes: durationInMinutesForSlot,
				isAvailable,
				isBooked:          false,
			}
		},)
		return {
			contractorId:                                          availability.contractor_id,
			dateTime:                                              availability.date_time,
			formattedDate:                                         getFormattedDate(availability.date_time,),
			isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked: slots.some((slot,) => {
				return slot.isAvailable
			},),
			slots,
		}
	}

	const slots: Array<IContractorBookedAndAvailableSlotsSlot> = []
	availability.availability.forEach((slot,) => {
		const fromAvailabilityInMinutes = (slot[0] * MINUTES_IN_HOUR)
		const toAvailabilityInMinutes = (slot[1] * MINUTES_IN_HOUR)
		let currentFrom = fromAvailabilityInMinutes

		bookings.forEach((booking,) => {
			const date = new Date(booking.date_time,)
			const bookingFrom = (date.getHours() * MINUTES_IN_HOUR) + date.getMinutes()
			const bookingTo = bookingFrom + (booking.durationInMinutes ?? 0)
			if (bookingTo <= fromAvailabilityInMinutes || bookingFrom >= toAvailabilityInMinutes) {
				return
			}

			if (currentFrom < bookingFrom) {
				currentFrom = bookingFrom
				const durationInMinutesLocal = bookingFrom - currentFrom
				const fromDate = new Date()
				fromDate.setFullYear(dateObject.year, dateObject.month, dateObject.day,)
				fromDate.setHours(currentFrom / MINUTES_IN_HOUR, currentFrom % MINUTES_IN_HOUR, 0, 0,)
				const toDate = new Date()
				toDate.setFullYear(dateObject.year, dateObject.month, dateObject.day,)
				toDate.setHours(bookingFrom / MINUTES_IN_HOUR, bookingFrom % MINUTES_IN_HOUR, 0, 0,)
				slots.push({
					from:              fromDate,
					to:                toDate,
					durationInMinutes: durationInMinutesLocal,
					isAvailable:       durationInMinutesLocal >= durationInMinutes,
					isBooked:          false,
				},)
			}
			const durationInMinutesLocal = bookingTo - bookingFrom
			const fromDate = new Date()
			fromDate.setFullYear(dateObject.year, dateObject.month, dateObject.day,)
			fromDate.setHours(bookingFrom / MINUTES_IN_HOUR, bookingFrom % MINUTES_IN_HOUR, 0, 0,)
			const toDate = new Date()
			toDate.setFullYear(dateObject.year, dateObject.month, dateObject.day,)
			toDate.setHours(bookingTo / MINUTES_IN_HOUR, bookingTo % MINUTES_IN_HOUR, 0, 0,)
			slots.push({
				from:              fromDate,
				to:                toDate,
				durationInMinutes: durationInMinutesLocal,
				isAvailable:       durationInMinutesLocal >= durationInMinutes,
				isBooked:          true,
				booking,
			},)

			currentFrom = bookingTo
		},)

		if (currentFrom < toAvailabilityInMinutes) {
			const durationInMinutesLocal = toAvailabilityInMinutes - currentFrom
			const fromDate = new Date()
			fromDate.setFullYear(dateObject.year, dateObject.month, dateObject.day,)
			fromDate.setHours(currentFrom / MINUTES_IN_HOUR, currentFrom % MINUTES_IN_HOUR, 0, 0,)
			const toDate = new Date()
			toDate.setFullYear(dateObject.year, dateObject.month, dateObject.day,)
			toDate.setHours(toAvailabilityInMinutes / MINUTES_IN_HOUR, toAvailabilityInMinutes % MINUTES_IN_HOUR, 0, 0,)
			slots.push({
				from:              fromDate,
				to:                toDate,
				durationInMinutes: durationInMinutesLocal,
				isAvailable:       durationInMinutesLocal >= durationInMinutes,
				isBooked:          false,
			},)
		}
	},)

	const isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked = Boolean(slots.find((slot, index,) => {
		if (index === 0) {
			return slot.isAvailable && !slot.isBooked
		}
		const previousSlot = slots[index - 1]
		return slot.isAvailable && !slot.isBooked && !previousSlot?.isBooked
	},),)

	return {
		contractorId:                        availability.contractor_id,
		dateTime:                            availability.date_time,
		formattedDate:                       getFormattedDate(availability.date_time,),
		isThisDayStartFromAvailableSlotOrPrevSlotAreNotBooked,
		slots,
	}
}

export const getContractorBookedAndAvailableSlots = ({
	bookings,
	availabilities,
	durationInMinutes,
}: {
  bookings: Array<IBookingInSlot>,
  availabilities: Array<EditAvailabilityResDto>,
  durationInMinutes: number,
},): ContractorBookedAndAvailableSlots => {
	const groupedBookingByDay = new Map<string, Array<IBookingInSlot>>()

	bookings.forEach((booking,) => {
		const formattedDate = getFormattedDate(new Date(booking.date_time,),)
		groupedBookingByDay.set(formattedDate, [...(groupedBookingByDay.get(formattedDate,) ?? []), booking,],)
	},)

	const days = new Map<string, ContractorBookedAndAvailableSlotsDay>()
	availabilities.forEach((availability,) => {
		const formattedDate = getFormattedDate(availability.date_time,)
		days.set(formattedDate, processAvailabilityAndBookingsByDay({
			availability,
			bookings: groupedBookingByDay.get(formattedDate,) ?? [],
			durationInMinutes,
		},),)
	},)
	return {
		days: Array.from(days.values(),),
	}
}

export const removeUnnecessarySlots = (data: MapContractorBookedAndAvailableSlots,): MapContractorBookedAndAvailableSlots => {
	const result = new Map<string, ContractorBookedAndAvailableSlots>()
	console.log('data in removeUnnecessarySlots',)
	console.table(Array.from(data.entries(),).flatMap(([contractorId, contractorBookedAndAvailableSlots,],) => {
		return contractorBookedAndAvailableSlots.days.flatMap((day,) => {
			return day.slots.flatMap((slot,) => {
				return {
					...slot,
					contractorId,
				}
			},)
		},)
	},),)

	data.forEach((contractorBookedAndAvailableSlots, contractorId,) => {
		const validDays = contractorBookedAndAvailableSlots.days.filter((day,) => {
			return day.slots.some((slot,) => {
				return slot.isAvailable
			},)
		},)
		const daysWithExcludedUnnecessarySlots = validDays.map((day,) => {
			const slotsWithExcludedUnnecessarySlots = day.slots.filter((slot, index,) => {
				const nextSlot = day.slots[index + 1]
				const ifWeDontHaveNextSlotAndThisSlotIsAvailable = !nextSlot?.isAvailable && slot.isAvailable
				if (ifWeDontHaveNextSlotAndThisSlotIsAvailable) {
					return true
				}
				const ifWeHaveNextSlotAndThisSlotIsAvailable = Boolean(nextSlot?.isAvailable && slot.isAvailable,)
				const ifWeHaveNextSlotAndThisSlotIsBooked = Boolean(nextSlot?.isAvailable && slot.isBooked,)
				if (ifWeHaveNextSlotAndThisSlotIsAvailable || ifWeHaveNextSlotAndThisSlotIsBooked) {
					return true
				}

				return false
			},)

			return {
				...day,
				slots: slotsWithExcludedUnnecessarySlots,
			}
		},)
		result.set(contractorId, {
			days: daysWithExcludedUnnecessarySlots,
		},)
	},)

	console.log('result in removeUnnecessarySlots',)
	console.table(Array.from(result.entries(),).flatMap(([contractorId, contractorBookedAndAvailableSlots,],) => {
		return contractorBookedAndAvailableSlots.days.flatMap((day,) => {
			return day.slots.flatMap((slot,) => {
				return {
					...slot,
					contractorId,
				}
			},)
		},)
	},),)
	return result
}