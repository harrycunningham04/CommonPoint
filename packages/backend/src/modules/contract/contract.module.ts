import { Module, } from '@nestjs/common'
import { MailModule, } from '../mail/mail.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { ContractService, } from './services/contract.service'
import { ContractController, } from './controllers/contract.controller'
import { UploadModule, } from '../upload/upload.module'

@Module({
	providers:   [
		ContractService,
	],
	controllers: [ContractController,],
	imports:     [
		MailModule,
		JwtModule,
		CryptoModule,
		UploadModule,
	],
	exports: [ContractService,],
},)
export class ContractModule {}
