import { Controller, Get, Query, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, } from '@nestjs/swagger'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { PackageService, } from './packages.service'
import { PackagesQueryDto, } from './dto/packages-query.dto'
import type { GetListPackagesDto, } from './dto/get-list-packages.dto'

@Controller('admin/packages',)
@UseGuards(AdminAuthGuard,)
@ApiTags('Admin Packages',)
export class AdminPackagesController {
	constructor(private readonly packageService: PackageService,) {}

	@Get()
	@ApiOperation({ summary: 'Get packages with pagination, filtering, and sorting',},)
	@ApiResponse({ status: 200, description: 'Returns a paginated list of packages.', type: PagedResDto<GetListPackagesDto>,},)
	public async getPackages(@Query() query: PackagesQueryDto,): Promise<PagedResDto<GetListPackagesDto>> {
		console.log(query, ' query',)
		return this.packageService.getPackagesPaginated(query,)
	}
}
