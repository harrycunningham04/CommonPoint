/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import type { Prisma, } from '@prisma/client'
import type { Notification, } from '@prisma/client'
import { NotificationService, } from '../services/notification.service'
import { Roles, } from 'src/shared/roles.decorator'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { FilterNotificationsDto, GetNotificationsDto, } from '../dto/notification.dto'

@Controller('notifications',)
@UseGuards(AdminAuthGuard,)
export class NotificationController {
	constructor(private readonly notificationService: NotificationService,) { }

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Get()
	public async getNotifications(@Query() query: GetNotificationsDto,): Promise<Array<Notification>> {
		return this.notificationService.getNotifications(query,)
	}

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @Post()
	public async addProduct(@Body() body: Notification,): Promise<Notification> {
    	return this.notificationService.addNotification({ ...body, },)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Get('notifications-dashboard',)
    public async getDashboardNotifications():Promise<Array<Notification>> {
    	return this.notificationService.getDashboardAllNotifications()
    }

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Patch(':id',)
	public async changeNotification(
		@Param('id',) notificationId: string,
		@Body() body: Prisma.ClientDisputeUpdateInput,
	): Promise<Notification> {
		// @ts-ignore
		return this.notificationService.updateNotification(notificationId, body,)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Get('filter-options',)
	async getFilterOptions(): Promise<FilterNotificationsDto> {
		return this.notificationService.getFilterOptions()
	}
}
