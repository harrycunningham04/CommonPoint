import { Module, } from '@nestjs/common'
import { OnesignalService, } from './onesignal.service'
import { OnesignalController, } from './onesignal.controller'
import { PrismaModule, } from 'nestjs-prisma'
import { JwtModule, } from '../jwt/jwt.module'

@Module({
	controllers: [OnesignalController,],
	providers:   [OnesignalService,],
	exports:     [OnesignalService,],
	imports:     [PrismaModule, JwtModule,],
},)
export class OnesignalModule {}
