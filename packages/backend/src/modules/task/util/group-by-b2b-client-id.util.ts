import type { BookingGroup, } from '@prisma/client'

export const groupByClientAndOffice = (
	bookingGroups: Array<BookingGroup>,
): Record<string, Record<string, Array<BookingGroup>>> => {
	const result: Record<string, Record<string, Array<BookingGroup>>> = {}

	for (const bg of bookingGroups) {
		if (!bg.b2BClientsId || !bg.officeId) {
			continue
		}

		if (!result[bg.b2BClientsId]) {
			result[bg.b2BClientsId] = {}
		}

		if (!result[bg.b2BClientsId]![bg.officeId]) {
			result[bg.b2BClientsId]![bg.officeId] = []
		}

		result[bg.b2BClientsId]![bg.officeId]!.push(bg,)
	}

	return result
}