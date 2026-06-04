/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { DiscountType, } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, } from 'class-validator'
import { Type, } from 'class-transformer'

export class CouponDiscountDto {
  @ApiProperty({ description: 'Discount value', type: Number, },)
  @IsNumber()
  @Type(() => {
  	return Number
  },)
	public discount!: number

  @ApiProperty({ description: 'Discount type', enum: DiscountType, },)
  @IsEnum(DiscountType,)
  @IsNotEmpty()
  public discountType!: DiscountType
}