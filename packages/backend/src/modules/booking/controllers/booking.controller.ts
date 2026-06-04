/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Res,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { BookingService, } from '../services/booking.service'
import { GetBookingsDto, } from '../dto/get-bookings.dto'
import { Booking, BookingListColumns, OrderListColumns, } from '@prisma/client'
import { ChangeBookingDto, } from '../dto/change-booking.dto'
import { ChangeListColumnsDto, ChangeListOrdersColumnsDto, } from '../dto/change-list-columns.dto'

import { Response, } from 'express'

import { Express, } from 'express'
import { GetAvailabilityDto, } from '../dto/get-available-slots.dto'
import { Availability, } from '../dto/get-availability-slots.dto'
import { AvailabilityService, } from 'src/modules/availability/availability.service'
import { AdminAuthGuard, ClientAuthGuard, } from '../../../shared/guards/jwt.guard'
import { User, } from '../../../shared/decorators/user.decorator'
import { BookingContractorService, } from '../services/booking-contractor.service'
import { ApiOkResponse, } from '@nestjs/swagger'
import { ApiQuery, } from '@nestjs/swagger'
import { GetBookingMobileDto, } from '../dto/get-booking-mobile.dto'
import { BookingMobileResDto, JobDto, JobDtoQuery, } from '../dto/single-booking-res.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { SkillDto, } from '../dto'
import { BookingAdminListResDto, } from '../dto/booking-admin-list.res.dto'
import { BookingReportDto, } from '../dto/booking-report.dto'
import { BookingAdminDetailsDto, } from '../dto/booking-admin-detaIls.dto'
import {
	BookingCalendarAvailabilityDto,
	BookingCalendarDto,
	BookingCalendarResponseDto,
	GetBookingCalendarDto,
	UpdateBookingCalendarDto,
  UpdateCalendarRouteDto,
} from '../dto/booking-calendar.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { EditRequestDto, } from '../dto/booking-edit-request.dto'

@UseGuards(AdminAuthGuard,)
@Controller('booking',)
export class BookingController {
	constructor(
    private readonly bookingService: BookingService,
    private readonly bookingContractorService: BookingContractorService,
    private readonly contractorAvailabilitiesService: AvailabilityService,
	) {}

	@Get('jobs-with-routes/:contractorId',)
	@ApiQuery({
		type: GetBookingMobileDto,
	},)
	@ApiOkResponse({
		description: 'Get mobile jobs',
		type:        [BookingMobileResDto,],
	},)
	public async getContractorBookingsWithRoutes(@Param('contractorId',) contractorId:string,@Query() query:GetBookingMobileDto,): Promise<Array<BookingMobileResDto>> {
		return this.bookingContractorService.getContractorBookingsMobile(contractorId,query,)
	}

  @Get('edit-request/:bookingId',)
	public async getEditRequest(@Param('bookingId',) bookingId: string, @Query() query: PageOptionsDto,): Promise<PagedResDto<EditRequestDto>> {
  	return this.bookingService.getEditRequest(bookingId,query,)
	}

  @Get('client/:clientId/bookings',)
  public async getBookingsByClientId(
    @Param('clientId',) clientId: string,
    @Query() query: PageOptionsDto,
  ): Promise<PagedResDto<Booking>> {
  	return this.bookingService.getBookingsByClientId(clientId, query,)
  }

  @Get('subbrand/:subbrandId/bookings',)
  public async getBookingsBySubbrandId(@Param('subbrandId',) subbrandId: string,): Promise<Array<Booking>> {
  	return this.bookingService.getBookingsBySubbrandId(subbrandId,)
  }

  @Get('office/:officeId/bookings',)
  public async getBookingsByOfficeId(
    @Param('officeId',) officeId: string,
    @Query() query: PageOptionsDto,
  ): Promise<PagedResDto<Booking>> {
  	return this.bookingService.getBookingsByOfficeId(officeId, query,)
  }

  @Get('booking-list',)
  public async getBookings(
    @Query() query: GetBookingsDto,
  ): Promise<PagedResDto<BookingAdminListResDto>> {
  	return this.bookingService.filteredBookings(query,)
  }

