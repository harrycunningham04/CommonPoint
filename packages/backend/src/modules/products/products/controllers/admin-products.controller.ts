import { Controller, Get, Param, Query, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, } from '@nestjs/swagger'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { AdminProductService, } from '../services/admin-product.service'
import type { ProductForOfficeDto,} from '../dto/products.dto'
import { GetAdminProductsQueryDto, } from '../dto/products.dto'
import type { ProductResponseDto,} from '../dto/product-response.dto'
import { PagedProductsResponseDto, } from '../dto/product-response.dto'

@Controller('admin/products',)
@UseGuards(AdminAuthGuard,)
@ApiTags('Admin Products',)
export class AdminProductsController {
	constructor(private readonly adminProductService: AdminProductService,) {}

	@Get()
	@ApiOperation({ summary: 'Get products with pagination, filtering, and sorting',},)
	@ApiResponse({ status: 200, description: 'Returns a paginated list of products.', type: PagedProductsResponseDto,},)
	public async getProducts(
		@Query() query: GetAdminProductsQueryDto,
	): Promise<PagedResDto<ProductResponseDto>> {
		return this.adminProductService.getProducts(query,)
	}

	@Get('office/:officeId',)
	@ApiOperation({ summary: 'Get products for office',},)
	@ApiResponse({ status: 200, description: 'Returns a paginated list of products.', type: PagedProductsResponseDto,},)
	public async getProductsByOffice(
		@Param('officeId',) officeId: string,
	): Promise<Array<ProductForOfficeDto>> {
		return this.adminProductService.getProductsByOffice(officeId,)
	}
}