import { Module, } from '@nestjs/common'
import { ProductController, } from './products.controller'
import { ProductService, } from './products.service'
import { AdminProductsController, } from './controllers/admin-products.controller'
import { AdminProductService, } from './services/admin-product.service'
import { StripeModule, } from 'src/modules/stripe/stripe.module'
import { JwtModule, } from 'src/modules/jwt/jwt.module'
import { EarningsModule, } from '../../earnings/earnings.module'
import { ContractorModule, } from '../../contractor/contractor.module'
import { UploadModule, } from 'src/modules/upload/upload.module'
@Module({
	imports:     [
		StripeModule,
		JwtModule,
		EarningsModule,
		ContractorModule,
		UploadModule,
	],
	controllers: [ProductController, AdminProductsController,],
	providers:   [ProductService, AdminProductService,],
	exports:     [ProductService,],
},)
export class ProductsModule {}
