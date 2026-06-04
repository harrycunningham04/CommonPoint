import { Module, } from '@nestjs/common'
import { RegionController, } from './controllers/client-region.controller'
import { RegionService, } from './services/client-region.service'
import { JwtModule, } from '../jwt/jwt.module'
import { MapModule, } from '../map/map.module'

@Module({
	controllers: [RegionController,],
	providers:   [RegionService,],
	exports:     [RegionService,],
	imports:     [
		JwtModule,
		MapModule,
	],
},)
export class RegionsModule {}
