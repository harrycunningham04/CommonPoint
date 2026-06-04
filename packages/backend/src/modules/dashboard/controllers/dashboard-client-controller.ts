/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get, Param, Query, UseGuards, } from '@nestjs/common'
import { Booking, Notification, } from '@prisma/client'
import { BookingClientListDto } from 'src/modules/booking/dto/booking-client-list.dto'
import { BookingClientService, } from 'src/modules/booking/services/booking-client.service'
import { BasicNotificationClientDto, } from 'src/modules/notifications/dto/get-notification-client.dto'
import { NotificationClientService, } from 'src/modules/notifications/services/notification-client.service'
import { User, } from 'src/shared/decorators/user.decorator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { EClientType, } from 'src/shared/types/client.type'
import { GetBookingsDto } from '../dto/get-bookings.dto'
@UseGuards(ClientAuthGuard,)
@Controller('dashboard-client',)
export class DashboardClientController {
	constructor(private readonly bookingService : BookingClientService,
        private readonly notificationService : NotificationClientService,
	) {}

	// @Get('dashboard-main',)
	// public async getDashboardClientMainInfo(@User() clientId : string, @Query() query : PageOptionsDto,)
	// :Promise<{bookingsUpcoming : Array<Booking>,bookingDelivered : Array<Booking>,notifications : PagedResDto<Notification>}> {
	// 	const [bookingsUpcoming, bookingDelivered, notifications,] = await Promise.all([
	// 		this.bookingService.getUpcomingBookings(clientId,),
	// 		this.bookingService.getDeliveredBookings(clientId,),
	// 		this.notificationService.getClientNotifications(clientId,query,),
	// 	],)

	// 	return {
	// 		bookingsUpcoming,
	// 		bookingDelivered,
	// 		notifications,
	// 	}
	// }

	@Get('upcoming-bookings',)
	public async getUpcomingBookings(@User() clientId : string,@Query() query : GetBookingsDto,) : Promise<PagedResDto<BookingClientListDto>> {
		return this.bookingService.getUpcomingBookings(clientId,query,)
	}

	@Get('delivered-bookings',)
	public async getDeliveredBookings(@User() clientId : string,@Query() query : GetBookingsDto,) : Promise<PagedResDto<BookingClientListDto>> {
		return this.bookingService.getDeliveredBookings(clientId,query,)
	}

	@Get('notifications',)
	public async getNotifications(@User() clientId : string,@Query() query : PageOptionsDto,) : Promise<PagedResDto<BasicNotificationClientDto>> {
		return this.notificationService.getClientNotifications(clientId,query,)
	}
}