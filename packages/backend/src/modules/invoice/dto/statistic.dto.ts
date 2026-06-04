import { IsEnum, } from 'class-validator'
import { EDateRange, } from '../types/date.range.type'
import { ApiProperty, } from '@nestjs/swagger'

export class StatisticInvoicesDto  {
	@ApiProperty({
		description: 'Date range',
		enum:        EDateRange,
	},)
	@IsEnum(EDateRange,)
	public	dateRange!: EDateRange
}