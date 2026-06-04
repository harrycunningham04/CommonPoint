import { NotificationCategory, } from '@prisma/client'

export const NOTIFIFCATION_CLIENT_PREFERENCES = [
	NotificationCategory.KEYS_COLLECTED,
	NotificationCategory.CONTRACTOR_ARRIVED_ON_SITE,
	NotificationCategory.BOOKING_MATERILAS_IN_PROGRESS,
	NotificationCategory.CONTRACTOR_LEFT_THE_SITE,
	NotificationCategory.CONTRACTOR_LEFT_THE_KEYS,
	NotificationCategory.BOOKING_COMPLETED,
	NotificationCategory.BOOKING_CANCELED,
	NotificationCategory.BOOKING_DISPUTE_SOLVED,
	NotificationCategory.NEW_PRODUCT_AVAILABLE,
	NotificationCategory.NEW_COUPON_ACTIVE,
	NotificationCategory.UPDATE_TERMS_AND_CONDITIONS,
	NotificationCategory.BOOKINGS_NEW_BOOKING,
	NotificationCategory.BOOKING_CONFIRMED,
	NotificationCategory.BOOKINGS_ADJUSTED,
	NotificationCategory.BOOKING_CANCELED,
]