import { forwardRef, Module, } from '@nestjs/common'
import { AvailabilityService, } from './availability.service'
import { BookingRepositoryModule, } from '../../repositories/booking/booking.module'
@Module({
	providers:   [AvailabilityService,],
	exports:     [AvailabilityService,],
	imports:     [forwardRef(() => {
		return BookingRepositoryModule
	},),],
},)
export class AvailabilityModule {}
