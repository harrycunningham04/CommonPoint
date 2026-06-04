import { IsArray, IsDate, IsEnum, IsOptional, IsString, } from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, } from 'class-validator'
import { BookingStage, BookingStatus, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { EContractorChangeStatus, } from '../booking.types'

export class UpdateStageAndStatusResDto {
	constructor(data?: UpdateStageAndStatusResDto,) {
		if (data) {
			this.id = data.id
			this.bookingStatus = data.bookingStatus
			this.bookingStage = data.bookingStage
			return
		}
		this.id = ''
		this.bookingStatus = BookingStatus.BOOKED
		this.bookingStage = []
	}

  @ApiProperty({
  	description: 'The id of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsNotEmpty()
	public id: string

  @ApiProperty({
  	description: 'The status of the booking',
  	example:     'IN_PROGRESS',
  },)
  @IsEnum(BookingStatus,)
  @IsNotEmpty()
  public bookingStatus: BookingStatus

  @ApiProperty({
  	description: 'The stage of the booking',
  },)
  @IsArray()
  @IsEnum(BookingStage, { each: true, },)
  public bookingStage: Array<BookingStage>
}

export class UpdateBookingStageDto {
	constructor(data?: UpdateBookingStageDto,) {
		if (data) {
			this.date = data.date
			this.statusType = data.statusType
			return
		}
		this.date = undefined
		this.statusType = EContractorChangeStatus.ARRIVED_ON_SITE
	}

	@ApiProperty({
		description: 'The status type of the booking',
		enum:        EContractorChangeStatus,
	},)
	@IsEnum(EContractorChangeStatus,)
	public statusType: EContractorChangeStatus

	@ApiProperty({
		description: 'The date of the booking',
	},)
	@Type(() => {
		return Date
	},)
	@IsDate()
	@IsOptional()
	public date?: Date
}
