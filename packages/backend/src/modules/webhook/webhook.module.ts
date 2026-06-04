import { Module, } from '@nestjs/common'
import { WebhookService, } from './webhook.service'
import { WebhookController, } from './webhook.controller'
import { StripeModule, } from '../stripe/stripe.module'
import { BookingModule, } from '../booking/booking.module'
import { InvoiceModule, } from '../invoice/invoice.module'
import { BookingGroupModule, } from '../booking-group/booking-group.module'

@Module({
	imports:     [StripeModule, BookingModule, InvoiceModule, BookingGroupModule,],
	controllers: [WebhookController,],
	providers:   [WebhookService,],
},)
export class WebhookModule {}
