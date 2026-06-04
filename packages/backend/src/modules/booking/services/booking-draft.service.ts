import { Injectable, NotFoundException, } from '@nestjs/common'
import type { DraftBooking, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import type { IDraftBooking, } from 'src/shared/types/booking.types'
@Injectable()
export class BookingDraftService {
	constructor(private readonly prisma: PrismaService,) {}

	public async createDraftBooking(data: IDraftBooking,): Promise<DraftBooking> {
		return this.prisma.draftBooking.create({
			data: { info: JSON.stringify(data,), },
		},)
	}

	public async getDraftBooking(id: string,): Promise<IDraftBooking | undefined> {
		const draftBooking = await this.prisma.draftBooking.findUnique({
			where: { id, },
		},)

		if (!draftBooking) {
			throw new NotFoundException('Draft booking not found',)
		}

		return JSON.parse(draftBooking.info as string,) as IDraftBooking
	}

	public async updateDraftBooking(bookingDraftId: string, data: IDraftBooking,): Promise<void> {
		await this.prisma.draftBooking.update({
			where: {
				id: bookingDraftId,
			},
			data: {
				info: JSON.stringify(data,),
			},
		},)
	}
}
