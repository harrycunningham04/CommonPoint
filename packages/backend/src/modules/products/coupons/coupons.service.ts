/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-underscore-dangle */
/* eslint-disable complexity */
/* eslint-disable no-await-in-loop */
import { Injectable, Logger, NotFoundException, BadRequestException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma,} from '@prisma/client'
import { Target, type Coupon, DiscountType, } from '@prisma/client'
import type { Response, } from 'express'
import { unparse, } from 'papaparse'
import { StripeService, } from 'src/modules/stripe/stripe.service'
import { generateCouponCode, } from 'src/shared/utils/code-generator.util'
import { ProductVariantDto, } from '../products/dto/product-variant.dto'
import type { GetAdditionalDiscountDto, GetDiscountDto, } from './dto/get-discount.dto'
import { isAfter, isBefore, } from 'date-fns'
import { ProductService, } from '../products/products.service'
import type { CouponListDto, } from './dto/coupon-list.dto'
import type { CreateCouponDto, } from './dto/coupon-create.dto'
import type { UpdateCouponDto, } from './dto/coupon-update.dto'
import { CouponResponseDto, } from './dto/coupon-response.dto'
import { CouponSortBy, CouponSortDirection, } from './dto/coupon-list.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { CouponDiscountDto, } from './dto/coupon-discount.dto'

