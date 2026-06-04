/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ApiProperty, } from '@nestjs/swagger'
import type { Booking, BookingGroup, BookingStatus, } from '@prisma/client'
import { IsArray, IsBooleanString, IsEnum, IsOptional, IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { EClientType, } from 'src/shared/types/client.type'
import type { IProductTypeBooking, } from '../booking.types'
import { BookingUniqueSkills, } from './single-booking-res.dto'

export class FilterClientDto {
    @ApiProperty()
    @IsOptional()
    @IsBooleanString()
	public showArchive?: string

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public statuses?: Array<BookingStatus>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public squares?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsString()
    public startDate?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public endDate?: string
}

export class GetBookingClientDto extends PageOptionsDto {
    @ApiProperty()
    @IsOptional()
	public filter?: FilterClientDto

    @ApiProperty()
    @IsOptional()
    @IsString()
    public search?: string

    @ApiProperty()
    @IsOptional()
    @IsEnum(EClientType,)
    public  clientType? : EClientType

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public officeIds?:Array<string>
}

export class BookingClientResDto {
	public static cast(
		bookingsGroup: Array<
        BookingGroup & {
          bookings: Array<Booking & { BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}> }>;
        }
      >,
	) {
		return bookingsGroup
			.filter(({ bookings, },) => {
				return bookings.length > 0
			},)
			.map(({ bookings, },) => {
				return {
					...bookings[0],
					total_sum: bookings.reduce((sum, booking,) => {
						return sum + Number(booking.total_sum,)
					}, 0,),
					uniqueSkills: Array.from(
						new Set(
							bookings.flatMap((booking,) => {
								return BookingUniqueSkills.getUniqueSkills({ BookingToProductType: booking.BookingToProductType, },)
							},),
						),
					),
					preferences: Array.from(
						new Set(
							bookings.flatMap((booking,) => {
								return booking.preferences || []
							},),
						),
					),
				}
			},)
	}
}

