/* eslint-disable no-mixed-spaces-and-tabs */

import londonRegions from '../../shared/london.json'
import { point, } from '@turf/helpers'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { Feature, FeatureCollection, } from 'geojson'

export const fetchCoordinates = async(address: string,): Promise<[number, number] | null> => {
	const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address,)}&format=json&limit=1`
	const response = await fetch(url,)
	if (!response.ok) {
		throw new Error('Failed to fetch coordinates',)
	}

	const data = await response.json() as any

	if (data && data?.length > 0) {
		const { lat, lon, } = data[0]
		return [parseFloat(lon,), parseFloat(lat,),]
	}

	throw new Error(`No coordinates found for location: ${address}`,)
}

export const calculatePointRegion = (center: [number, number],): Feature | null => {
	const centerPoint = point(center,)
	const filteredRegions = JSON.parse(JSON.stringify(londonRegions,),) as FeatureCollection
	const matchingRegion = filteredRegions.features.find((feature: any,) => {
		if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
			return booleanPointInPolygon(centerPoint, feature,)
		}
		return false
	},)
	return matchingRegion ?? null
}