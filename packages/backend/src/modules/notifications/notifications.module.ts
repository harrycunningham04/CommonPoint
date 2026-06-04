import { Module, } from '@nestjs/common'
import { NotificationController, } from './controllers/notification.controller'
import { NotificationService, } from './services/notification.service'
import { JwtModule, } from '../jwt/jwt.module'
import { MailModule, } from '../mail/mail.module'
import { NotificationClientController, } from './controllers/notification-client.controller'
import { NotificationClientService, } from './services/notification-client.service'
import { OnesignalModule, } from '../onesignal/onesignal.module'
import { NotificationContractorService, } from './services/notification-contractor.service'
import { NotificationContractorController, } from './controllers/notification-contractor.controller'
import { BookingRepositoryModule, } from 'src/repositories/booking/booking.module'
import { NotificationFormService, } from './services/notification-form.service'

@Module({
	controllers: [NotificationController, NotificationClientController, NotificationContractorController,],
	providers:   [NotificationService, NotificationClientService, NotificationContractorService,NotificationFormService,],
	imports:     [
		JwtModule,
		MailModule,
		OnesignalModule,
		BookingRepositoryModule,
	],
	exports: [NotificationService, NotificationClientService, NotificationContractorService,],
},)
export class NotificationsModule {}
