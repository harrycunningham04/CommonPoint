import { Controller, } from '@nestjs/common'
import { BookingRoutesService } from '../services/booking-routes.services';

@Controller('booking-routes',)
export class BookingRoutesController {
	constructor(private readonly bookingRoutesService: BookingRoutesService,) {}
}