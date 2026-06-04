import type { ContractorAvailableDay, } from '@prisma/client'

export const checkIsSameDay = (date1: Date, date2: Date,): boolean => {
	return date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
}

export const excludeBookedSlots = (availability: ContractorAvailableDay, bookedSlots: Array<{
  from: number,
  to: number,
  dateTime: Date,
}>,): ContractorAvailableDay => {
	if (bookedSlots.length === 0) {
		return availability
	}
	const updatedFrom: Array<number> = []
	const updatedTo: Array<number> = []

	bookedSlots.forEach(({ from: bookedFrom, to: bookedTo, },) => {
		availability.from.forEach((start, index,) => {
			const end = availability.to[index] ?? 0

			if (end <= bookedFrom) {
				updatedFrom.push(start,)
				updatedTo.push(end,)
			} else if (start >= bookedTo) {
				updatedFrom.push(start,)
				updatedTo.push(end,)
			} else {
				if (start < bookedFrom) {
					updatedFrom.push(start,)
					updatedTo.push(bookedFrom,)
				}
				if (end > bookedTo) {
					updatedFrom.push(bookedTo,)
					updatedTo.push(end,)
				}
			}
		},)
	},)

	return {
		...availability,
		from: updatedFrom,
		to:   updatedTo,
	}
}