import { subWeeks, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, } from 'date-fns'
import { EDateRange, } from '../types/date.range.type'

export function getDateRange(dateRange: string,): { gte?: Date; lte?: Date } {
	const now = new Date()

	switch (dateRange) {
	case EDateRange.LAST_WEEK:
		return {
			gte: startOfWeek(subWeeks(now, 1,),),
			lte: endOfWeek(subWeeks(now, 1,),),
		}

	case EDateRange.LAST_MONTH:
		return {
			gte: startOfMonth(subMonths(now, 1,),),
			lte: endOfMonth(subMonths(now, 1,),),
		}

	case EDateRange.LAST_YEAR:
		return {
			gte: startOfYear(subYears(now, 1,),),
			lte: endOfYear(subYears(now, 1,),),
		}

	default:
		throw new Error(`Unsupported date range: ${dateRange}`,)
	}
}