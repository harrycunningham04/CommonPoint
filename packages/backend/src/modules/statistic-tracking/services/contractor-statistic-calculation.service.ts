import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { ContractorSkillNama,} from '@prisma/client'
import { Prisma, StatisticType, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { DashboardItemDto, type DashboardDataDto, } from '../dtos/dashboard.dto'
import { canContractorHandleProduct, getSqlForAllMonths, getSqlForAllWeeks, getSqlStatisticType, } from '../utils'
import { averageBookingDurationQuery, averagePercentageQuery, contractorExpectedEarningsQuery, earningQuery,
	floorplanSlaQuery, multiplierConstant, onTimePercentageQuery, photoSlaQuery, sketchPercentageQuery, } from '../statistic-tracking.const'
import type { IStatisticAdminDashboard, IStatisticDashboard,} from '../types'
import type { ContractorScore, } from '../types'
import { AdminDashboardDto, } from '../dtos/adming-dashboard.dto'

@Injectable()
export class ContractorStatisticCalculationService {
	constructor(private readonly prisma: PrismaService,) {}

	public async calculateMobileDashboard(contractorId: string, isWeek: boolean,): Promise<Array<IStatisticDashboard>> {
		const interval = isWeek ?
			Prisma.sql`INTERVAL '1 week'` :
			Prisma.sql`INTERVAL '1 month'`

		const result = await this.prisma.$queryRaw<Array<IStatisticDashboard>>(Prisma.sql`
			-- Constants for calculations
			${multiplierConstant}

			SELECT 
				p.time_period,
				${onTimePercentageQuery},
				
					-- Calculate average booking rating
					ROUND(
							SUM(
									CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_REVIEW_RATING,)} 
									THEN CAST(NULLIF(s.payload->>'rating', '') AS NUMERIC) 
									ELSE 0 END
							) / NULLIF(
									SUM(
											CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_REVIEW_RATING,)} 
											THEN 1 
											ELSE 0 END
									), 0
							), 1
					) AS average_booking_rating,

					-- Calculate booking rating count
					SUM(
						CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_REVIEW_RATING,)} 
						THEN 1 
						ELSE 0 END
					)::NUMERIC AS booking_rating_count,

					-- Calculate average booking duration
					${averageBookingDurationQuery},

					-- Calculate total earnings from contractor invoices
					${earningQuery},

					-- Booking floorplan sla (100 - failed accuracy points)
					${floorplanSlaQuery},

					-- Calculate contractor expected earnings
					${contractorExpectedEarningsQuery}

			FROM (
				VALUES ${isWeek ?
		getSqlForAllWeeks() :
		getSqlForAllMonths()}
				) AS p(time_period, start_date)				
			LEFT JOIN statistic s ON s.contractor_id = ${contractorId}::UUID
			AND s.type IN (
				${getSqlStatisticType(StatisticType.BOOKING_RUNNING_ON_TIME,)}, 
				${getSqlStatisticType(StatisticType.BOOKING_RUNNING_LATE,)}, 
				${getSqlStatisticType(StatisticType.BOOKING_REVIEW_RATING,)}, 
				${getSqlStatisticType(StatisticType.CONTRACTOR_INVOICE_CREATED,)},
				${getSqlStatisticType(StatisticType.COMPLETED_BOOKING_DURATION,)},
				${getSqlStatisticType(StatisticType.CONTRACTOR_EXPECTED_EARNING,)}
			)
			AND s.created_at >= p.start_date 
			AND s.created_at < p.start_date + ${interval}
			GROUP BY p.time_period
			ORDER BY p.time_period ASC;
			`,)

		return result
	}

	public async calculateDashboardDataForContractor(contractorId: string,): Promise<DashboardDataDto> {
		const monthsResult = await this.calculateMobileDashboard(contractorId, false,)
		const weeksResult = await this.calculateMobileDashboard(contractorId, true,)

		return {
			week:  weeksResult.slice(0, -1,).map((item, index,) => {
				return DashboardItemDto.cast(item, Number(weeksResult[index + 1]?.earning ?? 0,), true,)
			},),
			month: monthsResult.slice(0, -1,).map((item, index,) => {
				return DashboardItemDto.cast(item, Number(monthsResult[index + 1]?.earning ?? 0,), false,)
			},),
		}
	}

	public async calculateAdminDashboard(contractorId: string,): Promise<AdminDashboardDto | undefined> {
		const earning = await this.prisma.$queryRaw<Array<IStatisticAdminDashboard>>(Prisma.sql`
			-- Constants for calculations
			${multiplierConstant},
			date_range AS (
					-- Get the first and last booking dates
					SELECT 
							MIN(s.created_at) AS first_booking_date, 
							MAX(s.created_at) AS last_booking_date
					FROM statistic AS s
					WHERE s.contractor_id = ${contractorId}::UUID AND s.type = ${getSqlStatisticType(StatisticType.BOOKING_DONE,)}
			),
			weeks_count AS (
					-- Calculate the total number of weeks between first and last booking
					SELECT 
							GREATEST(1, DATE_PART('week', last_booking_date) - DATE_PART('week', first_booking_date) + 1) AS total_weeks
					FROM date_range
			)

			-- Main query to calculate contractor statistics
			SELECT 
					-- Calculate total earnings from contractor invoices
					${earningQuery},

					-- Calculate on-time percentage (placeholder for actual logic)
					${onTimePercentageQuery},

					-- Calculate average booking duration
					${averageBookingDurationQuery},

					-- Booking floorplan sla (100 - failed accuracy points)
					${floorplanSlaQuery},

					-- Calculate total photo count
					SUM(
							CASE WHEN type = ${getSqlStatisticType(StatisticType.COMPLETED_BOOKING_PHOTO_COUNT,)} 
							THEN CAST(NULLIF(s.payload->>'photo_count', '') AS NUMERIC) 
							ELSE 0 END
					) AS total_photo_count,

					-- Calculate sketch percentage
					${sketchPercentageQuery},

					-- Average bookings count per week
					ROUND(
							SUM(
									CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_DONE,)} 
									THEN 1 
									ELSE 0 END
							) / NULLIF((SELECT total_weeks FROM weeks_count)::NUMERIC, 0), 1
					) AS average_bookings_per_week,

					-- Booking count
					SUM(
									CASE WHEN type = ${getSqlStatisticType(StatisticType.BOOKING_DONE,)} 
									THEN 1 
									ELSE 0 END
							)::NUMERIC AS booking_count,

					-- Booking photo sla
					${photoSlaQuery}

			FROM statistic AS s
			WHERE s.contractor_id = ${contractorId}::UUID
			AND s.type IN (
				${getSqlStatisticType(StatisticType.BOOKING_RUNNING_ON_TIME,)}, 
				${getSqlStatisticType(StatisticType.BOOKING_RUNNING_LATE,)}, 
				${getSqlStatisticType(StatisticType.CONTRACTOR_INVOICE_CREATED,)},
				${getSqlStatisticType(StatisticType.COMPLETED_BOOKING_DURATION,)},
				${getSqlStatisticType(StatisticType.COMPLETED_BOOKING_PHOTO_COUNT,)},
				${getSqlStatisticType(StatisticType.BOOKING_DONE_WITH_FLOORPLAN,)},
				${getSqlStatisticType(StatisticType.BOOKING_DONE_WITHOUT_FLOORPLAN,)},
				${getSqlStatisticType(StatisticType.BOOKING_DONE,)},
				${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA,)},
				${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA_FAILED,)},
				${getSqlStatisticType(StatisticType.BOOKING_FOORPLAN_ACCURACY,)}
			)
			;
		`,)

		if (earning.length === 0) {
			return undefined
		}
		const result = earning.at(0,)
		if (!result) {
			return undefined
		}
		return AdminDashboardDto.cast(result,)
	}

	public async getRelevantContractorIds({
		scores,
		skip,
		take,
		skillName,
		regionId,
		productTypeIds,
	}:{
		scores: Array<ContractorScore>,
		skip: number,
		take: number,
		skillName: Array<ContractorSkillNama>,
		regionId: string | null,
		productTypeIds: Array<string>,
	},): Promise<Array<string>> {
		const searchedSkill = await this.prisma.skills.findMany({
			where: {
				name: {
					in: skillName,
				},
			},
		},)

		if (searchedSkill.length === 0) {
			throw new HttpException('Skills not found', HttpStatus.NOT_FOUND,)
		}

		const skillIdsString = Prisma.join(searchedSkill.map((item,) => {
			return Prisma.sql`${item.id}::UUID`
		},), ',',)

		const HighPoint = 85
		const RegularPoint = 65
		const validContractorIds = await this.prisma.$queryRaw<Array<{
			contractor_id: string,
			average_percentage: number,
		}>>(Prisma.sql`

			-- Constants for calculations
			${multiplierConstant},

			stats AS (
				SELECT
					s.contractor_id as contractor_id,
						
					-- Calculate on-time percentage (placeholder for actual logic)
					${onTimePercentageQuery},

					-- Booking floorplan sla (100 - failed accuracy points)
					${floorplanSlaQuery},


					-- Calculate sketch percentage
					${sketchPercentageQuery},

					-- Calculate photo sla
					${photoSlaQuery}

				FROM statistic AS s
				WHERE s.type IN (
					${getSqlStatisticType(StatisticType.BOOKING_RUNNING_ON_TIME,)}, 
					${getSqlStatisticType(StatisticType.BOOKING_RUNNING_LATE,)}, 
					${getSqlStatisticType(StatisticType.BOOKING_DONE_WITH_FLOORPLAN,)},
					${getSqlStatisticType(StatisticType.BOOKING_DONE_WITHOUT_FLOORPLAN,)},
					${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA,)},
					${getSqlStatisticType(StatisticType.BOOKING_PHOTO_SLA_FAILED,)},
					${getSqlStatisticType(StatisticType.BOOKING_FOORPLAN_ACCURACY,)}
				)
				GROUP BY s.contractor_id
				ORDER BY s.contractor_id ASC
			),
			average_percentage_query AS (
				SELECT 
					contractor_id,
					${averagePercentageQuery} AS average_percentage
				FROM stats
			)
			SELECT c.id as contractor_id, 
				-- Assign sorting priority dynamically based on the scores array
				CASE 
        WHEN CASE 
            WHEN average_percentage >= ${HighPoint} THEN 'HIGH'
            WHEN average_percentage >= ${RegularPoint} THEN 'REGULAR'
            ELSE 'LOW'
          END = ${scores[0]}::TEXT THEN 1
        WHEN CASE 
            WHEN average_percentage >= ${HighPoint} THEN 'HIGH'
            WHEN average_percentage >= ${RegularPoint} THEN 'REGULAR'
            ELSE 'LOW'
          END = ${scores[1]}::TEXT THEN 2
        WHEN CASE 
            WHEN average_percentage >= ${HighPoint} THEN 'HIGH'
            WHEN average_percentage >= ${RegularPoint} THEN 'REGULAR'
            ELSE 'LOW'
          END = ${scores[2]}::TEXT THEN 3
        ELSE 4 -- Fallback case
      END AS order_index
			FROM average_percentage_query
			FULL JOIN contractor c ON c.id = average_percentage_query.contractor_id
			
			WHERE c.archived = false AND c."onSite" = true AND 
				EXISTS (
					SELECT 1 FROM contractor_skills cs2
					WHERE cs2.skill_id IN (${skillIdsString}) AND cs2.contractor_id = c.id AND cs2.confirmed = true
					GROUP BY cs2.contractor_id
					HAVING COUNT(DISTINCT cs2.skill_id) = ${searchedSkill.length}
				
			)
			AND EXISTS (
				SELECT 1 FROM "ContractorRegion"
				WHERE "regionId" = ${regionId}::UUID AND "contractorId" = c.id
			)
			ORDER BY order_index, average_percentage DESC
			OFFSET ${skip} ROWS FETCH NEXT ${take} ROWS ONLY
		`,)
		console.log(validContractorIds, 'validContractorIds',)
		const contractorIds = validContractorIds.map((item,) => {
			return item.contractor_id
		},)

		const contractors = await this.prisma.contractor.findMany({
			where:  { id: { in: contractorIds, }, },
			select: { id: true, mark: true, },
		},)

		const productTypes = await this.prisma.productType.findMany({
			where:  { id: { in: productTypeIds, }, },
			select: { mark: true, },
		},)

		const productMarks = productTypes.map((pt,) => {
			return pt.mark
		},)
		const relevant = contractors.filter((contractor,) => {
			return productMarks.every((pMark,) => {
				return canContractorHandleProduct(contractor.mark, pMark,)
			},
			)
		},
		)

		return relevant.map((c,) => {
			return c.id
		},)
	}
}
