import { Module, } from '@nestjs/common'
import { BookingRoutesController, } from './controllers/booking-routes.controller'
import { BookingRoutesService, } from './services/booking-routes.services'
import { PrismaModule, } from 'nestjs-prisma'
import { MapModule } from '../map/map.module'

@Module({
	controllers: [BookingRoutesController,],
	providers:   [BookingRoutesService,],
	exports:     [BookingRoutesService,],
	imports:     [PrismaModule, MapModule,],
},)

export class BookingRoutesModule {}