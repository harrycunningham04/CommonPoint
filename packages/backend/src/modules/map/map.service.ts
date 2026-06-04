/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-mixed-spaces-and-tabs */
import { Injectable, Logger, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'

import type {
	DirectionsResponseData,
	LatLng,} from '@googlemaps/google-maps-services-js'
import {
	Client,
	Status,
	TravelMode,
} from '@googlemaps/google-maps-services-js'
import type { ContractorTransportation, } from '@prisma/client'
import { mapTransportationToTravelMode, } from './map.utils'
import type { IAutocompleteResponse, ILocationResponse, } from './map.types'

@Injectable()
export class MapService {
	private readonly logger = new Logger(MapService.name,)

	private readonly client = new Client({},)

	private readonly apiKey: string

	constructor(
        private readonly configService: ConfigService,
	) {
		this.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY',) ?? ''
	}

	public async getRoutes(waypoints: Array<LatLng>, travelMode = TravelMode.driving,): Promise<DirectionsResponseData | undefined> {
		try {
			if (waypoints[0]) {
				if (travelMode === TravelMode.transit) {
					const combinedRoutes: DirectionsResponseData = {
						routes:                 [],
						geocoded_waypoints:     [],
						available_travel_modes: [],
						status:                 Status.OK,
						error_message:          '',
					}

					for (let waypointIndex = 0; waypointIndex < waypoints.length - 1; waypointIndex++) {
						const directionsResponseBetweenTwo = await this.client.directions({
							params: {
								origin:      waypoints[waypointIndex]!,
								destination: waypoints[waypointIndex + 1]!,
								mode:        travelMode,
								key:         this.apiKey,
							},
							timeout: 1000,
						},)

						// combine the routes and geocoded waypoints
						combinedRoutes.routes.push(...directionsResponseBetweenTwo.data.routes,)
						combinedRoutes.geocoded_waypoints.push(...directionsResponseBetweenTwo.data.geocoded_waypoints,)
					}

					// return combined response data
					return combinedRoutes
				}

				const directionsResponse = await this.client.directions({
					params: {
						origin:      waypoints[0],
						destination: waypoints[waypoints.length - 1] ?? waypoints[0],
						waypoints:   waypoints.slice(1, waypoints.length - 1,),
						mode:        travelMode,
						key:         this.apiKey,
					},
					timeout: 1000,
				},)

				if (!directionsResponse.data || directionsResponse.data.status !== 'OK') {
					this.logger.error('Error fetching directions:', directionsResponse.data,)
					return undefined
				}

				return directionsResponse.data
			}
			return undefined
		} catch (error) {
			this.logger.error({ error, },)
			return undefined
		}
	}

	public async getCoordFromAddress(address: string,): Promise<{ lat: number; lng: number; placeId: string } | null> {
		try {
		  const response = await this.client.geocode({
				params: {
			  address,
			  key: this.apiKey,
				},
		  },)

		  if (response.data.status === Status.OK && response.data.results.length > 0) {
				const [result,] = response.data.results
				if (!result?.geometry) {
					console.error('Geocoding failed: geometry is undefined',)
					return null
				}
				const { geometry, } = result
				const { location, } = geometry
				const placeId = response.data.results[0]?.place_id ?? ''
				return { lat: location.lat, lng: location.lng, placeId, }
		  }
			console.error('Geocoding failed:', response.data.status,)
			return null
		} catch (error) {
		  console.error('Error fetching coordinates:', error,)
		  return null
		}
	  }

	public async getCoordFromPlaceId(placeId: string,): Promise<{ lat: number; lng: number; placeId: string } | null> {
		try {
		  const response = await this.client.placeDetails({
				params: {
			  place_id: placeId,
			  key:      this.apiKey,
				},
		  },)

		  if (response.data.status === Status.OK && response.data.result) {
				const {result,} = response.data
				if (!result?.geometry) {
					console.error('Geocoding failed: geometry is undefined',)
					return null
				}
				const { geometry, } = result
				const { location, } = geometry
				return { lat: location.lat, lng: location.lng, placeId, }
		  }
			console.error('Geocoding failed:', response.data.status,)
			return null
		} catch (error) {
		  console.error('Error fetching coordinates:', error,)
		  return null
		}
	  }

	  public async getRoute(points: Array<string>,travelMode: TravelMode = TravelMode.driving,): Promise<string | null> {
		try {
		  const coordinates = []
		  for (const address of points) {
				const coord = await this.getCoordFromAddress(address,)
				if (!coord) {
			  console.error(`Could not fetch coordinates for address: ${address}`,)
			  return null
				}
				coordinates.push({ lat: coord.lat, lng: coord.lng, },)
		  }

		  const response = await this.client.directions({
				params: {
			  origin:      coordinates[0]!,
			  destination: coordinates[coordinates.length - 1]!,
			  waypoints:   coordinates.slice(1, coordinates.length - 1,),
			  key:         this.apiKey,
			  mode:        travelMode,
				},
		  },)

		  if (response.data.status === Status.OK && response.data.routes.length > 0) {
				const route = response.data.routes[0]
				const polyline = route?.overview_polyline.points
				return polyline ?? null
		  }

		  console.error('Could not fetch route:', response.data.status,)
		  return null
		} catch (error) {
		  console.error('Error fetching route:', error,)
		  return null
		}
	  }

	  public async getRouteByCoordinates(coordinates: Array<{ lat: number; lng: number }>,
		transportation: ContractorTransportation,): Promise<string | null> {
		try {
			const travelMode = mapTransportationToTravelMode(transportation,)
			const response = await this.client.directions({
				params: {
					origin:      coordinates[0]!,
					destination: coordinates[coordinates.length - 1]!,
					waypoints:   coordinates.slice(1, coordinates.length - 1,),
					key:         this.apiKey,
					mode:        travelMode,
				},
			},)

			if (response.data.status === Status.OK && response.data.routes.length > 0) {
				const route = response.data.routes[0]
				const polyline = route?.overview_polyline.points
				return polyline ?? null
			}

			console.error('Could not fetch route:', response.data.status,)
			return null
		} catch (error) {
			console.error('Error fetching route:', error,)
			return null
		}
	}

	  public async getEstimatedTime(
		origin: { lat: number; lng: number },
		destination: { lat: number; lng: number },
		transportation: ContractorTransportation,
	  ): Promise<number | null> {
		try {
			if (origin.lat === destination.lat && origin.lng === destination.lng) {
				return 0
			}
			const travelMode = mapTransportationToTravelMode(transportation,)
		  const response = await this.client.directions({
				params: {
			  origin,
			  destination,
			  key:  this.apiKey,
			  mode: travelMode,
				},
		  },)

		  if (response.data.status === Status.OK && response.data.routes.length > 0) {
				const route = response.data.routes[0]
				if (route) {
					return Math.ceil(route.legs.reduce((total, leg,) => {
						return total + (leg.duration?.value || 0)
					}, 0,) / 60,)
				}
				return null
		  }

		  return null
		} catch (error) {
		  console.error('Error fetching estimated time:', error,)
		  return null
		}
	  }

	public async autocomplete(query: string,): Promise<IAutocompleteResponse> {
		if (!query) {
			return {
				predictions: [],
			}
		}

		const response = await this.client.placeAutocomplete({
			params: {
				input:      query,
				key:        this.apiKey,
				language:   'en',
				components: ['country:gb',],
				location:   '51.509865,-0.118092',
				radius:     25000,
			},
		},)

		if (response.data.status === Status.OK) {
			const predictions = response.data.predictions.map((prediction,) => {
				return {
					address:  prediction.description,
					placeId:  prediction.place_id,
				}
			},)
			return { predictions, }
		}

		return {
			predictions: [],
		}
	}

	public async getLocationByAddress(query: string,): Promise<ILocationResponse|null> {
		const location = await this.getCoordFromAddress(query,)
		if (location?.lat && location.lng) {
			return {
				placeId:   location.placeId,
				latitude:  location.lat,
				longitude: location.lng,
			}
		}
		return null
	}
}
