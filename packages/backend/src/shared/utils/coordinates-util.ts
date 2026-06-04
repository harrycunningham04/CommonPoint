import type { LatLng, } from '@googlemaps/google-maps-services-js'

export const getCoordinatesFromAddress = async(address: string,): Promise<LatLng | null> => {
	const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address,)}&format=json&limit=1`
	try {
		const response = await fetch(url,)
		const data = await response.json() as Array<any>

		if (data && data.length > 0) {
			const { lat, lon, } = data[0]
			return [parseFloat(lat,), parseFloat(lon,),] as LatLng
		}

		console.error('Error getting coordinates:',)
		return null
	} catch (error) {
		console.error('Error fetching coordinates:', error,)
		return null
	}
}
