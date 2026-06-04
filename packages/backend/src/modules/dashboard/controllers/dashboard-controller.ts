/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { DashboardService, } from '../services/dashboard.service'
import { AdminWidget, Widget, } from '@prisma/client'
import { UpdateDefaultsDto, UpdateWidgetDto, } from '../dto/change-dto'
import { GetGlobalSearchDto, } from '../dto/global-search.dto'
import { CreateAdminDto, } from 'src/modules/admin/dto'
import { CreateAdminWidgetDto, } from '../dto/create-widget-dto'
import { DeleteWidgetDto, } from '../dto/delete-widget-dto'

@Controller('dashboard',)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService,) {}

  @Get('get-widgets-admin/:id',)
	public async getAllWidgetsData(
    @Param('id',) adminId: string,
	): Promise<Array<AdminWidget>> {
	  await	this.dashboardService.initializeAdminsWidgets(adminId,)

		return this.dashboardService.getAllWidgets(adminId,)
	}

  @Get('global-search',)
  public async getGlobalSearch(@Query() query: GetGlobalSearchDto,) {
  	return this.dashboardService.findGlobalSearch(query,)
  }

  @Post('add-adminWidget/:adminId',)
  public async addAdminWidget(
    @Param('adminId',) adminId: string,
    @Body() body: CreateAdminWidgetDto,
  ) {
  	return this.dashboardService.createExtraAdminWidget(adminId, body,)
  }

  @Patch('delete-admin-widget/:adminId',)
  public async deleteWidget(
    @Param('adminId',) adminId: string,
    @Body() body: DeleteWidgetDto,

  ) {
  	return this.dashboardService.deleteAdminWidget(adminId,body,)
  }

  @Patch('change-admin-widget/:adminId/:widgetId',)
  public async changeAdminWidget(
    @Param('adminId',) adminId: string,
    @Param('widgetId',) widgetId: string,
    @Body() body: UpdateWidgetDto,
  ): Promise<void> {
  	return this.dashboardService.updateWidget({
  		adminId,
  		widgetId,
  		data: body,
  	},)
  }

  @Patch('update-widgets-position/:adminId',)
  public async updateWidgetsPosition(
    @Param('adminId',) adminId: string,
    @Body() widgetPositions: Array<{ widgetId: string; position: number;adminWidgetId:string }>,
  ) {
  	await this.dashboardService.updateWidgetsPosition(adminId, widgetPositions,)
  }

  @Patch('update-default-values/:adminId',)
  public async updateDefaultValues(
    @Param('adminId',) adminId: string,
    @Body() updateDefaultsDto: UpdateDefaultsDto,
  ) {
  	return this.dashboardService.updateDefaultValues(
  		adminId,
  		updateDefaultsDto,
  	)
  }

  @Put('reset-defaults/:adminId/',)
  public async resetWidgetsToDefaults(
    @Param('adminId',) adminId: string,
  ): Promise<void> {
  	await this.dashboardService.resetAllWidgetsToDefaults(adminId,)
  }

  @Get('dashboard-map-contractor/:contractorId',)
  public async getContractorBookings(@Param('contractorId',) contractorId:string,) {
  	return this.dashboardService.getContractorTodayBookings(contractorId,)
  }

  @Get('dashboard-select-values',)
  public async getSelectValues() {
  	return this.dashboardService.getSelectDataValues()
  }
}
