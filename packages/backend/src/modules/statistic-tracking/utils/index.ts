/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ContractorMark, ProductMark, StatisticType,} from '@prisma/client'
import { Prisma, } from '@prisma/client'

export const getSqlForValidMonthTimePeriod = (monthAgo: number,): Prisma.Sql => {
	if (monthAgo <= 0) {
		return Prisma.sql`
    ('0', DATE_TRUNC('month', NOW()))
    `
	}
	return Prisma.sql([`('${monthAgo}', DATE_TRUNC('month', NOW()) - INTERVAL '${monthAgo} month')`,],)
}

const getSqlForValidWeekTimePeriod = (weekAgo: number,): Prisma.Sql => {
	if (weekAgo <= 0) {
		return Prisma.sql`('0', DATE_TRUNC('week', NOW()))`
	}
	return Prisma.sql([`('${weekAgo}', DATE_TRUNC('week', NOW()) - INTERVAL '${weekAgo} week')`,],)
}
export const getSqlForAllMonths = (): Prisma.Sql => {
	const months = Array.from({ length: 7, }, (_, i,) => {
		return i
	},)
	return months.reduce((acc, curr,) => {
		return Prisma.sql`${acc}
			${acc.sql.length ?
		Prisma.sql`,` :
		Prisma.sql``}
		${getSqlForValidMonthTimePeriod(curr,)}`
	}, Prisma.sql``,)
}

export const getSqlForAllWeeks = (): Prisma.Sql => {
	const weeks = Array.from({ length: 7, }, (_, i,) => {
		return i
	},)
	return weeks.reduce((acc, curr,) => {
		return Prisma.sql`${acc}
			${acc.sql.length ?
		Prisma.sql`,` :
		Prisma.sql``}
		${getSqlForValidWeekTimePeriod(curr,)}`
	}, Prisma.sql``,)
}

export const getSqlStatisticType = (statisticType: StatisticType,): Prisma.Sql => {
	return Prisma.sql`${statisticType}::"StatisticType"`
}

export const calculatePercentageOfIncomeIncrease = (prevEarnings: number, currentEarnings: number,): string => {
	if (prevEarnings === 0) {
		if (currentEarnings > 0) {
			return 'Inf%'
		}
		return currentEarnings === 0 ?
			'0%' :
			'-Inf	%'
	}
	const increase = ((currentEarnings - prevEarnings) * 100) / prevEarnings
	return `${increase.toFixed(1,)}%`
}

export const canContractorHandleProduct = (contractorMark: ContractorMark, productMark: ProductMark,): boolean => {
	if (productMark === ProductMark.ALL) {
		return true
	}
	if (contractorMark === ContractorMark.GOLD) {
		return true
	}
	if (contractorMark === ContractorMark.SILVER) {
		return productMark !== ContractorMark.GOLD
	}
	if (contractorMark === ContractorMark.BRONZE) {
		return productMark === ContractorMark.BRONZE
	}
	return false
}