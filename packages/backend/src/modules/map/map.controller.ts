import { Controller, Get, Query, } from '@nestjs/common'
import { MapService, } from './map.service'
import type { IAutocompleteResponse, ILocationResponse, } from './map.types'

@Controller('map',)
export class MapController {
	constructor(private readonly mapService: MapService,) {}

	@Get('autocomplete',)
	public async autocomplete(@Query('query',) query: string,): Promise<IAutocompleteResponse> {
		return this.mapService.autocomplete(query,)
	}

	@Get('location',)
	public async getLocation(@Query('query',) query: string,):Promise<ILocationResponse | null> {
		return this.mapService.getLocationByAddress(query,)
	}
}