  @Get('booking-admin-details/:bookingId',)
  public async getBookingAdminDetails(@Param('bookingId',) bookingId: string,): Promise<Promise<BookingAdminDetailsDto> > {
  	return this.bookingService.getBookingAdminDetails(bookingId,)
  }

  // @Get('availability',)
  // public async getAvailability(
  //   @Query() query: GetAvailabilityDto,
  // ): Promise<Array<Availability>> {
  // 	return this.contractorAvailabilitiesService.getAvailability(query,)
  // }

  @Patch('change-booking/:id',)
  public async changeBooking(
    @Param('id',) bookingId: string,
    @Body() body: ChangeBookingDto,
  ): Promise<Booking> {
  	return this.bookingService.changeBooking(bookingId, body,)
  }

  @Get('booking-list-options',)
  public async getListColumns(): Promise<BookingListColumns> {
  	return this.bookingService.getBookingListColumns()
  }

  @Patch('change-list-options',)
  public async changeListColumns(@Body() body: ChangeListColumnsDto,): Promise<BookingListColumns> {
  	return this.bookingService.changeListColumns(body,)
  }

  @Get('order-list-options',)
  public async getListOrderColumns(@User() userId: string,): Promise<OrderListColumns> {
  	return this.bookingService.getOrderListColumns(userId,)
  }

  @Patch('change-order-list-options',)
  public async changeListOrderColumns(
    @User() userId: string,
    @Body() body: ChangeListOrdersColumnsDto,
  ): Promise<OrderListColumns> {
  	return this.bookingService.changeOrderListColumns(userId, body,)
  }

  @Get('export',)
  public async exportBookings(@Query() query:any,@Res() res:Response,):Promise<void> {
  	return this.bookingService.exportBookingsItem(query,res,false,)
  }

  @Get('export-order',)
  public async exportOrders(@Query() query:any,@Res() res:Response,):Promise<void> {
  	return this.bookingService.exportBookingsItem(query,res,true,)
  }

  @Get('order-list',)
  public async getOrders(@Query() query: GetBookingsDto,):Promise<PagedResDto<BookingAdminListResDto>> {
  	return this.bookingService.filteredBookings(query,)
  }

  @Get('booking-report/:bookingId',)
  public async getBookingReport(@Param('bookingId',) bookingId: string,):Promise<PagedResDto<BookingReportDto>> {
  	return this.bookingService.getBookingReport(bookingId,)
  }

  @Get('booking-calendar',)
  public async getBookingCalendar(@Query() query: GetBookingCalendarDto,):Promise<BookingCalendarResponseDto> {
  	return this.bookingService.getBookingCalendar(query,)
  }

  @Get('booking-calendar-availability',)
  public async getBookingCalendarAvailability(@Query() query: GetBookingCalendarDto,):Promise<BookingCalendarAvailabilityDto> {
  	return this.bookingService.getBookingCalendarAvailability(query,)
  }

  @Patch('booking-calendar/:id',)
  public async updateBookingCalendar(@Param('id',) bookingId: string, @Body() body: UpdateBookingCalendarDto,):Promise<Array<BookingCalendarDto>> {
  	return this.bookingService.updateBookingCalendar(bookingId, body,)
  }

@Patch('booking-mark-done/:id',)
  public async markBookingDone(@Param('id',) bookingId: string,): Promise<void> {
  	return this.bookingService.markBookingDone(bookingId,)
  }

@Get('contractor-jobs/admin/:id',)
@ApiOkResponse({
	description: 'Contractor list of jobs for admin to select for fee adjusting',
	type:        PagedResDto<JobDto>,
	isArray:     true,
},)
public async getContractorJobsAdmin(
  @Param('id',) id: string,
  @Query() query: JobDtoQuery,
): Promise<PagedResDto<JobDto>> {
  	return this.bookingContractorService.getContractorJobsAdmin(id, query,)
}

@Patch('calendar-route/:id',)
public async updateCalendarRoute(@Param('id',) id: string, @Body() body: UpdateCalendarRouteDto,): Promise<void> {
	return this.bookingService.updateCalendarRoute(id, body,)
}
}
