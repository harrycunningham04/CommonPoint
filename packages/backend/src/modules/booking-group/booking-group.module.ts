import { Module, } from '@nestjs/common'
import { BookingGroupService, } from './booking-group.service'
import { BookingGroupController, } from './booking-group.controller'
import { InvoiceModule, } from '../invoice/invoice.module'

@Module({
	controllers: [BookingGroupController,],
	providers:   [BookingGroupService,],
	imports:     [InvoiceModule,],
	exports:     [BookingGroupService,],
},)
export class BookingGroupModule {}
