import { Module, } from '@nestjs/common'
import { CouponService, } from './coupons.service'
import { CouponController, } from './coupons.controller'
import { PrismaModule, } from 'nestjs-prisma'
import { StripeModule, } from 'src/modules/stripe/stripe.module'
import { ProductsModule, } from '../products/products.module'
import { JwtModule, } from 'src/modules/jwt/jwt.module'

@Module({
	imports:     [
		PrismaModule,
		StripeModule,
		ProductsModule,
		JwtModule,
	],
	controllers: [CouponController,],
	providers:   [CouponService,],
},)
export class CouponsModule {}
