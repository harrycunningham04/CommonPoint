import { NotificationCategory,} from '@prisma/client'
import type { NotificationType, } from '@prisma/client'
import type { EClientType, } from 'src/shared/types/client.type'

export interface ICreateNotificationUser {
    type : NotificationType
    category : NotificationCategory
    bookingGroupId?:string;
    clientId:string;
		additionalClientId?: string;
    clientType : EClientType
}

export enum ENotificationType {
    JOBS = 'JOBS',
    BOOKINGS = 'BOOKINGS',
    UPDATES = 'UPDATES',
	PAYMENTS = 'PAYMENTS',
}

export const ENotificationFilters = {
	[ENotificationType.JOBS]: {
		category: [
			NotificationCategory.BOOKINGS_NEW_BOOKING,
			// notificationCategory.BOOKINGS_UPLOADED_MATERIALS,
			// notificationCategory.BOOKINGS_REVIEW_MATERIALS,
		],
	},
	[ENotificationType.BOOKINGS]: {
		category: [NotificationCategory.BOOKING_CANCELED,],
	},
	[ENotificationType.UPDATES]: {
		category: [
			NotificationCategory.CONTRACTOR_NO_AVAILABILITY_NEXT_WEEK,
			NotificationCategory.CONTRACTOR_CHANGED_TRANSPORTATION_METHOD,
			NotificationCategory.BOOKING_DISPUTE_SOLVED,
		],
	},
	[ENotificationType.PAYMENTS]: {
		category: [
			// notificationCategory.BOOKINGS_UPLOADED_MATERIALS,
			// notificationCategory.BOOKINGS_REVIEW_MATERIALS,
		],
	},
}

export const NOTIFICATION_TYPE_LIST = [
	ENotificationType.JOBS,
	ENotificationType.BOOKINGS,
	ENotificationType.UPDATES,
	ENotificationType.PAYMENTS,
]