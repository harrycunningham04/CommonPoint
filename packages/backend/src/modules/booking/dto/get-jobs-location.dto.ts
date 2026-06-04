import { ApiProperty, } from '@nestjs/swagger'
import { IsISO8601, IsOptional, } from 'class-validator'

export class GetJobsLocationDto {
    @ApiProperty({
    	description: 'Date to show jobs',
    	example:     '2025-01-01T00:00:00.000Z',
    },)
    @IsISO8601({ strict: true, }, { message: 'ShowDate must be a valid ISO 8601 date string', },)
	public showDate!: string
}