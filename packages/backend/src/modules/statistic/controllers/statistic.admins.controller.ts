/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get, Query, } from '@nestjs/common'
import { StatisticAdminsService, } from '../services/statistic.admins.service'
import { StatisticBookingClient, StatisticDto, } from '../dto/get-revenue.dto'

@Controller('statistic-admins',)
export class StatisticAdminController {
	constructor(
    private readonly statisticAdminsService: StatisticAdminsService,
	) {}

  @Get('main-page',)
	public async getMainPageData(@Query() data: StatisticDto,) {
		return this.statisticAdminsService.getTotalBookingsStatistic(data,)
	}

  @Get('total-bookings',)
  public async getTotalBookings(@Query() data: StatisticDto,) {
  	return this.statisticAdminsService.getTotalBookingsStatistic(data,)
  }

  @Get('bookings-per-client',)
  public async getBookingPerClient(@Query() data: StatisticBookingClient,) {
  	return this.statisticAdminsService.getBookingPerClient(data,)
  }

  @Get('booking-per-client-data',)
  public async getBookingPerClientData() {
  	return this.statisticAdminsService.getBookingPerClientData(false,)
  }

  @Get('cancelled-bookings-percentage',)
  public async getBookingCancelPercent(@Query() data: StatisticDto,) {
  	return this.statisticAdminsService.getBookingCancelPercent(data, true,)
  }

  @Get('confirmation-rate',)
  public async getBookingConfirmPercent(@Query() data: StatisticDto,) {
  	return this.statisticAdminsService.getBookingCancelPercent(data, false,)
  }

  @Get('repeated-bookings',)
  public  async getBookingRepeat(@Query() data:StatisticDto,) {
  	return this.statisticAdminsService.getBookingRepeatAmount(data,)
  }

  @Get('fulfillment-rate',)
  public async getFulfilmentRate(@Query() data:StatisticDto,) {
  	return this.statisticAdminsService.getFulfitmentRateStatistic(data,)
  }
}
