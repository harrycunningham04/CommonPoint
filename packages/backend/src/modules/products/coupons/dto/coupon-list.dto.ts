import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsString, IsArray, IsBooleanString, IsNumberString, } from 'class-validator'
import { Type, } from 'class-transformer'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { CouponType, DiscountType, } from '@prisma/client'
import { CouponDiscountDto, } from './coupon-discount.dto'

export enum CouponSortBy {
	TITLE = 'title',
	DISCOUNT = 'discount',
	START_DATE = 'startDate',
	END_DATE = 'endDate',
	CREATED_AT = 'createdAt',
}

export enum CouponSortDirection {
	ASC = 'asc',
	DESC = 'desc',
}

export class CouponFilterDto {
	@ApiProperty({
		description: 'Filter by coupon types',
		type:        [String,],
		example:     ['PERCENTAGE', 'AMOUNT',],
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(CouponType, { each: true, },)
	public types?: Array<CouponType>

	@ApiProperty({
		description: 'Filter by discount types',
		type:        [String,],
		example:     ['PERCENTAGE', 'AMOUNT',],
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(DiscountType, { each: true, },)
	public discountTypes?: Array<DiscountType>

	@ApiProperty({
		description: 'Filter by minimum discount amount',
		type:        Number,
		example:     10,
	},)
	@IsOptional()
	@IsNumberString()
	public minDiscount?: string

	@ApiProperty({
		description: 'Filter by maximum discount amount',
		type:        Number,
		example:     50,
	},)
	@IsOptional()
	@IsNumberString()
	public maxDiscount?: string

	@ApiProperty({
		description: 'Filter by active status',
		type:        String,
		example:     'true',
	},)
	@IsOptional()
	@IsBooleanString()
	public isActive?: string

	@ApiProperty({
		description: 'Filter by expired status',
		type:        String,
		example:     'false',
	},)
	@IsOptional()
	@IsBooleanString()
	public isExpired?: string

	@ApiProperty({
		description: 'Filter by discount',
		type:        CouponDiscountDto,
	},)
	@IsOptional()
	@Type(() => {
		return CouponDiscountDto
	},)
	public discount?: CouponDiscountDto

	@ApiProperty({
		description: 'Sort by field',
		enum:        CouponSortBy,
		example:     CouponSortBy.TITLE,
	},)
	@IsOptional()
	@IsEnum(CouponSortBy,)
	public sortBy?: CouponSortBy

	@ApiProperty({
		description: 'Sort direction',
		enum:        CouponSortDirection,
		example:     CouponSortDirection.ASC,
	},)
	@IsOptional()
	@IsEnum(CouponSortDirection,)
	public sortDirection?: CouponSortDirection
}

export class CouponListDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for coupon title or code',
		type:        String,
		example:     'summer',
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		description: 'Filter options',
		type:        CouponFilterDto,
	},)
	@IsOptional()
	@Type(() => {
		return CouponFilterDto
	},)
	public filter?: CouponFilterDto
}