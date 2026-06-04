/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get, Query, } from '@nestjs/common'
import { StatisticContractorService, } from '../services/statistic.contractors.service'
import { StatisticContractor, StatisticDto, } from '../dto/get-revenue.dto'

@Controller('statistic-contractors',)
export class StatisticContractorController {
	constructor(
    private readonly statisticContractorService: StatisticContractorService,
	) {}

  @Get('upload-content',)
	public async getUploadStatistic() {
		return this.statisticContractorService.getStatisticDraft()
	}

  @Get('upload-sketch',)
  public async getUploadSketchStatistic(@Query() data:StatisticContractor,) {
  	return this.statisticContractorService.getSketchPercent(data,)
  }

  @Get('cancellation-rate',)
  public async getCancelationRate(@Query() data:StatisticContractor,) {
  	return this.statisticContractorService.getCancelationRateStatistic(data,)
  }

  @Get('contractor-earning',)
  public async getContractorEarning(@Query() data:StatisticContractor,) {
  	return this.statisticContractorService.getContractorEarningStatistic(data,)
  }

@Get('average-captured',)
  public async getAvaragePhotos(@Query() data:StatisticContractor,) {
  	return this.statisticContractorService.getPhotosEdited(data,)
  }

@Get('total-booking',)
public async getTotalBookingCompleted(@Query() data:StatisticContractor,) {
	return this.statisticContractorService.getTotalBookingStatistic(data,)
}

@Get('repeat-rate',)
public async getContractorRepeated(@Query() data:StatisticContractor,) {
	return this.statisticContractorService.getRepeatedRate(data,)
}

@Get('avarage-time',)
public async getAvarageTimeOnSite(@Query() data:StatisticContractor,) {
	return this.statisticContractorService.getAvarageTimeOnSite(data,)
}

  @Get('avarage-revenue',)
public async getAvarageRevenue() {
  	// return this.statisticContractorService
}

  @Get('main-page',)
  public async getSalesStatistic(@Query() data:StatisticContractor,) {
  	return this.statisticContractorService.getSketchPercent(data,)
  }
}
