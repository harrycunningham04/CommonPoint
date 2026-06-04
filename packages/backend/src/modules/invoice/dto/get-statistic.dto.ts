/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional, IsString, } from 'class-validator'
import { EClientType, } from 'src/shared/types/client.type'
import { EDateRange, } from '../types/date.range.type'

export class GetStatisticDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public clientId?:string

    @ApiProperty()
    @IsOptional()
    @IsEnum(EClientType,)
    public clientType?:EClientType

    @ApiProperty()
    @IsArray()
    @IsOptional()
    public officeIds?:Array<string>

    @ApiProperty()
    @IsOptional()
    @IsEnum(EDateRange,)
    public dateRange?: EDateRange
}

export class GetStatisticResponseDto {
    @ApiProperty({
    	description: 'Total bookings',
    	example:     10,
    },)
	public totalBookings!: number

    @ApiProperty({
    	description: 'Total spent booking',
    	example:     100,
    },)
    public totalSpentBooking!: number

    @ApiProperty({
    	description: 'Booking in progress',
    	example:     10,
    },)
    public bookingInProgress!: number
}