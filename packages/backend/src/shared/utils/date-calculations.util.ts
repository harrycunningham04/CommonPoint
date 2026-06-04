const MINUTES_IN_HOUR = 60

export function calculateTimeSlot(
	period: { from: Array<number>, to: Array<number> },
	latestBooking: number,
	slotDuration: number,
): number {
	const allPeriodDuration = period.from.reduce((prev, curr, i,) => {
		const fromTotalMinutes = Math.max(curr, latestBooking,)
		const toTotalMinutes = period.to[i] ?? 0
		return prev + Math.max(toTotalMinutes - fromTotalMinutes, 0,)
	}, 0,)
	return Math.floor(allPeriodDuration / (slotDuration <= 0 ?
		1 :
		slotDuration) ,)
}

export function calculateTimeSlots(
	period: { from: Array<number>, to: Array<number> },
): Array<number> {
	return period.from.map((curr, i,) => {
		const fromTotalMinutes = Math.max(curr, 0,)
		const toTotalMinutes = period.to[i] ?? 0
		return Math.max(fromTotalMinutes, toTotalMinutes,)
	},)
}

export function splitTimeDate(hours: number,): [number | null, number | null,] {
	return [hours, 0,]
}

export function getMinutesTimeDate(hours: number,): number {
	return hours * 60
}

export function splitTime(time: string,) {
	return time.replace(/\s+/g, '',).split(':',)
		.map(Number,)
}

export function getMinutesTime(duration: number,): number {
	return duration * MINUTES_IN_HOUR
}

export function getMinutesTimeDifference(duration: number,): number {
	return duration * MINUTES_IN_HOUR
}