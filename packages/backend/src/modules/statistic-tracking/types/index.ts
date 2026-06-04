/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Statistic, } from '@prisma/client'

export interface IStatistic extends Statistic {
}

export interface IStatisticDashboard {
	time_period: string
	on_time_percentage: string | null
	average_booking_rating: string | null
	booking_rating_count: string | null
	average_booking_duration: string | null
	booking_floorplan_sla: string | null
	earning: string | null
	contractor_expected_earnings: string | null
}

export interface IStatisticAdminDashboard {
	earning: string | null
	on_time_percentage: string | null
	average_booking_duration: string | null
	booking_floorplan_sla: string | null
	total_photo_count: string | null
	sketch_percentage: string | null
	average_bookings_per_week: string | null
	booking_count: string | null
	booking_photo_sla: string | null
}

export enum ContractorScore {
	HIGH = 'HIGH',
	REGULAR = 'REGULAR',
	LOW = 'LOW',
}
