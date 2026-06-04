import {Module,} from '@nestjs/common'
import { DashboardController, } from './controllers/dashboard-controller'
import { DashboardService, } from './services/dashboard.service'
import { DashboardClientController, } from './controllers/dashboard-client-controller'
import { JwtModule, } from '../jwt/jwt.module'
import { NotificationClientService, } from '../notifications/services/notification-client.service'
import { BookingModule, } from '../booking/booking.module'

@Module({
	controllers: [DashboardController,DashboardClientController,],
	providers:   [DashboardService,NotificationClientService,],
	exports:     [DashboardService,],
	imports:     [
		JwtModule,
		BookingModule,
	],
},)

export class DashboardModule {}