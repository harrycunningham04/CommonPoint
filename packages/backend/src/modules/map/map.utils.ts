import { TravelMode, } from '@googlemaps/google-maps-services-js'
import { ContractorTransportation, } from '@prisma/client'

export const mapTransportationToTravelMode = (transportation: ContractorTransportation,): TravelMode => {
	switch (transportation) {
	case ContractorTransportation.BICYCLE:
		return TravelMode.bicycling
	case ContractorTransportation.MOTOBIKE:
		return TravelMode.driving
	case ContractorTransportation.CAR:
		return TravelMode.driving
	case ContractorTransportation.PUBLIC_TRANSPORTATION:
		return TravelMode.transit
	default:
		return TravelMode.driving
	}
}
