import { Controller, Get, Param, Query, UseGuards, } from '@nestjs/common'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { AdminDisputeService, } from '../services/admin-dispute.service'
import { GetDisputeDto, } from '../dto/disputes.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { GetDisputeClientAdminDto, } from '../dto/get-dispute-client-admin.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ApiOkResponse, ApiParam, ApiQuery, } from '@nestjs/swagger'
import type { AdminDisputeResDto, } from '../dto/disputes-res.dto'

@Controller('disputes',)
@UseGuards(AdminAuthGuard,)
export class AdminDisputeController {
	constructor(private readonly adminDisputeService: AdminDisputeService,) {}

    @Get('admin/contractor-admin',)
    @ApiOkResponse({ type: PagedResDto<GetDisputeClientAdminDto>, },)
    @ApiQuery({ type: GetDisputeDto, },)
	public async getDisputesAdmin(@Query() query: GetDisputeDto,): Promise<PagedResDto<GetDisputeClientAdminDto>> {
		return this.adminDisputeService.getDisputesAdmin(query,)
	}

    @Get('admin/contractor-admin-report/:bookingId',)
    @ApiOkResponse({ type: PagedResDto<GetDisputeClientAdminDto>, },)
    @ApiQuery({ type: PageOptionsDto, },)
    @ApiParam({ type: String, name: 'bookingId',},)
    public async getDisputesAdminWithReport(@Query() query: PageOptionsDto, @Param('bookingId',) bookingId: string,): Promise<PagedResDto<AdminDisputeResDto>> {
    	return this.adminDisputeService.getDisputesAdminWithReport(query, bookingId,)
    }
}