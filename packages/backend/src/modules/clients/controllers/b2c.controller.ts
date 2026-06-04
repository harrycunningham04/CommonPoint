/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, } from '@nestjs/common'
import type { B2CClients, Preference, } from '@prisma/client'
import { ClientsB2CService, } from '../services/b2c.service'
import { ChangeClientDto, ChangePasswordDto, ClientsDto, IB2CClientListReturn, } from '../dto/b2c.dto'
import { B2CClientResponseDto, } from '../dto/b2c-client-response.dto'
import { Prisma, } from '@prisma/client'

@Controller('clients/b2c',)
export class ClientsB2CController {
	constructor(private readonly clientsService: ClientsB2CService,) {}

    @Get()
	public async getB2CClients(@Query() query: ClientsDto,): Promise<IB2CClientListReturn> {
		return this.clientsService.get(query,)
	}

    @Post('add',)
    public async addClient(@Body() data: Prisma.B2CClientsCreateInput & { specialPrices?: Record<string, number> },) {
    	return this.clientsService.addClient(data,)
    }

    @Get('unique-post-codes',)
    public async getUniquePostCodes() {
    	return this.clientsService.getUniquePostCodes()
    }

    @Patch('change/:id',)
    public async changeB2C(
        @Param('id',) clientId: string,
        @Body() body: ChangeClientDto,
    ): Promise<B2CClientResponseDto> {
    	return this.clientsService.updateB2C(clientId, body,)
    }

  @Patch('change-password/:id',)
    public async changeB2CClientPassword(
    @Param('id',) clientId: string,
    @Body() body: ChangePasswordDto,
    ): Promise<void> {
    	return this.clientsService.changePassword(clientId, body,)
    }

    @Get(':clientId/preferences',)
  public async getPreferences(@Param('clientId',) clientId: string,): Promise<Array<Preference>> {
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
    ): Promise<Preference | null> {
    	return this.clientsService.addPreference(clientId, preferencesData,)
    }

    @Delete(':clientId/preferences/:preferenceId',)
    public async deletePreferences(@Param('preferenceId',) preferenceId: string,): Promise<Preference> {
    	return this.clientsService.deletePreference(preferenceId,)
    }
}
