import { Module, } from '@nestjs/common'
import { PackagesController, } from './packages.controller'
import { PackageService, } from './packages.service'
import { JwtModule, } from 'src/modules/jwt/jwt.module'
import { StripeModule, } from 'src/modules/stripe/stripe.module'
import { WorkerService, } from 'src/modules/clients/services/worker.service'
import { ClientsModule, } from 'src/modules/clients/clients.module'
import { CryptoModule, } from 'src/modules/crypto/crypto.module'
import { MailModule, } from 'src/modules/mail/mail.module'
import { ClientPackagesController, } from './client-packages/client-packages.controller'
import { ClientPackagesService, } from './client-packages/client-packages.service'
import { OfficePackagesController, } from './office-packages/office-packages.controller'
import { OfficePackagesService, } from './office-packages/office-packages.service'
import { AdminPackagesController, } from './admin-packages.controller'
import { ClientBasicService, } from 'src/modules/clients/services/client-basic.service'
import { ProductService, } from '../products/products.service'
import { ProductsModule, } from '../products/products.module'

@Module({
	controllers: [PackagesController, ClientPackagesController, OfficePackagesController, AdminPackagesController,],
	providers:   [PackageService,WorkerService,ClientPackagesService,OfficePackagesService,ClientBasicService,],
	exports:     [ClientPackagesService, PackageService, OfficePackagesService,],
	imports:     [JwtModule,StripeModule,ClientsModule,CryptoModule,MailModule,ProductsModule,],
},)
export class PackagesModule {}
