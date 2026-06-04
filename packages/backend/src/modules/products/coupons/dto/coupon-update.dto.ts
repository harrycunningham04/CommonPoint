import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, IsDateString, Min, } from 'class-validator'
import { CouponType, DiscountType, } from '@prisma/client'
import { CouponTargetDto, } from './coupon-create.dto'
import { Transform, } from 'class-transformer'

export class UpdateCouponDto {
	@ApiProperty({
		description: 'Coupon title',
		type:        String,
		example:     'Summer Sale',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public title?: string

	@ApiProperty({
		description: 'Coupon type',
		enum:        CouponType,
		example:     CouponType.VOLUME_OF_CASH,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(CouponType,)
	public type?: CouponType

	@ApiProperty({
		description: 'Discount amount',
		type:        Number,
		example:     20,
		required:    false,
	},)
	@IsOptional()
	@IsNumber()
	@Min(0,)
	public discount?: number

	@ApiProperty({
		description: 'Discount type',
		enum:        DiscountType,
		example:     DiscountType.PERCENTAGE,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(DiscountType,)
	@Transform(({ value, },) => {
		if (value === 'POUNDS') {
			return DiscountType.AMOUNT
		}
		return value
	},)
	public discountType?: DiscountType

	@ApiProperty({
		description: 'Minimum order amount',
		type:        Number,
		nullable:    true,
		example:     100,
		required:    false,
	},)
	@IsOptional()
	@IsNumber()
	@Min(0,)
	public minAmount?: number

	@ApiProperty({
		description: 'Minimum number of orders',
		type:        Number,
		nullable:    true,
		example:     1,
		required:    false,
	},)
	@IsOptional()
	@IsNumber()
	@Min(0,)
	public minOrders?: number

	@ApiProperty({
		description: 'Start date',
		type:        String,
		format:      'date-time',
		example:     '2024-01-01T00:00:00.000Z',
		required:    false,
	},)
	@IsOptional()
	@IsDateString()
	public startDate?: string

	@ApiProperty({
		description: 'End date',
		type:        String,
		format:      'date-time',
		example:     '2024-12-31T23:59:59.999Z',
		required:    false,
	},)
	@IsOptional()
	@IsDateString()
	public endDate?: string

	@ApiProperty({
		description: 'Coupon targets',
		type:        [CouponTargetDto,],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	public targets?: Array<CouponTargetDto>
}