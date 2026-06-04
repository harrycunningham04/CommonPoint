/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { AdjustmentFeeType, } from '@prisma/client'
import { Transform, Type, } from 'class-transformer'
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, } from 'class-validator'

export class CreateAdjustmentFeeDto {
  @ApiProperty({
  	description: 'The contractor ID',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
	public contractorId!: string

  @ApiProperty({
  	description: 'The booking ID',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  public bookingId!: string

  @ApiProperty({
  	description: 'The type of adjustment fee',
  	example:     'BONUS',
  },)
  @IsEnum(AdjustmentFeeType,)
  public type!: AdjustmentFeeType

  @ApiProperty({
  	description: 'The amount of the adjustment fee',
  	example:     '100',
  },)
  @IsNumber()
  @Transform(({ value, },) => {
  	return Number(value,)
  },)
  public amount!: number
}

export class GetAdjustmentFeeDto {
	constructor(data?: GetAdjustmentFeeDto,) {
		if (data) {
			this.id = data.id
			this.type = data.type
			this.amount = data.amount
			this.dateTime = data.dateTime
			this.bookingId = data.bookingId
			this.jobAddress = data.jobAddress
		}
	}

  @ApiProperty({
  	description: 'The ID of the adjustment fee',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
	public id!: string

  @ApiProperty({
  	description: 'The type of adjustment fee',
  	example:     'BONUS',
  },)
  @IsEnum(AdjustmentFeeType,)
  public type!: AdjustmentFeeType

  @ApiProperty({
  	description: 'The amount of the adjustment fee',
  	example:     '100',
  },)
  @IsNumber()
  public amount!: number

  @ApiProperty({
  	description: 'The date and time of the adjustment fee',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
  @IsDate()
  public dateTime!: Date

  @ApiProperty({
  	description: 'The booking ID',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  public bookingId!: string

  @ApiProperty({
  	description: 'The job address',
  	example:     '123 Main St, Anytown, USA',
  },)
  @IsString()
  public jobAddress!: string
}

export class GetAdjustmentFeeQuery {
  @ApiProperty({
  	description: 'Only unpaid adjustment fees',
  	example:     true,
  },)
  @IsOptional()
  @IsBoolean()
  @Type(() => {
  	return Boolean
  },)
	public onlyUnpaid?: boolean
}