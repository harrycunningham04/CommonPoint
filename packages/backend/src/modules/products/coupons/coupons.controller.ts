/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, Post, Body, Query, Res, Put, Param, Delete, UseGuards, } from '@nestjs/common'
import { CouponService, } from './coupons.service'
import type { Coupon, } from '@prisma/client'
import { Response, } from 'express'
import { GetAdditionalDiscountDto, GetDiscountDto, } from './dto/get-discount.dto'
import { CouponListDto, } from './dto/coupon-list.dto'
import { CreateCouponDto, } from './dto/coupon-create.dto'
import { UpdateCouponDto, } from './dto/coupon-update.dto'
import type { CouponResponseDto, } from './dto/coupon-response.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { User, } from 'src/shared/decorators/user.decorator'
import { ReqAdmin, } from 'src/shared/decorators/admin.decorator'
import { IRequestAdmin, } from 'src/modules/admin/admin.types'
import type { CouponDiscountDto, } from './dto/coupon-discount.dto'

@Controller('coupons',)
export class CouponController {
	constructor(private readonly couponService: CouponService,) {}

	@Get()
	public async getCoupons(@Query() query: CouponListDto,): Promise<PagedResDto<CouponResponseDto>> {
		return this.couponService.getCoupons(query,)
	}

	@Get('discounts',)
	public async getAllUniqueDiscounts(): Promise<Array<CouponDiscountDto>> {
		return this.couponService.getAllUniqueDiscounts()
	}

	@Get(':id',)
	public async getCouponById(@Param('id',) id: string,): Promise<CouponResponseDto> {
		return this.couponService.getCouponById(id,)
	}

	@Get('discount',)
	public async getDiscount(@Query() query: GetDiscountDto,): Promise<number> {
		return this.couponService.calculateDiscount(query,)
	}

	@Get('discount/additional',)
	public async getAdditionalDiscount(@Query() query: GetAdditionalDiscountDto,): Promise<number> {
		return this.couponService.getCouponForAdditionalPhotos(query,)
	}

	@UseGuards(AdminAuthGuard,)
	@Post()
	public async createCoupon(@ReqAdmin() reqAdmin: IRequestAdmin, @Body() data: CreateCouponDto,): Promise<CouponResponseDto> {
		return this.couponService.createCoupon(reqAdmin.id, data,)
	}

	@Put(':id',)
	public async updateCoupon(@Param('id',) id: string, @Body() data: UpdateCouponDto,): Promise<CouponResponseDto> {
		return this.couponService.updateCoupon(id, data,)
	}

	@Delete(':id',)
	public async deleteCoupon(@Param('id',) id: string,): Promise<{ message: string }> {
		return this.couponService.deleteCoupon(id,)
	}

	@Get('export',)
	public async exportCoupons(@Query() query: CouponListDto, @Res() res: Response,): Promise<void> {
		await this.couponService.exportCoupons(query, res,)
	}
}
