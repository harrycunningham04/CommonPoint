/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma/dist/prisma.service'
import type { BookingRoutesFindDto, } from '../dto/booking-routes-find.dto'
import type { BookingRoute, ContractorTransportation, Prisma, RouteCache, } from '@prisma/client'
import { roundCoordinate, } from '../utils/round-coordinates.util'
import { MapService, } from 'src/modules/map/map.service'
import { mapTransportationToTravelMode, } from 'src/modules/map/map.utils'

@Injectable()
export class BookingRoutesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mapService: MapService,
	) {}

	public async findRouteByCoordinates(routeFindDto: BookingRoutesFindDto,): Promise<RouteCache | null> {
		const fromLat = roundCoordinate(routeFindDto.fromLat,)
		const fromLng = roundCoordinate(routeFindDto.fromLng,)
		const toLat   = roundCoordinate(routeFindDto.toLat,)
		const toLng   = roundCoordinate(routeFindDto.toLng,)

		return  this.prisma.routeCache.findFirst({
			where: {
				fromLat,
				fromLng,
				toLat,
				toLng,
				transportMode: routeFindDto.transportMode,
			},
		},)
	}

	public async createRoute(bookingId: string, route: RouteCache,): Promise<BookingRoute> {
		const bookingRoute = await this.prisma.bookingRoute.create({
			data: {
				bookingId,
				duration:  route.duration,
				distance:  route.distance,
				polyline:  route.polyline,
			},
		},)

		return bookingRoute
	}

	public async saveRouteToCache(route: Prisma.RouteCacheCreateInput,): Promise<RouteCache> {
		const roundedRoute = {
			...route,
			fromLat: roundCoordinate(route.fromLat,),
			fromLng: roundCoordinate(route.fromLng,),
			toLat:   roundCoordinate(route.toLat,),
			toLng:   roundCoordinate(route.toLng,),
		}

		return  this.prisma.routeCache.create({
			data: roundedRoute,
		},)
	}

	public async getOrCreateRoute({
		fromLat,
		fromLng,
		toLat,
		toLng,
		transportation,
	}: {
		fromLat: number
		fromLng: number
		toLat: number
		toLng: number
		transportation: ContractorTransportation
	},): Promise<RouteCache> {
		console.log('ROUTE WORK');
		
		const route = await this.findRouteByCoordinates({
			fromLat,
			fromLng,
			toLat,
			toLng,
			transportMode: transportation,
		},)

		if (route) {
			return route
		}

		const [duration, polyline,] = await Promise.all([
			this.mapService.getEstimatedTime(
				{ lat: fromLat, lng: fromLng, },
				{ lat: toLat, lng: toLng, },
				transportation,
			),
			this.mapService.getRoute(
				[`${fromLat},${fromLng}`, `${toLat},${toLng}`,],
				mapTransportationToTravelMode(transportation,),
			),
		],)

		return this.saveRouteToCache({
			fromLat,
			fromLng,
			toLat,
			toLng,
			duration:      duration ?? 0,
			distance:      0,
			polyline,
			transportMode: transportation,
		},)
	}
}