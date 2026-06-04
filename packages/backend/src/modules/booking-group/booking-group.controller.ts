import { Controller } from '@nestjs/common';
import { BookingGroupService } from './booking-group.service';

@Controller('booking-group')
export class BookingGroupController {
  constructor(private readonly bookingGroupService: BookingGroupService) {}
}
