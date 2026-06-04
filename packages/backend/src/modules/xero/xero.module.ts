import { Module, } from '@nestjs/common'
import { XeroController, } from './controllers/xero.controller'
import { XeroService, } from './services/xero.service'
import { PrismaModule, } from 'nestjs-prisma'
import { ConfigModule, } from '@nestjs/config'
import { XeroTestController, } from './controllers/xero-test.controller'
import { XeroTestService, } from './services/xero-test.service'

@Module({
	controllers: [XeroController, XeroTestController,],
	providers:   [XeroService, XeroTestService,],
	exports:     [XeroService, XeroTestService,],
	imports:     [PrismaModule, ConfigModule,],
},)
export class XeroModule {}