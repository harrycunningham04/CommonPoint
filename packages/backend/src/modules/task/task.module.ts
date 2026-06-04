import { Module, } from '@nestjs/common'
import { TaskService, } from './task.service'
import { StripeModule, } from '../stripe/stripe.module'
import { InvoiceModule, } from '../invoice/invoice.module'
import { ClientsModule, } from '../clients/clients.module'
import { TaskController, } from './task.controller'
import { StatisticTrackingModule, } from '../statistic-tracking/statistic-tracking.module'
import { AvailabilityModule, } from '../availability/availability.module'
import { ContractorModule, } from '../contractor/contractor.module'
import { BookingModule, } from '../booking/booking.module'
import { NotificationsModule, } from '../notifications/notifications.module'
import { CalculationModule, } from '../calculation/calculation.module'
import { XeroModule, } from '../xero/xero.module'
import { BookingGroupModule, } from '../booking-group/booking-group.module'
import { AdminModule, } from '../admin/admin.module'

@Module({
	controllers: [TaskController,],
	imports:     [StripeModule, InvoiceModule, ClientsModule, StatisticTrackingModule, AvailabilityModule, ContractorModule, BookingModule, NotificationsModule, CalculationModule,
		BookingGroupModule,XeroModule,AdminModule,],
	providers:   [TaskService,],
},)
export class TaskModule {}
