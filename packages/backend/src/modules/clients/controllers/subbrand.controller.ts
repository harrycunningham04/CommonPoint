/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Delete, Get, Param, Patch, Post, } from '@nestjs/common'
import { SubbrandService, } from '../services/subbrand.service'
import { Prisma, } from '@prisma/client'

@Controller('subbrand',)
export class SubbrandController {
	constructor(private readonly subbrandService: SubbrandService,) {}

  @Post()
	public async createSubbrand(@Body() data: { clientId: string; companyName: string },) {
		return this.subbrandService.createSubbrand(data,)
	}

  @Get('client/:clientId',)
  public async getSubbrandsByClientId(@Param('clientId',) clientId: string,) {
  	return this.subbrandService.getSubbrandsByClientId(clientId,)
  }

  @Patch(':subbrandId',)
  public async updateSubbrand(
    @Param('subbrandId',) subbrandId: string,
    @Body() data: Prisma.SubbrandUpdateInput,
  ) {
  	return this.subbrandService.updateSubbrand(subbrandId, data,)
  }

  @Delete(':subbrandId',)
  public async deleteSubbrand(@Param('subbrandId',) subbrandId: string,) {
  	return this.subbrandService.deleteSubbrand(subbrandId,)
  }

  @Post(':subbrandId/office',)
  public async addOfficeToSubbrand(
    @Param('subbrandId',) subbrandId: string,
    @Body() officeData: Prisma.OfficeCreateInput,
  ) {
  	return this.subbrandService.addOfficeToSubbrand(subbrandId, officeData,)
  }

  @Get(':subbrandId/offices',)
  public async getOffices(@Param('subbrandId',) subbrandId: string,) {
  	return this.subbrandService.getOffices(subbrandId,)
  }

  @Get(':subbrandId/preferences',)
  public async getPreferences(@Param('subbrandId',) subbrandId: string,) {
  	return this.subbrandService.getPreferences(subbrandId,)
  }

  @Post(':subbrandId/preferences',)
  public async addPreference(@Param('subbrandId',) subbrandId: string, @Body() data: Omit<Prisma.PreferenceCreateInput, 'subbrand'>,) {
  	return this.subbrandService.addPreference(subbrandId, data,)
  }

  @Patch(':subbrandId/preferences/:preferenceId',)
  public async updatePreference(@Param('subbrandId',) subbrandId: string, @Param('preferenceId',) preferenceId: string, @Body() data: Partial<Prisma.PreferenceUpdateInput>,) {
  	return this.subbrandService.updatePreference(subbrandId, preferenceId, data,)
  }

  @Delete(':subbrandId/preferences/:preferenceId',)
  public async deletePreference(@Param('subbrandId',) subbrandId: string, @Param('preferenceId',) preferenceId: string,) {
  	return this.subbrandService.deletePreference(subbrandId, preferenceId,)
  }
}
