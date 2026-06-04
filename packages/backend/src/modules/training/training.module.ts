import { Module, } from '@nestjs/common'
import { MailModule, } from '../mail/mail.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { TrainingService, } from './services/training.service'
import { TrainingController, } from './controllers/training.controller'
import { UploadModule, } from '../upload/upload.module'
import { TrainingContractorController, } from './controllers/training-contractor.controller'
import { TrainingContractorService, } from './services/training-contractor.service'
import { NotificationsModule, } from '../notifications/notifications.module'
import { NotificationService, } from '../notifications/services/notification.service'

@Module({
	providers:   [
		TrainingService,
		TrainingContractorService,
		NotificationService,	
	],
	controllers: [TrainingController,TrainingContractorController,],
	imports:     [
		MailModule,
		JwtModule,
		CryptoModule,
		UploadModule,
		NotificationsModule,
	],
	exports: [TrainingService,],
},)
export class TrainingModule {}
