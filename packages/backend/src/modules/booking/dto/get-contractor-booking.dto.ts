/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, PartialType, } from '@nestjs/swagger'
import type { Booking,} from '@prisma/client'
import { BookingStatus, } from '@prisma/client'
import { Type, } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsISO8601,
	IsNotEmpty,
	IsNumberString,
	IsOptional,
	IsString,
} from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'

export class FilterContractorBookingDto {
  @ApiProperty({
  	description: 'Array of booking statuses to filter by',
  	enum:        BookingStatus,
  	isArray:     true,
  },)
  @IsOptional()
  @IsArray()
  @IsEnum(BookingStatus, {
  	each:    true,
  	message: 'Each status must be a valid BookingStatus',
  },)
	public statuses?: Array<BookingStatus>

    @ApiProperty({
    	description: 'Start date for filtering (ISO 8601 format)',
    	example:     '2025-01-01T00:00:00.000Z',
    	required:    false,
    },)
      @IsOptional()
      @IsISO8601({ strict: true, }, { message: 'StartDate must be a valid ISO 8601 date string', },)
  public startDate?: string

      @ApiProperty({
      	description: 'End date for filtering (ISO 8601 format)',
      	example:     '2025-12-31T23:59:59.999Z',
      	required:    false,
      },)
      @IsOptional()
      @IsISO8601({ strict: true, }, { message: 'EndDate must be a valid ISO 8601 date string', },)
    public endDate?: string
}

export class GetContractorBookingDto extends PageOptionsDto {
  @ApiProperty()
  @IsOptional()
	public filter?: FilterContractorBookingDto

  @ApiProperty({
  	description: 'Start date for filtering (ISO 8601 format)',
  	example:     '2025-01-01T00:00:00.000Z',
  	required:    false,
  },)
    @IsOptional()
    @IsISO8601({ strict: true, }, { message: 'StartDate must be a valid ISO 8601 date string', },)
  public showDate?: string

  @ApiProperty({
  	description: 'Search field',
  	required:    false,
  },)
    @IsOptional()
    @IsString()
  public search?: string

  @ApiProperty({
  	description: 'Off site bookings',
  	required:    false,
  },)
    @IsOptional()
    @Type(() => {
    	return Boolean
    },)
    @IsBoolean()
  public offSite?: boolean
}

export class JobsDtoResponse extends PagedResDto<Booking> {
}
