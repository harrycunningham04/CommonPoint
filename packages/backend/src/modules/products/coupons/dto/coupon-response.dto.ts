import { ApiProperty, } from '@nestjs/swagger'
import type { Coupon,} from '@prisma/client'
import { CouponType, DiscountType, } from '@prisma/client'

export class CouponResponseDto {
	@ApiProperty({
		description: 'Coupon ID',
		type:        String,
	},)
	public id!: string

	@ApiProperty({
		description: 'Coupon title',
		type:        String,
	},)
	public title!: string

	@ApiProperty({
		description: 'Coupon code',
		type:        String,
	},)
	public code!: string

	@ApiProperty({
		description: 'Coupon type',
		enum:        CouponType,
	},)
	public type!: CouponType

	@ApiProperty({
		description: 'Discount amount',
		type:        Number,
	},)
	public discount!: number

	@ApiProperty({
		description: 'Discount type',
		enum:        DiscountType,
	},)
	public discountType!: DiscountType

	@ApiProperty({
		description: 'Minimum order amount',
		type:        Number,
		nullable:    true,
	},)
	public minAmount!: number | null

	@ApiProperty({
		description: 'Minimum number of orders',
		type:        Number,
		nullable:    true,
	},)
	public minOrders!: number | null

	@ApiProperty({
		description: 'Start date',
		type:        Date,
	},)
	public startDate!: Date

	@ApiProperty({
		description: 'End date',
		type:        Date,
	},)
	public endDate!: Date

	@ApiProperty({
		description: 'Stripe coupon ID',
		type:        String,
		nullable:    true,
	},)
	public stripeId!: string | null

	@ApiProperty({
		description: 'Owner ID',
		type:        String,
	},)
	public ownerId! : string

	@ApiProperty({
		description: 'Created at',
		type:        Date,
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'Updated at',
		type:        Date,
	},)
	public updatedAt!: Date

	@ApiProperty({
		description: 'Coupon targets',
		type:        Array,
	},)
	public targets!: Array<{
		id: string
		couponId: string
		targetId: string
		target: string
		targetType: string
	}>

	public static cast(coupon: Coupon & { targets?: Array<{ id: string; couponId: string; targetId: string; target: string; targetType: string }> },): CouponResponseDto {
		const dto = new CouponResponseDto()
		dto.id = coupon.id
		dto.title = coupon.title
		dto.code = coupon.code
		dto.type = coupon.type
		dto.discount = coupon.discount
		dto.discountType = coupon.discountType
		dto.minAmount = coupon.minAmount
		dto.minOrders = coupon.minOrders
		dto.startDate = coupon.start_date
		dto.endDate = coupon.end_date
		dto.stripeId = coupon.stripeId
		dto.ownerId = coupon.owner_id
		dto.createdAt = coupon.created_at
		dto.updatedAt = coupon.updated_at
		dto.targets = coupon.targets ?? []
		return dto
	}
}