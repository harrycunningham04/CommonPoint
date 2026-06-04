import { Controller, Get, Post, Delete, Param, Query, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, } from '@nestjs/swagger'
import { ClientPackagesService, } from './client-packages.service'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { ClientPackagesQueryDto, } from '../dto/client-packages-query.dto'
import type { GetListPackagesDto, } from '../dto/get-list-packages.dto'

@Controller('client-packages',)
@UseGuards(AdminAuthGuard,)
@ApiTags('Client Packages',)
export class ClientPackagesController {
	constructor(private readonly clientPackagesService: ClientPackagesService,) {}

	@Get('b2b/:clientId',)
	@ApiOperation({ summary: 'Get packages for B2B client (includes client and office packages)',},)
	@ApiResponse({ status: 200, description: 'Returns packages for B2B client with pagination.',},)
	@ApiParam({ name: 'clientId', description: 'B2B Client ID',},)
	public async getB2BClientPackages(
		@Param('clientId',) clientId: string,
		@Query() query: ClientPackagesQueryDto,
	): Promise<PagedResDto<GetListPackagesDto>> {
		return this.clientPackagesService.getB2BClientPackages(clientId, query,)
	}

	@Post('b2b/:clientId/package/:packageId',)
	@ApiOperation({ summary: 'Assign package to B2B client',},)
	@ApiResponse({ status: 201, description: 'Package assigned to B2B client successfully.',},)
	@ApiParam({ name: 'clientId', description: 'B2B Client ID',},)
	@ApiParam({ name: 'packageId', description: 'Package ID',},)
	public async assignPackageToB2BClient(
		@Param('clientId',) clientId: string,
		@Param('packageId',) packageId: string,
	): Promise<void> {
		return this.clientPackagesService.assignPackageToB2BClient(clientId, packageId,)
	}

	@Delete('b2b/:clientId/package/:packageId',)
	@ApiOperation({ summary: 'Unassign package from B2B client',},)
	@ApiResponse({ status: 200, description: 'Package unassigned from B2B client successfully.',},)
	@ApiParam({ name: 'clientId', description: 'B2B Client ID',},)
	@ApiParam({ name: 'packageId', description: 'Package ID',},)
	public async unassignPackageFromB2BClient(
		@Param('clientId',) clientId: string,
		@Param('packageId',) packageId: string,
	): Promise<void> {
		return this.clientPackagesService.unassignPackageFromB2BClient(clientId, packageId,)
	}
}