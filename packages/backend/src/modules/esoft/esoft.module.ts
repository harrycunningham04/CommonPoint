import { Module, } from '@nestjs/common'
import { PrismaModule, } from 'nestjs-prisma'
import { ESoftController, } from './esoft.controller'
import { ESoftService, } from './esoft.service'
import { ConfigModule, } from '@nestjs/config'
import { ESoftTestController, } from './controllers/esoft-test.controller'
import { ESoftTestService, } from './services/esoft-test.service'
import { UploadModule, } from '../upload/upload.module'
@Module({
	imports:     [PrismaModule, ConfigModule, UploadModule,],
	controllers: [ESoftController, ESoftTestController,],
	providers:   [ESoftService, ESoftTestService,],
	exports:     [ESoftService,],
},)
export class ESoftModule {}
