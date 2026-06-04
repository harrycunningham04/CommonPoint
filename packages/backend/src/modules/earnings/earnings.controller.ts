/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Param, ParseUUIDPipe, Patch, } from '@nestjs/common'
import { EarningsService, } from './earnings.service'
import { ApiTags, } from '@nestjs/swagger'
import { UpdateRateDto, } from './dto/update-rate.dto'
@ApiTags('Earning Rates',)
@Controller('earnings',)
export class EarningsController {
	constructor(private readonly earningsService: EarningsService,) {}

    @Patch('update-by-filters',)
	public async updateByFilters() {}

    @Patch('update-default-rate',)
    public async updateDefaultRate(
        @Body() dto: UpdateRateDto,
    ) {
    	return this.earningsService.upsertDefaultEarningRate(dto,)
    }
}
