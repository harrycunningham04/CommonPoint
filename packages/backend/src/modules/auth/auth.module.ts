import { Module, } from '@nestjs/common'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { AuthController, } from './auth.controller'
import { AuthService, } from './auth.service'
import { MailModule, } from '../mail/mail.module'
import { AdminModule, } from '../admin/admin.module'
import { DashboardModule, } from '../dashboard/dashboard.module'
import { NotificationsModule, } from '../notifications/notifications.module'
import { NotificationClientService, } from '../notifications/services/notification-client.service'

@Module({
	providers:   [
		AuthService,
		NotificationClientService,
	],
	controllers: [AuthController,],
	imports:     [
		JwtModule,
		CryptoModule,
		MailModule,
		AdminModule,
		DashboardModule,
		NotificationsModule,
		// clientsModule,
	],
},)
export class AuthModule {}
