import { Module, } from '@nestjs/common'
import { StatisticTrackingService, } from './services/statistic-tracking.service'
import { ContractorStatisticCalculationService, } from './services/contractor-statistic-calculation.service'
import { ContractorStatisticController, } from './statistic-tracking.controller'
import { JwtModule, } from '../jwt/jwt.module'

@Module({
	controllers: [ContractorStatisticController,],
	providers:   [StatisticTrackingService, ContractorStatisticCalculationService,],
	exports:     [StatisticTrackingService, ContractorStatisticCalculationService,],
	imports:     [JwtModule,],
},)
export class StatisticTrackingModule {}
