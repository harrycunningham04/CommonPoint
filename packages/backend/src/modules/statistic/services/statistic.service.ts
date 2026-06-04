import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'

@Injectable()
export class StatisticService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getAllTopClients() {
		const topB2CClients = await this.prisma.b2CClients.findMany({
			include: {
				_count: {
					select: { Booking: true, },
				},
			},
			orderBy: {
				Booking: {
					_count: 'desc',
				},
			},
		},)

		const topB2BClients = await this.prisma.b2BClients.findMany({
			include: {
				_count: {
					select: { Booking: true, },
				},
			},
			orderBy: {
				Booking: {
					_count: 'desc',
				},
			},
		},)

		const topClients = [...topB2CClients, ...topB2BClients,]

		topClients.sort((a, b,) => {
			return b._count.Booking - a._count.Booking
		},)
		return topClients
	}

	public async getAllTopContractors() {
		const topContractors = await this.prisma.contractor.findMany({
			include: {
				_count: {
					select: { Booking: true, },
				},
			},
			orderBy: {
				Booking: {
					_count: 'desc',
				},
			},
		},)

		return topContractors
	}
}
