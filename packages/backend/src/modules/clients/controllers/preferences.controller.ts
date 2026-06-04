import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, } from '@nestjs/common'
import { PreferencesService, } from '../services/preferences-service'
import { AdminAuthGuard, ClientAuthGuard, JWTAuthGuard, } from 'src/shared/guards/jwt.guard'
import { User, } from 'src/shared/decorators/user.decorator'
import { CreatePreferenceDto, GetBookingFormPreferencesDto, GetBookingFormPreferencesSingleDto, GetClientPreferencesAdminDto, } from '../dto/preference.dto'
import type { OfficePreference, Preference, } from '@prisma/client'

@Controller('preferences',)

export class PreferencesController {
	constructor(private readonly preferencesService: PreferencesService,) {}

	@Get('get-all',)
	public async getAllPreferences() : Promise<Array<Preference>> {
		return this.preferencesService.getAllPreferences()
	}

    @UseGuards(ClientAuthGuard,)
    @Post('create',)
	public async createPreference(@User() clientId:string,@Body() body: CreatePreferenceDto,) : Promise<void> {
		return this.preferencesService.createPreferenceForClient(clientId,body,)
	}

	@UseGuards(AdminAuthGuard,)
	@Post('create-preference-client/:clientId',)
    public async createPreferenceClient(@Param('clientId',) clientId:string,@Body() body: CreatePreferenceDto,) : Promise<void> {
    	return this.preferencesService.createPreferenceForClient(clientId,body,)
    }

	@UseGuards(AdminAuthGuard,)
	@Get('get-client-preferences-admin',)
	public async getClientPreferencesAdmin(@Query() query: GetClientPreferencesAdminDto,) : Promise<Array<Preference>> {
    	return this.preferencesService.getClientPreferencesAdmin(query.clientId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('get-client-preferences',)
	public async getClientPreferences(@User() clientId:string,) : Promise<Array<Preference>> {
		return this.preferencesService.getClientPreferencesAdmin(clientId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('get-client-preferences-office/:officeId',)
	public async getClientPreferencesOffice(@Param('officeId',) officeId:string,) : Promise<Array<Preference>> {
		return this.preferencesService.getClientPreferencesOffice(officeId,)
	}

	@UseGuards(AdminAuthGuard,)
	@Get('get-office-preferences-admin/:officeId',)
	public async getOfficePreferencesAdmin(@Param('officeId',) officeId:string,) : Promise<Array<Preference>> {
		return this.preferencesService.getClientPreferencesOffice(officeId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Post('create-preference-office/:officeId',)
	public async createPreferenceOffice(@Param('officeId',) officeId:string, @Body() body: {preferenceId:string},) : Promise<OfficePreference> {
		return this.preferencesService.createPreferenceForOffice(officeId,body.preferenceId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Delete('delete-preference-office/:officeId/:preferenceId',)
	public async deletePreferenceOffice(@Param('officeId',) officeId:string, @Param('preferenceId',) preferenceId:string,) : Promise<void> {
		return this.preferencesService.deletePreferenceForOffice(officeId,preferenceId,)
	}

	@UseGuards(AdminAuthGuard,)
	@Post('create-preference-office-admin/:officeId',)
	public async createPreferenceOfficeAdmin(@Param('officeId',) officeId:string, @Body() body: {preferenceId:string},) : Promise<OfficePreference> {
		return this.preferencesService.createPreferenceForOffice(officeId,body.preferenceId,)
	}

	@UseGuards(AdminAuthGuard,)
	@Delete('delete-preference-office-admin/:officeId/:preferenceId',)
	public async deletePreferenceOfficeAdmin(@Param('officeId',) officeId:string, @Param('preferenceId',) preferenceId:string,) : Promise<void> {
		return this.preferencesService.deletePreferenceForOffice(officeId,preferenceId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('get-booking-preferences/:bookingGroupId',)
	public async getBookingPreferences(@Param('bookingGroupId',) bookingGroupId:string,) : Promise<Array<Preference>> {
		return this.preferencesService.getBookingPreferences(bookingGroupId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('get-booking-form-preferences',)
	public async getBookingFormPreferences(@User() clientId:string,@Query() query: GetBookingFormPreferencesDto,) : Promise<Array<Preference>> {
		return this.preferencesService.getBookingFormPreferences(clientId,query.officeId,query.skills,)
	}

	@Get('get-booking-form-preferences-single',)
	public async getBookingFormPreferencesSingle(@Query() query: GetBookingFormPreferencesSingleDto,) : Promise<Array<Preference>> {
		return this.preferencesService.getBookingFormPreferences(query.clientId,query.officeId,query.skills,)
	}
}