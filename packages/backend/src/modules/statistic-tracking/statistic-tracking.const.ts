import { Prisma, StatisticType, } from '@prisma/client'
import { getSqlStatisticType, } from './utils'

export const onTimePercentageQuery = Prisma.sql`
ROUND(
  COALESCE(
    SUM(CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_RUNNING_ON_TIME,)} THEN 1 ELSE 0 END) * (SELECT percentage_multiplier FROM constants) /
    NULLIF(SUM(CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_RUNNING_ON_TIME,)} OR type = ${getSqlStatisticType(StatisticType.BOOKING_RUNNING_LATE,)} THEN 1 ELSE 0 END),
    0), 0), 1
  ) AS on_time_percentage
`

export const earningQuery = Prisma.sql`
SUM(
  CASE WHEN s.type = ${getSqlStatisticType(StatisticType.CONTRACTOR_INVOICE_CREATED,)} 
  THEN CAST(NULLIF(s.payload->>'amount', '') AS NUMERIC) 
  ELSE 0 END
) AS earning
`

export const contractorExpectedEarningsQuery = Prisma.sql`
SUM(
  CASE WHEN s.type = ${getSqlStatisticType(StatisticType.CONTRACTOR_EXPECTED_EARNING,)} 
  THEN CAST(NULLIF(s.payload->>'earning', '') AS NUMERIC) 
  ELSE 0 END
) AS contractor_expected_earnings
`

export const averageBookingDurationQuery = Prisma.sql`
ROUND(
							SUM(
									CASE WHEN type = ${getSqlStatisticType(StatisticType.COMPLETED_BOOKING_DURATION,)} 
									THEN CAST(NULLIF(s.payload->>'duration', '') AS NUMERIC) 
									ELSE 0 END
							) / NULLIF(
									SUM(
											CASE WHEN type = ${getSqlStatisticType(StatisticType.COMPLETED_BOOKING_DURATION,)} 
											THEN 1 
											ELSE 0 END
									), 0
							), 1
					) AS average_booking_duration
`

export const floorplanSlaQuery = Prisma.sql`
					100 - ROUND(
							SUM(
									CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_FOORPLAN_ACCURACY,)} 
									THEN CAST(NULLIF(s.payload->>'failedAccuracyPoints', '') AS NUMERIC) 
									ELSE 0 END
							) * (SELECT percentage_multiplier FROM constants) / COALESCE(
											NULLIF(
													SUM(
															CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_FOORPLAN_ACCURACY,)} 
															THEN CAST(NULLIF(s.payload->>'accuracyPoints', '') AS NUMERIC)  
															ELSE 0 END
													), 0
											), 1
									), 1
					) AS booking_floorplan_sla
`

export const sketchPercentageQuery = Prisma.sql`ROUND(
	SUM(
			CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_DONE_WITH_FLOORPLAN,)} 
			THEN 1 
			ELSE 0 END
	) * (SELECT percentage_multiplier FROM constants) / NULLIF(
			SUM(
					CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_DONE_WITH_FLOORPLAN,)} 
					OR type = ${getSqlStatisticType(StatisticType.BOOKING_DONE_WITHOUT_FLOORPLAN,)} 
					THEN 1 
					ELSE 0 END
			), 0
	), 1
) AS sketch_percentage
`

export const photoSlaQuery = Prisma.sql`
						ROUND(
							SUM(
									CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA,)} 
									THEN 1
									ELSE 0 END
							) * (SELECT percentage_multiplier FROM constants) / NULLIF(
											SUM(
													CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA,)}  
													OR type = ${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA_FAILED,)}
													THEN 1
													ELSE 0 END
											), 0
									), 1
					) AS booking_photo_sla
`

export const multiplierConstant = Prisma.sql`
WITH constants AS (
						SELECT 100.0 AS percentage_multiplier
			)
`

export const averagePercentageQuery = Prisma.sql`
ROUND(
			(
				CASE WHEN on_time_percentage IS NOT NULL 
					THEN on_time_percentage 
					ELSE (SELECT percentage_multiplier FROM constants) END 
					+
        CASE WHEN booking_floorplan_sla IS NOT NULL 
					THEN booking_floorplan_sla 
					ELSE (SELECT percentage_multiplier FROM constants) END +
        CASE WHEN sketch_percentage IS NOT NULL 
					THEN sketch_percentage 
					ELSE (SELECT percentage_multiplier FROM constants) END +
        CASE WHEN booking_photo_sla IS NOT NULL 
					THEN booking_photo_sla 
					ELSE (SELECT percentage_multiplier FROM constants) END
			) 
		/ 4, 
	1
)
`
