/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-underscore-dangle */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Booking,  BookingGroup,} from '@prisma/client'
import { BookingStatus, Prisma, } from '@prisma/client'
import { OrderValueLevel, } from './booking-group.types'
import { getOrderValueLevel, } from './booking-group.utils'
import type { BookingsList, IBookingWithAllInfo, } from './dto/booking-client-group.dto'
import { BookingClientGroupDto, } from './dto/booking-client-group.dto'
import {
	IncludeAllBookingInfo,
	SelectBookingSkills,
} from '../booking/booking.const'
import type { SkillDto, } from '../booking/dto'
import { BookingClientDetailsDto, } from '../booking/dto/booking-client-details.dto'
@Injectable()
export class BookingGroupService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getIsLowVolumeBrand(officeId: string,): Promise<boolean> {
		const averageVolume = await this.prisma.$queryRaw<
      Array<{ average_orders_per_month: number }>
    >(Prisma.sql`
    WITH date_range AS (
      SELECT generate_series(
          date_trunc('month', (SELECT MIN(created_at) FROM "BookingGroup" as bg WHERE bg.office_id = ${officeId}::UUID)),  -- Start from first order
          date_trunc('month', (SELECT MAX(created_at) FROM "BookingGroup" as bg WHERE bg.office_id = ${officeId}::UUID)),  -- End at last order
          INTERVAL '1 month'
      ) AS month
    ),
    monthly_counts AS (
        SELECT 
            date_trunc('month', created_at) AS month, 
            COUNT(*) AS order_count
        FROM "BookingGroup" as bg
        WHERE bg.office_id = ${officeId}::UUID
        GROUP BY month
    )
    SELECT ROUND(AVG(COALESCE(mc.order_count, 0)), 1) AS average_orders_per_month
    FROM date_range dr
    LEFT JOIN monthly_counts mc ON dr.month = mc.month;

      `,)

		if ((averageVolume[0]?.average_orders_per_month ?? 0) < 3.5) {
			return true
		}
		return false
	}

	public async getAverageOrderValue(
		id: string,
		isOffice: boolean,
	): Promise<number> {
		const averageOrderValue = await this.prisma.bookingGroup.aggregate({
			where: {
				...(isOffice ?
					{ officeId: id, } :
					{ b2CClientsId: id, }),
			},
			_avg: {
				sumOfPrices: true,
			},
		},)

		return averageOrderValue._avg.sumOfPrices ?? 0
	}

	public async getOrderValueLevel({id, isOffice, sumOfCurrentOrder,}:{id?: string, isOffice: boolean, sumOfCurrentOrder: number,},): Promise<OrderValueLevel> {
		if (!id) {
			return OrderValueLevel.LOW
		}

		const averageOrderValue = await this.getAverageOrderValue(id, isOffice,)

		return getOrderValueLevel(sumOfCurrentOrder, averageOrderValue,)
	}

	public async getBookingsForClient({
		where,
		include,
		skip,
		take,
		orderBy,
	}: {
    where: Prisma.BookingGroupWhereInput;
    include?: Prisma.BookingGroupInclude;
    skip?: number;
    take?: number;
    orderBy?: Prisma.BookingGroupOrderByWithAggregationInput;
  },): Promise<Array<IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>}>> {
		const bookingGroups = await this.prisma.bookingGroup.findMany({
			where: {
				...where,
				bookings: {
					some: {},
				},
			},
			include: {
				...include,
			},
			skip,
			take,
			orderBy,
		},)

		return BookingClientGroupDto.mergeBookingsFromGroups(bookingGroups as unknown as BookingsList,)
	}

	public async getBookingsForClientCount(
		where: Prisma.BookingGroupWhereInput,
	): Promise<number> {
		return this.prisma.bookingGroup.count({ where, },)
	}

	public async getUniqueSkillsFromGroup(
		bookingGroupId: string,
	): Promise<Array<SkillDto>> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where: {
				id: bookingGroupId,
			},
			include: {
				bookings: {
					include: {
						...SelectBookingSkills,
					},
				},
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		return BookingClientGroupDto.getUniqueSkillsFromGroup(bookingGroup,)
	}

	public async getBookingInfo(
		bookingGroupId: string,
	): Promise<IBookingWithAllInfo & { uniqueSkills: Array<SkillDto> }> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where: {
				id: bookingGroupId,
			},
			include: {
				bookings: {
					include: {
						...IncludeAllBookingInfo,
						BookingStageHistory: {
							orderBy: {
								timestamp: 'asc',
							},
						},
					},
				},
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		return BookingClientGroupDto.getBookingInfo(bookingGroup.bookings,)
	}

	public async getBookingMaterial(bookingGroupId: string,): Promise<{
    hasMaterial: boolean;
    heroShoot?: { id: string; isHeroShoot: boolean; url: string; name: string };
  }> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where: { id: bookingGroupId, },
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const bookingWithMaterial = await this.prisma.booking.findFirst({
			where: {
				bookingGroupId,
				booking_status: BookingStatus.DONE,
				editedMaterial: {
					some: {},
				},
			},
			select: {
				id:             true,
				editedMaterial: {
					where: {
						isHeroShoot: true,
					},
					take:   1,
					select: {
						id:          true,
						isHeroShoot: true,
						url:         true,
						name:        true,
					},
				},
			},
		},)

		const hasMaterial = Boolean(bookingWithMaterial,)

		const heroShoot = bookingWithMaterial?.editedMaterial?.[0] ?? undefined

		return {
			hasMaterial,
			heroShoot,
		}
	}

	public async updateBookingGroup(bookingGroupId: string, data: Prisma.BookingGroupUpdateInput,): Promise<BookingGroup> {
		return this.prisma.bookingGroup.update({
			where: { id: bookingGroupId, },
			data,
		},)
	}

	public async getBookingGroupsForInvoiceGeneration(startOfMonthDate: Date, endOfMonthDate: Date,): Promise<Array<BookingGroup>> {
		return this.prisma.bookingGroup.findMany({
			where: {
				isPaid:           false,
				clientInvoiceB2B: null,
				b2BClientsId:     {
					not: null,
				},
				createdAt: {
					gte: startOfMonthDate,
					lte: endOfMonthDate,
				},
			},
		},)
	}
}
