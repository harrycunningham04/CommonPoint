import {
	addDays,
	endOfDay,
	getDate,
	isSameDay,
	lastDayOfMonth,
	startOfDay,
	startOfMonth,
} from 'date-fns'

export function getContractorPayoutPeriod(referenceDate: Date = new Date(),): { startDate: Date; endDate: Date } | null {
	const today = startOfDay(referenceDate,)
	const tomorrow = startOfDay(addDays(today, 1,),)
	const isFifteenth = getDate(today,) === 15
	const isLastDayOfMonth = isSameDay(today, lastDayOfMonth(today,),)
	if (isFifteenth) {
		return {
			startDate: startOfDay(startOfMonth(today,),),
			endDate:   endOfDay(today,),
		}
	}

	if (isLastDayOfMonth) {
		return {
			startDate: startOfDay(new Date(today.getFullYear(), today.getMonth(), 16,),),
			endDate:   endOfDay(today,),
		}
	}

	return null
}
