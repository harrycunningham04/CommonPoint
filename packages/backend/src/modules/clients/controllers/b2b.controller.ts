/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
	Query,
	Patch,
	Delete,
} from '@nestjs/common'
import { ClientsB2BService, } from '../services/b2b.service'
import type { Office, Preference, } from '@prisma/client'
import { ClientsDto, ChangeClientDto, IB2BClientListReturn, } from '../dto/b2b.dto'
import { ChangePasswordDto, } from '../dto/b2c.dto'
import { ICreateOffice, } from '../types/create-office.type'
import { PageSearchCommonDto, } from 'src/shared/dto/page-options.dto'
import { PackagesBrandDto, } from '../dto/packages-brand.dto'
import { B2BClientResponseDto, } from '../dto/b2b-client-response.dto'
import { CreateB2BDto, } from '../dto/create-b2b.dto'
import { SubbrandDto, SubbrandResponseDto } from '../dto/subbrand-dto'

@Controller('clients/b2b',)
export class ClientsB2BController {
	constructor(private readonly clientsService: ClientsB2BService,) {}

  @Get()
	public async getB2BClients(@Query() query: ClientsDto,): Promise<IB2BClientListReturn> {
		return this.clientsService.get(query,)
	}

  @Post('add',)
  public async addClient(@Body() data: CreateB2BDto,): Promise<B2BClientResponseDto> {
  	return this.clientsService.addClient(data,)
  }

  @Get('unique-brands',)
  public async getUniqueBrands(): Promise<Array<string>> {
  	return this.clientsService.getUniqueBrands()
  }

  @Get(':clientId/preferences',)
  public async getPreferences(
    @Param('clientId',) clientId: string,
  ): Promise<Array<Preference>> {
  	return this.clientsService.getPreferences(clientId,)
  }

  @Put(':clientId/preferences/:preferenceId',)
  public async updatePreferences(
    @Param('preferenceId',) preferenceId: string,
    @Body() preferencesData: Partial<Preference>,
  ): Promise<Preference> {
  	return this.clientsService.updatePreferences(preferenceId, preferencesData,)
  }

  @Post(':clientId/preferences',)
  public async addPreferences(
    @Param('clientId',) clientId: string,
    @Body() preferencesData: Omit<Preference, 'id'>,
  ): Promise<Preference> {
  	return this.clientsService.addPreference(clientId, preferencesData,)
  }

  @Patch('change-password/:id',)
  public async changeB2CClientPassword(
    @Param('id',) clientId: string,
    @Body() body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    	return this.clientsService.changePassword(clientId, body,)
  }

  @Patch('change-password-worker/:id',)
  public async changeWorkerClientPassword(
    @Param('id',) clientId: string,
    @Body() body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    	return this.clientsService.changeWokerPassword(clientId, body,)
  }

  @Delete(':clientId/preferences/:preferenceId',)
  public async deletePreferences(
    @Param('preferenceId',) preferenceId: string,
  ): Promise<Preference> {
  	return this.clientsService.deletePreference(preferenceId,)
  }

  @Patch('change/:id',)
  public async changeB2B(
    @Param('id',) clientId: string,
    @Body() body: ChangeClientDto,
  ):Promise<B2BClientResponseDto> {
  	return this.clientsService.updateB2B(clientId, body,)
  }

  @Post('add-office',)
  public async addOffice(@Body() body : ICreateOffice,):Promise<Office> {
  	return this.clientsService.createOffice(body,)
  }

  @Get('packages-brand',)
  public async getPackagesBrand(@Query() query:PageSearchCommonDto,):Promise<Array<PackagesBrandDto>> {
  	return this.clientsService.getPackagesBrand(query,)
  }
}
