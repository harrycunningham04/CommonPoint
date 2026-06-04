import { OrderValueLevel, } from './booking-group.types'

export const getOrderValueLevel = (sumOfCurrentOrder: number, averageOrderValue: number,):   OrderValueLevel => {
	const valueMultiplier = 100
	const valueMultiplierStep = 15

	if (sumOfCurrentOrder < averageOrderValue * (valueMultiplier - valueMultiplierStep)) {
		return OrderValueLevel.LOW
	}

	if (sumOfCurrentOrder < averageOrderValue * (valueMultiplier + valueMultiplierStep)) {
		return OrderValueLevel.HIGH
	}
	return OrderValueLevel.REGULAR
}