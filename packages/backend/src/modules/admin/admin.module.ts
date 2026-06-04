import { Module, } from '@nestjs/common'
import { AdminService, } from './services/admin.service'
import { AdminController, } from './controllers/admin.controller'
import { MailModule, } from '../mail/mail.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { ForgotPasswordAdminService, } from './services/forgot-password-admin.service'
import { ForgotPasswordAdminController, } from './controllers/forgot-password-admin.controller'
import { ForgotPasswordAdminModule, } from 'src/repositories/forgot-password-admin/forgot-password-admin.module'
import { CronService, } from './services/cron.service'

@Module({
	providers: [
		AdminService,
		ForgotPasswordAdminService,
		CronService,
	],

	controllers: [AdminController, ForgotPasswordAdminController,],
	imports:     [
		MailModule,
		JwtModule,
		CryptoModule,
		MailModule,
		ForgotPasswordAdminModule,
	],
	exports: [AdminService,],
},)
export class AdminModule {}
