import { Module, } from '@nestjs/common'
import { InvoiceClientController, } from './controllers/invoice-client.controller'
import { InvoiceClientService, } from './services/invoice-client.service'
import { InvoiceContractorController, } from './controllers/invoice-contractor.controller'
import { InvoiceContractorService, } from './services/invoice-contractor.service'
import { JwtModule, } from '../jwt/jwt.module'
import { StatisticTrackingModule, } from '../statistic-tracking/statistic-tracking.module'
import { PrismaModule, } from 'nestjs-prisma'
import { CalculationModule, } from '../calculation/calculation.module'

@Module({
	controllers: [InvoiceClientController, InvoiceContractorController,],
	providers:   [InvoiceClientService, InvoiceContractorService,],
	imports:     [JwtModule, StatisticTrackingModule,PrismaModule,CalculationModule,],
	exports:     [InvoiceClientService, InvoiceContractorService,],
},)

export class InvoiceModule {}