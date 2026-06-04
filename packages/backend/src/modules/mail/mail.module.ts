import { Module, } from '@nestjs/common'

import { MailService, } from './mail.service'
import { MailController } from './controllers/mail.controller'
import { JwtModule } from '../jwt/jwt.module'

@Module({
	controllers: [MailController,],
	providers:   [MailService,],
	exports:     [MailService,],
	imports:     [
		JwtModule,
	],
},)
export class MailModule {}
