export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number,): number => {
	const toRadians = (deg: number,): number => {
		return (deg * Math.PI) / 180
	}

	const R = 6371

	const dLat = toRadians(lat2 - lat1,)
	const dLon = toRadians(lon2 - lon1,)

	const sinDLat = Math.sin(dLat / 2,)
	const sinDLon = Math.sin(dLon / 2,)
	const cosLat1 = Math.cos(toRadians(lat1,),)
	const cosLat2 = Math.cos(toRadians(lat2,),)

	const a = (sinDLat ** 2) + (cosLat1 * cosLat2 * (sinDLon ** 2))

	const c = 2 * Math.atan2(Math.sqrt(a,), Math.sqrt(1 - a,),)

	return R * c
}