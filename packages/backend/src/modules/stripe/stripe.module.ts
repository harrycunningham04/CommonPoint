import { Module, } from '@nestjs/common'
import { StripeService, } from './stripe.service'
import { MailModule, } from '../mail/mail.module'
import { StripeController, } from './stripe.controller'
import { JwtModule, } from '../jwt/jwt.module'

@Module({
	controllers:   [StripeController,],
	providers:   [StripeService,],
	exports:     [StripeService,],
	imports:     [MailModule, JwtModule,],
},)
export class StripeModule {}
