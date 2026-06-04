/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { Prisma, } from '@prisma/client'
import type { ClientDispute, } from '@prisma/client'
import { ClientDisputeService, } from '../services/client-dispute.service'
import { Roles, } from 'src/shared/roles.decorator'
import { AdminAuthGuard, ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { GetDisputeDto, } from '../dto/disputes.dto'
import { CreateDisputeDto, } from '../dto/create-dispute.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { GetDisputeClientAdminDto, GetDisputeClientDetailDto, } from '../dto/get-dispute-client-admin.dto'

@Controller('disputes',)
export class ClientDisputeController {
	constructor(private readonly clientDisputeService: ClientDisputeService,) { }

	@UseGuards(ClientAuthGuard,)
	@Get('client/disputes-admin',)
	public async getAdminDisputes(@Query() query: GetDisputeDto,):Promise<PagedResDto<GetDisputeClientAdminDto>> {
		return this.clientDisputeService.getAdminClientDisputes(query,)
	}

	// @UseGuards(ClientAuthGuard, )
	@Get('client-disputes-detail/:id',)
	public async getClientDisputeDetail(@Param('id',) id:string,):Promise<GetDisputeClientDetailDto> {
		return this.clientDisputeService.getClientDisputeDetail(id,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('client/:clientId',)
	public async getClientDisputes(@Query() query: GetDisputeDto, @Param('clientId',) clientId:string,): Promise<{ disputes: Array<GetDisputeClientAdminDto>, total: number }> {
		return this.clientDisputeService.getDisputes(query,clientId,)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@UseGuards(AdminAuthGuard,)
	@Patch('client/:id',)
	public async changeDispute(
		@Param('id',) disputeId: string,
		@Body() body: Prisma.ClientDisputeUpdateInput,
	): Promise<ClientDispute> {
		// @ts-ignore
		return this.clientDisputeService.updateDispute(disputeId, body,)
	}

	@UseGuards(ClientAuthGuard,)
	@Post('client/create-dispute',)
	public async createDispute(
		@Body() data : CreateDisputeDto,
	):Promise<ClientDispute> {
		return this.clientDisputeService.createClientDispute(data,)
	}
}
