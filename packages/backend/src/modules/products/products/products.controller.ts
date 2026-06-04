/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	Res,
	UseGuards,
} from '@nestjs/common'
import { Response, } from 'express'
import { ProductService, } from './products.service'
import type { Product, ProductType, } from '@prisma/client'
import { CreateProductDto, } from './dto/create-product.dto'
import { ChangeProductDto, } from './dto/change-product.dto'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { SetSpecialPriceDto, } from './dto/set-special-price.dto'
import { ApiTags, } from '@nestjs/swagger'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { BasicProductTypeDto, ProductWithTypesDto, } from './dto/get-product-variant-booking.dto'
import { BookingProductVariantDto,  BookingProductDto,} from './dto/get-product-variant-booking.dto'
import { GetProductVariantsQuery, ProductVariantDto, } from './dto/product-variant.dto'

@ApiTags('products',)
@Controller('products',)
export class ProductController {
	constructor(private readonly productService: ProductService,) {}

    @Get()
	public async getProducts(@Query() query: any,): Promise<any> {
		return this.productService.getProducts(query,)
	}

    @Get('booking-form',)
    public async getProductInfoBooking(
        @Query() query: BookingProductDto,
    ): Promise<PagedResDto<ProductWithTypesDto>> {
    	return this.productService.getBookingProducts(query,)
    }

    @Get('booking-variants',)
    public async getProductVariant(
        @Query() query: BookingProductVariantDto,
    ): Promise<PagedResDto<BasicProductTypeDto>> {
    	return this.productService.getProductTypes(query,)
    }

    @Get('variants',)
    public async getVariants(@Query() query: GetProductVariantsQuery,): Promise<PagedResDto<ProductType>> {
    	return this.productService.getProductVariants(query,)
    }

    @Get('variants/frequently-ordered',)
    public async getFrequentlyOrdered(
        @Query() query: BookingProductDto,
    ): Promise<Array<ProductType>> {
    	return this.productService.getFrequentlyOrdered(query,)
    }

    @Post()
    public async addProduct(@Body() body: CreateProductDto,): Promise<Product> {
    	return this.productService.addProduct({ ...body, },)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Put(':id',)
    public async updateProduct(
        @Body() body: ChangeProductDto,
    ): Promise<Product> {
    	return this.productService.updateProduct({ ...body, },)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Put('product-variant/:id',)
    public async updateProductVariant(
        @Param('id', ParseUUIDPipe,) id: string,
        @Body() body: ProductVariantDto,
    ) {
    	return this.productService.updateProductVariant(id, body,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Post(':id/product-variant',)
    public async createProductVariant(
        @Body() body: ProductVariantDto,
        @Param('id', ParseUUIDPipe,) id: string,
    ) {
    	return this.productService.createProductVariant(id, body,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Delete('product-variant/:id',)
    public async deleteProductVariant(@Param('id', ParseUUIDPipe,) id: string,) {
    	return this.productService.deleteProductVariant(id,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Put(':id/archive',)
    public async archiveProduct(@Param('id',) productId: string,): Promise<any> {
    	return this.productService.archiveProduct(productId,)
    }

    @Get('export',)
    public async exportProducts(
        @Query() query: any,
        @Res() res: Response,
    ): Promise<void> {
    	return this.productService.exportProducts(query, res,)
    }

    @Get('types',)
    public async getAllProductTypes() {
    	return this.productService.getAllProductTypes()
    }

    @Get(':targetId/special-prices',)
    public async getSpecialPrices(
        @Param('targetId',) targetId: string,
        @Query('targetType',) targetType: 'B2B' | 'B2C' | 'Subbrand' | 'Office',
    ) {
    	return this.productService.getSpecialPrices(targetId, targetType,)
    }

    @Post('special-price',)
    public async setSpecialPrice(@Body() body: SetSpecialPriceDto,) {
    	const { targetId, targetType, productTypeId, price, } = body
    	return this.productService.setSpecialPrice(
    		targetId,
    		targetType,
    		productTypeId,
    		price,
    	)
    }
}