@Injectable()
export class CouponService {
	private readonly logger = new Logger(CouponService.name,)

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService,
		private readonly productService: ProductService,
	) {}

	private buildCouponSearchConditions(search: string,): Array<Prisma.CouponWhereInput> {
		return [
			{ title: { contains: search, mode: 'insensitive', }, },
			{ code: { contains: search, mode: 'insensitive', }, },
		]
	}

	public async getCoupons(query: CouponListDto,): Promise<PagedResDto<CouponResponseDto>> {
		const { filter, search, skip, take, } = query
		const where: Prisma.CouponWhereInput = {}

		if (filter) {
			if (filter.types && filter.types.length > 0) {
				where.type = { in: filter.types, }
			}

			if (filter.discountTypes && filter.discountTypes.length > 0) {
				where.discountType = { in: filter.discountTypes, }
			}

			if (filter.minDiscount) {
				where.discount = { gte: Number(filter.minDiscount,), }
			}

			if (filter.maxDiscount) {
				where.discount = { lte: Number(filter.maxDiscount,), }
			}

			if (filter.isActive !== undefined) {
				const now = new Date()
				if (filter.isActive === 'true') {
					where.AND = [
						{ start_date: { lte: now, }, },
						{ end_date: { gte: now, }, },
					]
				} else {
					where.OR = [
						{ start_date: { gt: now, }, },
						{ end_date: { lt: now, }, },
					]
				}
			}

			if (filter.isExpired !== undefined) {
				const now = new Date()
				if (filter.isExpired === 'true') {
					where.end_date = { lt: now, }
				} else {
					where.end_date = { gte: now, }
				}
			}

			if (filter.discount) {
				where.discount = filter.discount.discount
				where.discountType = filter.discount.discountType
			}
		}

		if (search) {
			where.OR = this.buildCouponSearchConditions(search,)
		}

		const orderBy: Prisma.CouponOrderByWithRelationInput = {}
		if (filter?.sortBy) {
			let sortField: keyof Prisma.CouponOrderByWithRelationInput
			if (filter.sortBy === CouponSortBy.START_DATE) {
				sortField = 'start_date'
			} else if (filter.sortBy === CouponSortBy.END_DATE) {
				sortField = 'end_date'
			} else if (filter.sortBy === CouponSortBy.CREATED_AT) {
				sortField = 'created_at'
			} else {
				sortField = filter.sortBy
			}
			orderBy[sortField] = filter.sortDirection ?? CouponSortDirection.ASC
		} else {
			orderBy.created_at = CouponSortDirection.DESC
		}

		const [coupons, totalCount,] = await Promise.all([
			this.prisma.coupon.findMany({
				where,
				orderBy,
				skip,
				take,
				include: {
					targets: true,
				},
			},),
			this.prisma.coupon.count({ where, },),
		],)

		return {
			data: coupons.map((coupon,) => {
				return CouponResponseDto.cast(coupon,)
			},),
			hasNext: totalCount > skip + take,
		}
	}

	public async getCouponById(id: string,): Promise<CouponResponseDto> {
		const coupon = await this.prisma.coupon.findUnique({
			where:   { id, },
			include: {
				targets: true,
			},
		},)

		if (!coupon) {
			throw new NotFoundException('Coupon not found',)
		}

		return CouponResponseDto.cast(coupon,)
	}

	private validateCoupon(coupon: Coupon, orderSummary: number,): void {
		const now = new Date()
		if (isBefore(now, coupon.start_date,)) {
			throw new BadRequestException('Coupon is not yet active',)
		}

		if (isAfter(now, coupon.end_date,)) {
			throw new BadRequestException('Coupon has expired',)
		}

		if (coupon.minAmount !== null && coupon.minAmount > 0 && orderSummary < coupon.minAmount) {
			throw new BadRequestException('Minimum order amount not met',)
		}
	}

	public async calculateDiscount(query: GetDiscountDto,): Promise<number> {
		const { productVariantIds, code, } = query

		const [coupon, orderSummary,] = await Promise.all([
			this.prisma.coupon.findFirst({
				where: {
					code,
				},
				include: {
					targets: true,
				},
			},),
			this.prisma.productType.aggregate({
				where: {
					id: { in: productVariantIds, },
				},
				_sum: {
					price: true,
				},
				_count: {
					_all: true,
				},
			},),
		],)

		if (!coupon) {
			throw new NotFoundException('There is no coupon with this code',)
		}

		const now = new Date()
		if (isBefore(now, coupon.start_date,)) {
			throw new BadRequestException('Coupon is not yet active',)
		}

		if (isAfter(now, coupon.end_date,)) {
			throw new BadRequestException('Coupon has expired',)
		}

		if (orderSummary._count._all === 0) {
			throw new NotFoundException('No valid products found with the provided IDs',)
		}

		if (coupon.minOrders !== null && coupon.minOrders > 0 && orderSummary._count._all < coupon.minOrders) {
			throw new BadRequestException('Minimum order quantity not met',)
		}

		const totalPrice = orderSummary._sum.price ?? 0
		if (coupon.minAmount !== null && coupon.minAmount > 0 && totalPrice < coupon.minAmount) {
			throw new BadRequestException('Minimum order amount not met',)
		}

		const targetVariantIds = coupon.targets
			.map((target,) => {
				return target.targetId
			},)

		const productVariants = await this.prisma.productType.findMany({
			where: {
				id: { in: productVariantIds, },
			},
			include: {
				product: true,
			},
		},)

		let count = 0
		let hasValidTarget = false

		productVariants.forEach((productVariant,) => {
			if (targetVariantIds.includes(productVariant.product.id,)) {
				hasValidTarget = true
				if (coupon.discountType === DiscountType.AMOUNT) {
					count = count + coupon.discount
				} else {
					count = count + coupon.discount * productVariant.price / 100
				}
			}
		},)

		if (!hasValidTarget) {
			throw new BadRequestException('No products in the cart are eligible for this coupon',)
		}

		return count
	}

	public async getCouponForAdditionalPhotos(query: GetAdditionalDiscountDto,): Promise<number> {
		const { additionalPhotoIds, code, } = query

		const { totalSum, productTypes, } = await this.productService.getAdditionalPriceForPhotos(additionalPhotoIds,)

		const coupon = await this.prisma.coupon.findFirst({
			where:   { code, },
			include: {
				targets: true,
			},
		},)

		if (!coupon) {
			throw new NotFoundException('There is no coupon with this code',)
		}

		this.validateCoupon(coupon, totalSum,)
		let count = 0

		if (coupon.discountType === DiscountType.AMOUNT) {
			count = count + coupon.discount
		} else {
			count = count + coupon.discount * totalSum / 100
		}

		return count
	}

	public async createCoupon(adminId: string, data: CreateCouponDto,): Promise<CouponResponseDto> {
		const { targets, startDate, endDate, ...couponData } = data
		const newCode = generateCouponCode()

		const stripeCoupon = await this.stripeService.createCoupon({
			...couponData,
			code:            newCode,
			expiration_date: endDate,
			owner_id:        adminId,
			targets,
		},)

		const newCoupon = await this.prisma.coupon.create({
			data: {
				...couponData,
				code:       newCode,
				stripeId:   stripeCoupon.id,
				start_date: new Date(startDate,),
				end_date:   new Date(endDate,),
				owner:      {
					connect: {
						id: adminId,
					},
				},
			},
		},)

		if (targets && targets.length > 0) {
			for (const target of targets) {
				await this.prisma.couponTarget.create({
					data: {
						couponId:   newCoupon.id,
						targetId:   target.id,
						target:     target.target,
						targetType: target.targetType,
					},
				},)
			}
		}

		return this.getCouponById(newCoupon.id,)
	}

	public async updateCoupon(id: string, data: UpdateCouponDto,): Promise<CouponResponseDto> {
		const { targets, startDate, endDate, ...couponData } = data

		const updateData: Prisma.CouponUpdateInput = { ...couponData, }
		if (startDate) {
			updateData.start_date = new Date(startDate,)
		}
		if (endDate) {
			updateData.end_date = new Date(endDate,)
		}

		const updatedCoupon = await this.prisma.coupon.update({
			where: { id, },
			data:  updateData,
		},)

		if (targets !== undefined) {
			await this.prisma.couponTarget.deleteMany({
				where: { couponId: id, },
			},)

			if (targets && targets.length > 0) {
				for (const target of targets) {
					await this.prisma.couponTarget.create({
						data: {
							couponId:   id,
							targetId:   target.id,
							target:     target.target,
							targetType: target.targetType,
						},
					},)
				}
			}
		}

		return this.getCouponById(id,)
	}

	public async deleteCoupon(id: string,): Promise<{ message: string }> {
		const coupon = await this.prisma.coupon.findUnique({
			where: { id, },
		},)

		if (!coupon) {
			throw new NotFoundException('Coupon not found',)
		}

		await this.prisma.couponTarget.deleteMany({
			where: { couponId: id, },
		},)

		await this.prisma.coupon.delete({
			where: { id, },
		},)

		return { message: 'Coupon deleted successfully', }
	}

	public async exportCoupons(query: CouponListDto, res: Response,): Promise<void> {
		const { filter, search, } = query
		const where: Prisma.CouponWhereInput = {}

		if (filter) {
			if (filter.types && filter.types.length > 0) {
				where.type = { in: filter.types, }
			}

			if (filter.discountTypes && filter.discountTypes.length > 0) {
				where.discountType = { in: filter.discountTypes, }
			}

			if (filter.minDiscount) {
				where.discount = { gte: Number(filter.minDiscount,), }
			}

			if (filter.maxDiscount) {
				where.discount = { lte: Number(filter.maxDiscount,), }
			}

			if (filter.discount) {
				where.discount = filter.discount.discount
				where.discountType = filter.discount.discountType
			}
		}

		if (search) {
			where.OR = this.buildCouponSearchConditions(search,)
		}

		const orderBy: Prisma.CouponOrderByWithRelationInput = {}
		if (filter?.sortBy) {
			let sortField: keyof Prisma.CouponOrderByWithRelationInput
			if (filter.sortBy === CouponSortBy.START_DATE) {
				sortField = 'start_date'
			} else if (filter.sortBy === CouponSortBy.END_DATE) {
				sortField = 'end_date'
			} else if (filter.sortBy === CouponSortBy.CREATED_AT) {
				sortField = 'created_at'
			} else {
				sortField = filter.sortBy
			}
			orderBy[sortField] = filter.sortDirection ?? CouponSortDirection.ASC
		} else {
			orderBy.created_at = CouponSortDirection.DESC
		}

		const coupons = await this.prisma.coupon.findMany({
			where,
			orderBy,
			include: {
				targets: true,
			},
		},)

		const csvData = unparse(
			coupons.map((coupon,) => {
				return {
					title:        coupon.title,
					code:         coupon.code,
					type:         coupon.type,
					discount:     coupon.discount,
					discountType: coupon.discountType,
					minAmount:    coupon.minAmount,
					minOrders:    coupon.minOrders,
					startDate:    coupon.start_date.toISOString(),
					endDate:      coupon.end_date.toISOString(),
					createdAt:    coupon.created_at.toISOString(),
				}
			},),
		)
		res.setHeader('Content-Type', 'text/csv',)
		res.setHeader('Content-Disposition', 'attachment; filename="coupons.csv"',)
		res.send(csvData,)
	}

	public async getAllUniqueDiscounts(): Promise<Array<CouponDiscountDto>> {
		const discounts = await this.prisma.coupon.findMany({
			select: {
				discount:     true,
				discountType: true,
			},
			distinct: ['discount', 'discountType',],
		},)

		return discounts
	}
}
