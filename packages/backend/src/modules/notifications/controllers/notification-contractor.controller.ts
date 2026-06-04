import { Controller, Get, Param, Patch, Query, UseGuards, } from '@nestjs/common'
import { User, } from 'src/shared/decorators/user.decorator'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { NotificationContractorService, } from '../services/notification-contractor.service'
import { ApiOkResponse, ApiParam, ApiQuery, } from '@nestjs/swagger'
import { NotificationsUnreadCountResDto, } from '../dto/notification-response.dto'
import { NotificationPageOptionsDto, } from '../dto/notification-page-options.dto'
import { NotificationListQueryDto, } from '../dto/notification-list.dto'
import { MarkAllNotificationsQueryDto,} from '../dto/grouped-nofifications.dto'
import type { GroupedNotificationsDto, UnreadNotificationsCountByTypeDto,} from '../dto/grouped-nofifications.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { PagedContractorNotificationsResponseDto, } from '../dto/contractor-notification-response.dto'
import type { ContractorNotificationResponseDto, } from '../dto/contractor-notification-response.dto'

@Controller('notifications-contractor',)
export class NotificationContractorController {
	constructor(private readonly notificationContractorService:NotificationContractorService,) {}

	@UseGuards(ContractorAuthGuard,)
	@Get('notification-unread',)
	@ApiOkResponse({type: NotificationsUnreadCountResDto, },)
	public async getUnreadNotifications(
		@User() contractorId:string,
	):Promise<NotificationsUnreadCountResDto> {
		return this.notificationContractorService.getUnreadContractorNotifications(contractorId,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Get('notification-list',)
	@ApiOkResponse({type: PagedResDto<GroupedNotificationsDto>,},)
	@ApiQuery({ type: NotificationPageOptionsDto,},)
	public async getNotificationList(
		@User() contractorId:string,
		@Query() query:NotificationPageOptionsDto,
	):Promise<PagedResDto<GroupedNotificationsDto>> {
		return this.notificationContractorService.getGroupedNotifications(contractorId,query,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Get('notifications',)
	@ApiOkResponse({type: PagedContractorNotificationsResponseDto,},)
	@ApiQuery({ type: NotificationListQueryDto,},)
	public async getNotifications(
		@User() contractorId: string,
		@Query() query: NotificationListQueryDto,
	): Promise<PagedResDto<ContractorNotificationResponseDto>> {
		return this.notificationContractorService.getNotificationsWithFilters(contractorId, query,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Get('unread-notifications-count-by-type',)
	@ApiOkResponse({type: Array<UnreadNotificationsCountByTypeDto>,},)
	public async getUnreadNotificationsCountByType(@User() contractorId: string,): Promise<Array<UnreadNotificationsCountByTypeDto>> {
		return this.notificationContractorService.getUnreadNotificationsCountForGroups(contractorId,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Get(':bookingId',)
	@ApiOkResponse({type: PagedResDto<GroupedNotificationsDto>,},)
	@ApiParam({name: 'bookingId', type: 'string',},)
	@ApiQuery({type: NotificationPageOptionsDto,},)
	public async getNotificationsByBookingId(
		@User() contractorId: string,
		@Param('bookingId',) bookingId: string,
		@Query() query: NotificationPageOptionsDto,
	): Promise<PagedResDto<GroupedNotificationsDto>> {
		return this.notificationContractorService.getNotificationsByBookingId(contractorId, bookingId, query,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Patch('read/:notificationId',)
	@ApiOkResponse({type: String,},)
	@ApiParam({name: 'notificationId', type: 'string',},)
	public async markNotificationAsRead(
		@Param('notificationId',) notificationId: string,
		@User() contractorId: string,
	): Promise<string> {
		return this.notificationContractorService.markNotificationAsRead(notificationId, contractorId,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Patch('read/booking/:bookingId',)
	@ApiOkResponse({type: String,},)
	@ApiParam({name: 'bookingId', type: 'string',},)
	public async markNotificationsAsReadByBookingId(
		@Param('bookingId',) bookingId: string,
		@User() contractorId: string,
	): Promise<void> {
		return this.notificationContractorService.markNotificationsAsReadByBookingId(bookingId, contractorId,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Patch('read',)
	@ApiOkResponse({type: String,},)
	@ApiQuery({type: MarkAllNotificationsQueryDto,},)
	public async markAllNotificationsAsRead(
		@User() contractorId: string,
		@Query() query: MarkAllNotificationsQueryDto,
	): Promise<string> {
		return this.notificationContractorService.markAllNotificationsAsRead(contractorId, query,)
	}
}