import { Module, } from '@nestjs/common'

import { BookingRepository, } from './booking.repository'
import { PrismaModule, } from 'nestjs-prisma'

@Module({
	providers:   [BookingRepository,],
	exports:     [BookingRepository,],
	imports:     [PrismaModule,],
},)
export class BookingRepositoryModule {}
