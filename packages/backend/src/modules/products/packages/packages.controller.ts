/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Controller, Get, Query, Res, Post, Put, Param, Body, UseGuards, Delete, Patch, } from '@nestjs/common'
import { Response, } from 'express'
import { PackageService, } from './packages.service'
import type { Package, } from '@prisma/client'
import { CreatePackageDto, UpdatePackageDto, } from './dto/create-package.dto'
import { AdminAuthGuard, ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { ApiOkResponse, } from '@nestjs/swagger'
import type { BasicPackageDto,} from './dto/get-booking-package.dto'
import { GetBookingPackageDto, } from './dto/get-booking-package.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { GetListPackagesDto, } from './dto/get-list-packages.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import { PackagesQueryDto, } from './dto/packages-query.dto'

@Controller('packages',)
export class PackagesController {
	constructor(private readonly packagesService: PackageService,) {}

    @Get()
	public async getPackages(@Query() query: any,):Promise<{ data: Array<GetListPackagesDto>, }> {
		return this.packagesService.getPackages(query,)
	}

	@UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
	@Get('paginated',)
	@ApiOkResponse({
		description: 'Get packages with pagination',
	},)
    public async getPackagesPaginated(@Query() query: PackagesQueryDto,): Promise<PagedResDto<GetListPackagesDto>> {
    	return this.packagesService.getPackagesPaginated(query,)
    }

	@Get('booking-packages',)
	@UseGuards(ClientAuthGuard,)
	@ApiOkResponse({
		description: 'Packages for booking form',
	},)
	public async getBookingPackages(@User() clientId: string, @Query() query : GetBookingPackageDto,):Promise<PagedResDto<BasicPackageDto>> {
    	return this.packagesService.getBookingPackages(query,clientId,)
	}

	@UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
	@Post()
	public async addPackage(@Body() body: CreatePackageDto,): Promise<Package> {
    	return this.packagesService.addPackage(body,)
	}

	@Patch(':packageId',)
	public async updatePackage(@Param('packageId',) packageId: string, @Body() body: UpdatePackageDto,): Promise<Package> {
		return this.packagesService.updatePackage(packageId, body,)
	}

    @UseGuards(AdminAuthGuard,)
	@Get('export',)
	public async exportPackages(@Query() query: any, @Res() res: Response,): Promise<void> {
    	return this.packagesService.exportPackages(query, res,)
	}

	@UseGuards(AdminAuthGuard,)
	@Get('client',)
    public async getPackagesByClientId(@Query('clientId',) clientId: string,) {
	  return this.packagesService.getPackagesByClientId(clientId,)
    }

	@UseGuards(AdminAuthGuard,)
	@Get('subbrand',)
	public async getPackagesBySubbrandId(@Query('subbrandId',) subbrandId: string,) {
		return this.packagesService.getPackagesBySubbrandId(subbrandId,)
	}

	@Delete(':packageId',)
	public async deletePackage(@Param('packageId',) packageId: string,): Promise<void> {
		return this.packagesService.deletePackage(packageId,)
	}

	@Delete(':packageId/targets/:clientId',)
	public async deletePackageTarget(
    @Param('packageId',) packageId: string,
    @Param('clientId',) clientId: string,
	): Promise<void> {
		return this.packagesService.deletePackageTarget(packageId, clientId,)
	}

	@UseGuards(AdminAuthGuard,)
	@Get(':packageId/targets',)
	public async getPackageTargets(
    @Param('packageId',) packageId: string,
	) {
		return this.packagesService.getPackageTargets(packageId,)
	}
}
