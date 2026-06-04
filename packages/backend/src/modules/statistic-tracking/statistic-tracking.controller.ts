import { Controller, Get, ParseUUIDPipe, Param, UseGuards, } from '@nestjs/common'
import { ContractorStatisticCalculationService, } from './services/contractor-statistic-calculation.service'
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags, } from '@nestjs/swagger'
import { DashboardDataDto, } from './dtos/dashboard.dto'
import { AdminDashboardDto, } from './dtos/adming-dashboard.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { User, } from 'src/shared/decorators/user.decorator'

@Controller('contractor-statistic',)
@ApiTags('Contractor Statistic',)
export class ContractorStatisticController {
	constructor(private readonly contractorStatisticCalculationService: ContractorStatisticCalculationService,) {}

	@Get('dashboard',)
	@ApiOperation({ summary: 'Get dashboard statistic for a contractor', description: 'Retrieves the dashboard statistic for a contractor based on their ID.', },)
	@ApiParam({ name: 'contractorId', description: 'The ID of the contractor to retrieve the dashboard statistic for.', type: String, required: true, },)
	@ApiOkResponse({ description: 'The dashboard statistic for the contractor.', type: DashboardDataDto, },)
	@UseGuards(ContractorAuthGuard,)
	public async getDashboardStatistic(@User() contractorId: string,): Promise<DashboardDataDto> {
		return this.contractorStatisticCalculationService.calculateDashboardDataForContractor(contractorId,)
	}

	@Get('admin-dashboard/:contractorId',)
	@ApiOperation({ summary: 'Get admin dashboard statistic for a contractor', description: 'Retrieves the admin dashboard statistic for a contractor based on their ID.', },)
	@ApiParam({ name: 'contractorId', description: 'The ID of the contractor to retrieve the admin dashboard statistic for.', type: String, required: true, },)
	@ApiOkResponse({ type: AdminDashboardDto, description: 'The admin dashboard statistic for the contractor.', },)
	public async getAdminDashboard(@Param('contractorId', ParseUUIDPipe,) contractorId:string,): Promise<AdminDashboardDto | undefined> {
		return this.contractorStatisticCalculationService.calculateAdminDashboard(contractorId,)
	}
}
