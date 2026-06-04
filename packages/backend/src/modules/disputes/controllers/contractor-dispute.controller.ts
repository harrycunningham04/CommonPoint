/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { ContractorDisputeService, } from '../services/contractor-dispute.service'
import { Prisma,} from '@prisma/client'
import type { ContractorDispute, } from '@prisma/client'
import { GetDisputeDto, } from '../dto/disputes.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { DisputeResDto, } from '../dto/disputes-res.dto'
import { PagedDisputesByAddressDto, } from '../dto/paged-by-address.dto'
import { CreateContractorDisputeDto, } from '../dto/create-contractor-dispute.dto'
import { LocationVariants, ReasonVariants, SolutionVariants,} from '../disputes.type'
import type { GenericVariants, IDisputeRes, LocationVariantsEnum, ReasonVariantsEnum, SolutionVariantsEnum, } from '../disputes.type'
import { CreateReportDto, } from '../dto/report.dto'
import type { GetDisputeClientDetailDto, } from '../dto/get-dispute-client-admin.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('disputes',)
export class ContractorDisputeController {
	constructor(private readonly contractorDisputeService: ContractorDisputeService,) { }

	@Post()
	@UseGuards(ContractorAuthGuard,)
	public async createDispute(@Body() data: CreateContractorDisputeDto, @User() userId: string,): Promise<IDisputeRes | null> {
		return this.contractorDisputeService.createDispute(userId, data,)
	}

	@Post('report',)
	@UseGuards(ContractorAuthGuard,)
	public async createReport(@Body() data: CreateReportDto, @User() userId: string,): Promise<IDisputeRes | null> {
		return this.contractorDisputeService.createReport(userId, data,)
	}

	@Get('report/info',)
	@UseGuards(ContractorAuthGuard,)
	public async getInfoForReportScreen(): Promise<{
		location: GenericVariants<LocationVariantsEnum>,
		problem:  GenericVariants<ReasonVariantsEnum>,
		solution: GenericVariants<SolutionVariantsEnum>,
	}> {
		return {
			location: LocationVariants,
			problem:  ReasonVariants,
			solution: SolutionVariants,
		}
	}

	@Get('contractor',)
	@UseGuards(ContractorAuthGuard,)
	public async getDisputes(@Query() query: GetDisputeDto, @User() userId: string,): Promise<{ data: Array<ContractorDispute>, hasNext: boolean }> {
		return this.contractorDisputeService.getDisputes(query, userId,)
	}

	@Get('contractor-details/:id',)
	@UseGuards(ContractorAuthGuard,)
	public async getDisputeDetails(@Param('id',) id: string,): Promise<GetDisputeClientDetailDto> {
		return this.contractorDisputeService.getDisputeDetails(id,)
	}

	@Patch('contractor/:id',)
	@UseGuards(ContractorAuthGuard,)
	public async changeDispute(
	  @Param('id',) disputeId: string,
	  @Body() body: Prisma.ContractorDisputeUpdateInput,
	): Promise<ContractorDispute> {
		return this.contractorDisputeService.updateDispute(disputeId, body,)
	}

	@Get()
	@UseGuards(ContractorAuthGuard,)
	public async getGroupedDisputes(@Query() query: PageOptionsDto, @User() userId: string,): Promise<PagedResDto<DisputeResDto>> {
		return this.contractorDisputeService.getGroupedDisputes(userId, query,)
	}

	@Get('by-address',)
	@UseGuards(ContractorAuthGuard,)
	public async getDisputesByAddress(@Query() query: PagedDisputesByAddressDto, @User() userId: string,): Promise<PagedResDto<DisputeResDto>> {
		return this.contractorDisputeService.getManyByAddress(userId, query,)
	}
}
