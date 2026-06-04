import { Module, } from '@nestjs/common'
import { EarningsController, } from './earnings.controller'
import { EarningsService, } from './earnings.service'
import { ContractorModule, } from '../contractor/contractor.module'

@Module({
	controllers: [EarningsController,],
	providers:   [EarningsService,],
	exports:     [EarningsService,],
	imports:     [ContractorModule,],
},)
export class EarningsModule {}
