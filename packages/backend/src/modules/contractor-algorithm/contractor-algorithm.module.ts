import { Module, } from '@nestjs/common'
import { ContractorAlgorithmService, } from './contractor-algorithm.service'
import { ContractorAlgorithmController, } from './contractor-algorithm.controller'
import { InvoiceModule, } from '../invoice/invoice.module'
import { BookingGroupModule, } from '../booking-group/booking-group.module'
import { ClientsModule, } from '../clients/clients.module'
import { StatisticTrackingModule, } from '../statistic-tracking/statistic-tracking.module'
import { AvailabilityModule, } from '../availability/availability.module'
import { JwtModule, } from '../jwt/jwt.module'
import { BookingModule, } from '../booking/booking.module'
import { RegionsModule, } from '../regions/regions.module'
@Module({
	controllers: [ContractorAlgorithmController,],
	providers:   [ContractorAlgorithmService,],
	imports:     [InvoiceModule, BookingGroupModule, ClientsModule, StatisticTrackingModule, AvailabilityModule,
		JwtModule,
		BookingModule,
		RegionsModule,
	],
},)
export class ContractorAlgorithmModule {}
