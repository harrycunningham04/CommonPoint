import { Module, } from '@nestjs/common'
import { ClientDisputeController, } from './controllers/client-dispute.controller'
import { ContractorDisputeController, } from './controllers/contractor-dispute.controller'
import { ClientDisputeService, } from './services/client-dispute.service'
import { ContractorDisputeService, } from './services/contractor-dispute.service'
import { JwtModule, } from '../jwt/jwt.module'
import { AdminDisputeController, } from './controllers/admin-dispute.controller'
import { AdminDisputeService, } from './services/admin-dispute.service'

@Module({
	controllers: [ClientDisputeController, ContractorDisputeController, AdminDisputeController,],
	providers:   [ClientDisputeService, ContractorDisputeService, AdminDisputeService,],
	imports:     [
		JwtModule,
	],
},)
export class DisputesModule {}
