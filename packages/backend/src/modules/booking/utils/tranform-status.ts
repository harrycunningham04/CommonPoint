import { BookingStatus, } from '@prisma/client'

export const transformStatusObject: Record<BookingStatus, 'BOOKED' | 'IN_PROGRESS' | 'DONE' | null> = {
	AWAITING_PAYMENT: null,
	BOOKED:           BookingStatus.BOOKED,
	CANCELED:         null,
	KEYS_COLLECTING:  BookingStatus.IN_PROGRESS,
	IN_PROGRESS:      BookingStatus.IN_PROGRESS,
	LEFT_THE_SITE:    BookingStatus.IN_PROGRESS,
	IN_REVIEW:        BookingStatus.IN_PROGRESS,
	DONE:             BookingStatus.DONE,
}

