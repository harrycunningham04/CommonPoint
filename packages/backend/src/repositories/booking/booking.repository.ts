import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { Booking, Prisma, } from '@prisma/client'

@Injectable()
export class BookingRepository {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	public async findBooking(where: Prisma.BookingWhereInput,): Promise<Booking | null> {
		return this.prisma.booking.findFirst({
			where,
		},)
	}

	public async countBooking(where: Prisma.BookingWhereInput,): Promise<number> {
		return this.prisma.booking.count({
			where,
		},)
	}

	public async findBookings({where, select, orderBy,}:{where: Prisma.BookingWhereInput, select?: Prisma.BookingSelect, orderBy?: Prisma.BookingOrderByWithRelationInput,},): Promise<Array<Booking & {
		location: {
			latitude: number,
			longitude: number,
		} | null,
	}>> {
		return this.prisma.booking.findMany({
			where,
			select: {
				...select,
				location: true,
			},
			orderBy,
		},)
	}
}
