import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { MapService, } from 'src/modules/map/map.service'
import { calculatePointRegion, } from 'src/shared/utils/regions-util'

@Injectable()
export class RegionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mapService: MapService,
	) {}

	public async checkAddressRegionAccessibility(address: string,): Promise<boolean> {
		const availableRegions = await this.prisma.region.findMany()
		const availableRegionNames = availableRegions.map((region,) => {
			return region.name
		},)
		const coordObject = await this.mapService.getCoordFromAddress(address,)
		const coordinates: [number, number] | null = coordObject ?
			[coordObject.lng, coordObject.lat,] :
			null
		const regionName = this.getRegionByCoordinates(coordinates,)
		if (regionName && availableRegionNames.includes(regionName,)) {
			return true
		}
		return false
	}

	public getRegionByCoordinates(coordinates: [number, number] | null,): string | null {
		if (!coordinates) {
			return null
		}
		const addressRegion = calculatePointRegion(coordinates,)
		if (addressRegion?.properties?.['name']) {
			return addressRegion.properties['name']
		}
		return null
	}

	public async getRegionIdByCoordinates(coordinates: [number, number] | null,): Promise<string | null> {
		const regionName = this.getRegionByCoordinates(coordinates,)
		if (!regionName) {
			return null
		}
		const region = await this.prisma.region.findFirst({
			where: {
				name: regionName,
			},
		},)
		return region?.id ?? null
	}
}