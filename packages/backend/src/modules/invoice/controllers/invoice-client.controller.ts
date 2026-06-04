/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get, Param, Query, UseGuards, } from '@nestjs/common'
import { InvoiceClientService, } from '../services/invoice-client.service'
import { GetStatisticDto, GetStatisticResponseDto, } from '../dto/get-statistic.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { BasicInvoiceClientDto, GetInvoiceClientQuery, } from '../dto/get-client-dto'
import { AdminAuthGuard, ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'

@Controller('client-invoices',)
@UseGuards(ClientAuthGuard,)
export class InvoiceClientController {
	constructor(private readonly invoiceClientService : InvoiceClientService,) {}

	@Get('invoices-statistic',)
	public async getBookingStatistic(@Query() query : GetStatisticDto,) : Promise<GetStatisticResponseDto> {
		return this.invoiceClientService.getBookingInvoiceStatistic(query,)
	}

	@Get('invoice-not-paid/:clientId',)
	public async getInvoiceNotPaid(@Param('clientId',) clientId:string,): Promise<{
		isInvoiceNotPaid: boolean,
	}> {
		const isInvoiceNotPaid = await this.invoiceClientService.getIsInvoiceNotPaid(clientId,)
		return {
			isInvoiceNotPaid,
		}
	}

	@Get('/:clientType',)
	public async getInvoicesClient(@User() clientId:string, @Query() query : GetInvoiceClientQuery,):Promise<PagedResDto<BasicInvoiceClientDto>> {
		const invoices =
			await this.invoiceClientService.getInvoicesClient(clientId,query,)

		return invoices
	}

	@Get('admin/office/:officeId',)
	@UseGuards(RolesGuard,)
	@Roles(2,)
	@UseGuards(AdminAuthGuard,)
	public async getInvoicesByOffice(@Param('officeId',) officeId:string, @Query() query : GetInvoiceClientQuery,):Promise<PagedResDto<BasicInvoiceClientDto>> {
		return this.invoiceClientService.getInvoicesByOffice(officeId,query,)
	}

	@Get('admin/client/:clientId',)
	@UseGuards(RolesGuard,)
	@Roles(2,)
	@UseGuards(AdminAuthGuard,)
	public async getInvoicesAdmin(@Param('clientId',) clientId:string, @Query() query : GetInvoiceClientQuery,):Promise<PagedResDto<BasicInvoiceClientDto>> {
		return this.invoiceClientService.getInvoicesClient(clientId, query,)
	}
}