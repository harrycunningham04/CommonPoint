/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get, Query, UseGuards, } from '@nestjs/common'
import { RegionService, } from '../services/client-region.service'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { CheckAddressDto, } from '../dto/check-address.dto'

@Controller('regions',)
export class RegionController {
	constructor(private readonly regionService: RegionService,) { }

	@UseGuards(ClientAuthGuard,)
	@Get('check-address',)
	public async checkAddress(@Query() query: CheckAddressDto,): Promise<boolean> {
		return this.regionService.checkAddressRegionAccessibility(query.address,)
	}
}
