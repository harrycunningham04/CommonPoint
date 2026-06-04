export function roundCoordinate(value: number, precision = 3,): number {
	return Number(value.toFixed(precision,),)
}