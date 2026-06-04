import { Injectable, } from '@nestjs/common'
import type { CreateCancellationDto, } from './dto/create-cancellation.dto'
import { PrismaService, } from 'nestjs-prisma'

@Injectable()
export class CancellationService {
	constructor(private readonly prisma: PrismaService,) {}

	public async createOrUpdateCancellation(cancellation: CreateCancellationDto,): Promise<CreateCancellationDto> {
		const { id, bookingId, ...rest } = cancellation

		const data = {
			...rest,
			Booking: {
				connect: {
					id: bookingId,
				},
			},
		}

		if (id) {
			return this.prisma.cancellaton.upsert({
				where: {
					id,
				},
				create: data,
				update: data,
			},)
		}

		return this.prisma.cancellaton.create({ data, },)
	}
}
