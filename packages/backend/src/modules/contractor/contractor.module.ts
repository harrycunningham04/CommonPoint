import type { OnModuleInit, } from '@nestjs/common'
import { forwardRef, Module, } from '@nestjs/common'
import { ContractorService, } from './services/contractor.service'
import { ContractorController, } from './controllers/contractor.controller'
import { MailModule, } from '../mail/mail.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { BookingModule, } from '../booking/booking.module'
import { MapModule, } from '../map/map.module'
import { AuthContractorService, } from './services/auth-contractor.service'
import { AuthContractorController, } from './controllers/auth-contractor.controller'
import { EditContractorController, } from './controllers/edit-contractor.controller'
import { ForgotPasswordAdminController, } from './controllers/forgot-password-contractor.controller'
import { ForgotPasswordContractorService, } from './services/forgot-password-contractor.service'
import { EditContractorService, } from './services/edit-contractor.service'
import { ForgotPasswordModule, } from 'src/repositories/forgot-password/forgot-password.module'
import { UploadModule, } from '../upload/upload.module'
import { BasicContractorService, } from './services/basic-contractor.service'
import { AvailabilityModule, } from '../availability/availability.module'
import { AdminContractorService, } from './services/admin-contractor.service'
import { AdminContractorController, } from './controllers/admin-contractor.controller'
import { AdminContractorSkillsService, } from './services/admin-contractor-skills.service'
import { AdminContractorSkillsController, } from './controllers/admin-contractor-skills.controller'
import { DefaultContractorsService, } from './services/default-contractors.service'
import { DefaultContractorController, } from './controllers/default-contractor.controller'
import { StripeModule, } from '../stripe/stripe.module'
import { ContractorPayoutService, } from './services/contractor-payout-service'
import { ContractorVacationService, } from './services/contractor-vacation.service'
import { NotificationsModule, } from '../notifications/notifications.module'

@Module({
	providers: [
		ContractorService,
		AuthContractorService,
		ForgotPasswordContractorService,
		EditContractorService,
		BasicContractorService,
		AdminContractorService,
		AdminContractorSkillsService,
		DefaultContractorsService,
		ContractorPayoutService,
		ContractorVacationService,
	],
	controllers: [
		ContractorController,
		AuthContractorController,
		EditContractorController,
		ForgotPasswordAdminController,
		AdminContractorController,
		AdminContractorSkillsController,
		DefaultContractorController,
	],
	imports: [
		StripeModule,
		MailModule,
		MapModule,
		JwtModule,
		CryptoModule,
		forwardRef(() => {
			return BookingModule
		},),
		ForgotPasswordModule,
		UploadModule,
		AvailabilityModule,
		NotificationsModule,
	],
	exports: [
		ContractorService,
		BasicContractorService,
		DefaultContractorsService,
		ContractorPayoutService,
		ContractorVacationService,
	],
},)
export class ContractorModule implements OnModuleInit {
	constructor(
        private readonly defaultContractorsService: DefaultContractorsService,
	) {}

	public async onModuleInit(): Promise<void> {
		try {
			await this.defaultContractorsService.createDefaultContractors()
		} catch (error) {
			console.error(error,)
		}
	}
}
