import { forwardRef, Module, } from '@nestjs/common'
import { ClientsB2CController, } from './controllers/b2c.controller'
import { ClientsB2BController, } from './controllers/b2b.controller'
import { ClientsB2CService, } from './services/b2c.service'
import { ClientsB2BService, } from './services/b2b.service'
import { SubbrandService, } from './services/subbrand.service'
import { SubbrandController, } from './controllers/subbrand.controller'
import { OfficeController, } from './controllers/office.controller'
import { OfficeService, } from './services/office.service'
import { CryptoService, } from '../crypto/crypto.service'
import { MailService, } from '../mail/mail.service'
import { StripeModule, } from 'src/modules/stripe/stripe.module'
import { ForgotPasswordClientController, } from './controllers/forgot-password-clients.controller'
import { ForgotPasswordClientsService, } from './services/forgot-password-clients.service'
import { ConfigService, } from '@nestjs/config'
import { ForgotPasswordAdminRepository, } from 'src/repositories/forgot-password-admin/forgot-password-admin.repository'
import { ProductsModule, } from '../products/products/products.module'
import { BookingGroupService, } from '../booking-group/booking-group.service'
import { JWTService, } from '../jwt/jwt.service'
import { PrismaModule, } from 'nestjs-prisma'
import { WorkerService, } from './services/worker.service'
import { ClientsProfileController, } from './controllers/clients-profile.controller'
import { ClientBasicService, } from './services/client-basic.service'
import { ClientBasicController, } from './controllers/client-basic.controller'
import { WorkerController, } from './controllers/worker.controller'
import { AdminWorkerController, } from './controllers/admin/admin-worker.controller'
import { AdminOfficeController, } from './controllers/admin/admin-office.controller'
import { AdminClientsB2BController, } from './controllers/admin/admin-b2b.controller'
import { AdminSubbrandsController, } from './controllers/admin/admin-subbrands.controller'
import { AdminSubbrandService, } from './services/admin-subbrand.service'
import { PreferencesController, } from './controllers/preferences.controller'
import { PreferencesService, } from './services/preferences-service'
import { PreferenceInitializeService, } from './services/preference-initialize.service'
import { OfficeBasicController, } from './controllers/office-basic.controller'
import { OfficeBasicService, } from './services/office-basic.service'
import { PackageService, } from '../products/packages/packages.service'

@Module({
	controllers: [ClientsB2CController, ClientsB2BController,ClientsProfileController, SubbrandController, OfficeController,
		ForgotPasswordClientController,ClientBasicController,WorkerController, AdminWorkerController, AdminOfficeController, AdminClientsB2BController, AdminSubbrandsController,PreferencesController,OfficeBasicController,],
	providers:   [ClientsB2CService, ClientsB2BService,WorkerService, SubbrandService, CryptoService, MailService, OfficeService,ForgotPasswordClientsService,
		ConfigService,ForgotPasswordAdminRepository,BookingGroupService,JWTService,ClientBasicService,AdminSubbrandService,PreferencesService,PreferenceInitializeService,OfficeBasicService,PackageService,],
	imports:     [
		StripeModule,
		ProductsModule,
		PrismaModule,
	],
	exports: [
		ClientsB2BService,
		ClientsB2CService,
		WorkerService,
		OfficeService,
		BookingGroupService,
		ClientBasicService,
	],
},)
export class ClientsModule {}
