/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	StatisticBookingClient,
	StatisticDto,
	StatisticRegion,
	StatisticContractor,
} from '../dto/get-revenue.dto'
import { StatisticAdminsService, } from '../services/statistic.admins.service'
import { StatisticSalesService, } from '../services/statistic.sales.service'
import { Controller, Get, Query, } from '@nestjs/common'

@Controller('statistic-sales',)
export class StatisticSalesController {
	constructor(private readonly statisticSalesService: StatisticSalesService,private readonly statisticAdminsService:StatisticAdminsService,) {}

  @Get('cancel-bookings',)
	public async getCancelBookingsPercent(@Query() query: StatisticDto,) {
		return this.statisticSalesService.getCancelBooking(query,)
	}

  @Get('avarage-revenue',)
  public async getAvarageRevenue(@Query() query: StatisticDto,) {
  	return this.statisticSalesService.getAvarageBookingRevenue(query,)
  }

  @Get('revenue-contractor',)
  public async getRevenueByContractor(
    @Query() query: StatisticContractor,
  ) {
  	return this.statisticSalesService.getRevenueByContractor(query,)
  }

  @Get('new-clients',)
  public async getNewClients(@Query() query:StatisticDto,) {
  	return this.statisticSalesService.getNewClientsStatistic(query,)
  }

  @Get('booking-brand',)
  public async getBookingBrandStatistic(@Query() data: StatisticBookingClient,) {
  	return this.statisticAdminsService.getBookingBrandStats(data,)
  }

  @Get('booking-per-brand-data',)
  public async getBookingPerBrandData() {
  	return this.statisticAdminsService.getBookingPerClientData(true,)
  }

  //   @Get('top-clients',)
  // 	public async getTopClients(): Promise<void> {
  // 		// @ts-ignore
  // 		return this.statisticService.getAllTopClients()
  // 	}

  //   @Get('top-contractors',)
  //   public async getTopContractors(): Promise<void> {
  //   	// @ts-ignore
  //   	return this.statisticService.getAllTopContractors()
  //   }

  @Get('revenue-bookings',)
  public async getBookingRevenue(@Query() query: StatisticDto,): Promise<void> {
  	// @ts-ignore

  	return this.statisticSalesService.getMonthlyRevenueStats(query,)
  }

  @Get('revenue-contractor-data',)
  public async getRevenueContractorData() {
  	return this.statisticSalesService.getRevenueContractorData()
  }

  @Get('region-revenue',)
  public async getRevenueByRegion(@Query() data:StatisticRegion,) {
  	return this.statisticSalesService.getRegionRevenue(data,)
  }

  @Get('region-revenue-data',)
  public async getRegionData() {
  	return this.statisticSalesService.getRegionData()
  }

  //   @Get('statistic-contractors-page',)
  //   public async getContractorsStatistics(
  //     @Query() query: RevenueDto,
  //   ): Promise<void> {
  //   	const [topContractors, montlyRevenue,] = await Promise.all([
  //   		this.statisticService.getAllTopContractors(),
  //   		this.statisticService.getMonthlyRevenueStats(query,),
  //   	],)
  //   	// @ts-ignore

  //   	return { topContractors, montlyRevenue, }
  //   }

  @Get('main-page',)
  public async getSalesStatistic(@Query() query: StatisticDto,): Promise<void> {
  	// @ts-ignore
  	return this.statisticSalesService.getMonthlyRevenueStats(query,)
  }

	//   @Get('statistic-admin-page',)
	//   public async getAdminStatistic(@Query() query: RevenueDto,): Promise<void> {
	//   	// @ts-ignore

	// 	return this.statisticService.getMonthlyRevenueStats(query,)

	//   }
}
