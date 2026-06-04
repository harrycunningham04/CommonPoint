import { Module, } from '@nestjs/common'
import { CalculationService, } from './calculation.service'
import { CalculationController, } from './calculation.controller'
import { PrismaModule, } from 'nestjs-prisma'
import { BookingRepositoryModule, } from 'src/repositories/booking/booking.module'
import { JwtModule, } from '../jwt/jwt.module'

@Module({
	controllers: [CalculationController,],
	providers:   [CalculationService,],
	imports:     [PrismaModule, BookingRepositoryModule, JwtModule,],
	exports:     [CalculationService,],
},)
export class CalculationModule {}
