/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, Post, Delete, Param, Query, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, } from '@nestjs/swagger'
import { OfficePackagesService, } from './office-packages.service'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { OfficePackagesQueryDto, } from '../dto/office-packages-query.dto'
import type { GetListPackagesDto, } from '../dto/get-list-packages.dto'

@Controller('office-packages',)
@UseGuards(AdminAuthGuard,)
@ApiTags('Office Packages',)
export class OfficePackagesController {
	constructor(private readonly officePackagesService: OfficePackagesService,) {}

	@Get('office/:officeId',)
	@ApiOperation({ summary: 'Get packages for specific office',},)
	@ApiResponse({ status: 200, description: 'Returns packages for office with pagination.',},)
	@ApiParam({ name: 'officeId', description: 'Office ID',},)
	public async getOfficePackages(
		@Param('officeId',) officeId: string,
		@Query() query: OfficePackagesQueryDto,
	): Promise<PagedResDto<GetListPackagesDto>> {
		return this.officePackagesService.getOfficePackages(officeId, query,)
	}

	@Post('office/:officeId/package/:packageId',)
	@ApiOperation({ summary: 'Assign package to office',},)
	@ApiResponse({ status: 201, description: 'Package assigned to office successfully.',},)
	@ApiParam({ name: 'officeId', description: 'Office ID',},)
	@ApiParam({ name: 'packageId', description: 'Package ID',},)
	public async assignPackageToOffice(
		@Param('officeId',) officeId: string,
		@Param('packageId',) packageId: string,
	): Promise<void> {
		return this.officePackagesService.assignPackageToOffice(officeId, packageId,)
	}

	@Delete('office/:officeId/package/:packageId',)
	@ApiOperation({ summary: 'Unassign package from office',},)
	@ApiResponse({ status: 200, description: 'Package unassigned from office successfully.',},)
	@ApiParam({ name: 'officeId', description: 'Office ID',},)
	@ApiParam({ name: 'packageId', description: 'Package ID',},)
	public async unassignPackageFromOffice(
		@Param('officeId',) officeId: string,
		@Param('packageId',) packageId: string,
	): Promise<void> {
		return this.officePackagesService.unassignPackageFromOffice(officeId, packageId,)
	}
}