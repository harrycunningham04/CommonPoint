import { WidgetSize, WidgetType, } from '@prisma/client'

export const WIDGETS = [
	{ name: WidgetType.WEATHER, type: WidgetSize.SMALL, position: 1,},
	{ name: WidgetType.BOOKINGS_ORDERS, type: WidgetSize.SMALL, position: 2, },
	{ name: WidgetType.CALENDAR, type: WidgetSize.BIG, position: 1, },
	{ name: WidgetType.MAP, type: WidgetSize.BIG, position: 2, },
	{ name: WidgetType.CONTRACTORS, type: WidgetSize.BIG,  position: 3,},
	{ name: WidgetType.ADMINS, type: WidgetSize.BIG, position: 4, },
	{ name: WidgetType.CLIENTS, type: WidgetSize.BIG,  position: 5,},
	{ name: WidgetType.DISPUTES, type: WidgetSize.SMALL, position: 3, },
	{ name: WidgetType.NOTIFICATIONS, type: WidgetSize.SMALL, position: 5, },
	{ name: WidgetType.STATISTICS, type: WidgetSize.BIG, position: 7, },
	{ name: WidgetType.PRODUCTS, type: WidgetSize.SMALL, position: 4, },
	{ name: WidgetType.TRAININGS, type: WidgetSize.BIG,  position: 6,},
]