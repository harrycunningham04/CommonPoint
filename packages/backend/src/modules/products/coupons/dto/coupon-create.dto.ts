import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString, Min, } from 'class-validator'
import { CouponType, DiscountType, Target, } from '@prisma/client'
import { Transform, } from 'class-transformer'

export class CouponTargetDto {
	@ApiProperty({
		description: 'Target ID',
		type:        String,
	},)
	@IsNotEmpty()
	@IsString()
	public id!: string

	@ApiProperty({
		description: 'Target type',
		type:        String,
	},)
	@IsNotEmpty()
	@IsString()
	public target!: string

	@ApiProperty({
		description: 'Target type',
		enum:        Target,
	},)
	@IsNotEmpty()
	@IsEnum(Target,)
	public targetType!: Target
}

export class CreateCouponDto {
	@ApiProperty({
		description: 'Coupon title',
		type:        String,
		example:     'Summer Sale',
	},)
	@IsNotEmpty()
	@IsString()
	public title!: string

	@ApiProperty({
		description: 'Coupon type',
		enum:        CouponType,
		example:     CouponType.VOLUME_OF_CASH,
	},)
	@IsNotEmpty()
	@IsEnum(CouponType,)
	public type!: CouponType

	@ApiProperty({
		description: 'Discount amount',
		type:        Number,
		example:     20,
	},)
	@IsNotEmpty()
	@IsNumber()
	@Min(0,)
	public discount!: number

	@ApiProperty({
		description: 'Discount type',
		enum:        DiscountType,
		example:     DiscountType.PERCENTAGE,
	},)
	@IsNotEmpty()
	@IsEnum(DiscountType,)
	@Transform(({ value, },) => {
		if (value === 'POUNDS') {
			return DiscountType.AMOUNT
		}
		return value
	},)
	public discountType!: DiscountType

	@ApiProperty({
		description: 'Minimum order amount',
		type:        Number,
		nullable:    true,
		example:     100,
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
	},)
	@IsNotEmpty()
	@IsDateString()
	public startDate!: string

	@ApiProperty({
		description: 'End date',
		type:        String,
		format:      'date-time',
		example:     '2024-12-31T23:59:59.999Z',
	},)
	@IsNotEmpty()
	@IsDateString()
	public endDate!: string

	// @ApiProperty({
	// 	description: 'Owner ID',
	// 	type:        String,
	// },)
	// @IsNotEmpty()
	// @IsString()
	// public ownerId!: string

	@ApiProperty({
		description: 'Coupon targets',
		type:        [CouponTargetDto,],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	public targets?: Array<CouponTargetDto>
}