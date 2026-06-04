/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, Param, Query, UseGuards, } from '@nestjs/common'
import { InvoiceContractorService, } from '../services/invoice-contractor.service'
import { SearchInvoicesDto, } from '../dto/search.dto'
import type { ContractorInvoiceDto, ContractorInvoiceStatisticDto, } from '../dto/contractor-invoice.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import type { PagedCountResDto, } from 'src/shared/dto/pageg-count-res.dto'
import { StatisticInvoicesDto, } from '../dto/statistic.dto'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { AdminAuthGuard, ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('contractor-invoices',)
export class InvoiceContractorController {
	constructor(private readonly invoiceContractorService : InvoiceContractorService,) {}

  @Get()
  @UseGuards(ContractorAuthGuard,)
	public async getContractorInvoices(@User() userId: string, @Query() params: SearchInvoicesDto,): Promise<PagedCountResDto<ContractorInvoiceDto>> {
		return this.invoiceContractorService.getInvoices(userId, params,)
	}

	@Get('admin/:contractorId',)
	@UseGuards(RolesGuard,)
	@Roles(2,)
	@UseGuards(AdminAuthGuard,)
  public async getContractorInvoicesAdmin(@Param('contractorId',) contractorId: string, @Query() params: SearchInvoicesDto,): Promise<PagedCountResDto<ContractorInvoiceDto>> {
  	return this.invoiceContractorService.getInvoices(contractorId, params,)
  }

	@Get('statistic',)
	@UseGuards(ContractorAuthGuard,)
	public async getInvoicesStatistic(@User() userId:string, @Query() data : StatisticInvoicesDto,): Promise<ContractorInvoiceStatisticDto> {
  	return this.invoiceContractorService.getContractorInvoiceStatistic(userId,data,)
	}
}