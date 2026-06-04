import { Module, } from '@nestjs/common'
import { StatisticAdminController, } from './controllers/statistic.admins.controller'
import { StatisticContractorController, } from './controllers/statistic.contractors.controller'
import { StatisticSalesController, } from './controllers/statistic.sales.controller'
import { StatisticAdminsService, } from './services/statistic.admins.service'
import { StatisticContractorService, } from './services/statistic.contractors.service'
import { StatisticSalesService, } from './services/statistic.sales.service'
import { ContractorModule, } from '../contractor/contractor.module'

@Module({
	providers: [
		StatisticAdminsService,
		StatisticContractorService,
		StatisticSalesService,
	],
	controllers: [
		StatisticAdminController,
		StatisticContractorController,
		StatisticSalesController,
	],
	imports: [ContractorModule,],
},)
export class StatisticModule {}
