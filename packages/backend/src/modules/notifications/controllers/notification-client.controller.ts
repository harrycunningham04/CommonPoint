import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { NotificationClientService, } from '../services/notification-client.service'
import { ChangeNotificationDto, } from '../dto/change-notification.dto'
import { ChangeNotificationPreferencesDto, } from '../dto/change-notification-preferences.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { NotificationsUnreadCountResDto, PagedBasicNotificationResDto, } from '../dto/notification-response.dto'
import { ApiBody, ApiOkResponse, ApiParam, ApiQuery, } from '@nestjs/swagger'
import type { NotificationUserPreferences, } from '@prisma/client'
import { HelpCreateB2BAccountNotificationQuery, LetUsKnowUnavailableRegionNotificationQuery, } from '../dto/contact-form-notification.dto'
import { NotificationFormService, } from '../services/notification-form.service'

@Controller('notifications-client',)
export class NotificationClientController {
	constructor(
		private readonly notificationClientService:NotificationClientService,
		private readonly notificationFormService:NotificationFormService,) {}

	@UseGuards(ClientAuthGuard,)
	@Get('notification-unread/:clientId',)
	@ApiOkResponse({type: NotificationsUnreadCountResDto,},)
	@ApiParam({
		name: 'clientId',
		type: 'string',
	},)
	public async getUnreadNotifications(
		@Param('clientId',) clientId:string,
	):Promise<NotificationsUnreadCountResDto> {
		return this.notificationClientService.getUnreadClientNotifications(clientId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('notification-list',)
	@ApiOkResponse({type: PagedBasicNotificationResDto,},)
	@ApiQuery({ type: PageOptionsDto,},)
	public async getNotificationList(
		@User() clientId:string,
		@Query() query:PageOptionsDto,
	):Promise<PagedBasicNotificationResDto> {
		return this.notificationClientService.getClientNotifications(clientId,query,)
	}

	@UseGuards(ClientAuthGuard,)
	@Patch('notification-update',)
	@ApiOkResponse()
	@ApiBody({type: ChangeNotificationDto,},)
	public async updateNotification(@Body() body : ChangeNotificationDto,): Promise<void> {
		return this.notificationClientService.changeNotificationRead(body,)
	}

	@UseGuards(ClientAuthGuard,)
	@Get('notification-preferences/:clientId',)
	@ApiOkResponse({type: Array<NotificationUserPreferences>,},)
	@ApiParam({
		name: 'cliendId',
		type: 'string',
	},)
	public async getNotificationPreferences(@Param('clientId',) clientId:string,): Promise<Array<NotificationUserPreferences>> {
		return this.notificationClientService.getNotificationPreference(clientId,)
	}

	@UseGuards(ClientAuthGuard,)
	@Patch('notification-preferences/:clientId',)
	@ApiOkResponse()
	@ApiParam({
		name: 'cliendId',
		type: 'string',
	},)
	@ApiBody({type: ChangeNotificationPreferencesDto,},)
	public async changeNotificationPreferences(
		@Param('clientId',) clientId:string,
		@Body() body : ChangeNotificationPreferencesDto,
	): Promise<void> {
		return this.notificationClientService.updateNotificationPreference(clientId, body.notificationPreferences,)
	}

	@ApiBody({type: HelpCreateB2BAccountNotificationQuery,},)
	@Post('help-create-b2b',)
	public async helpCreateB2BAccount(@Body() body: HelpCreateB2BAccountNotificationQuery,): Promise<void> {
		return this.notificationFormService.helpCreateB2BAccount(body,)
	}

	@ApiBody({type: LetUsKnowUnavailableRegionNotificationQuery,},)
	@Post('unavailable-region',)
	public async letUsKnowUnavailableRegion(@Body() body: LetUsKnowUnavailableRegionNotificationQuery,): Promise<void> {
		return this.notificationFormService.letUsKnowUnavailableRegion(body,)
	}
}