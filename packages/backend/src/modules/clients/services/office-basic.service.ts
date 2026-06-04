import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'

@Injectable()
export class OfficeBasicService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getOfficeBasic(officeId: string,): Promise<{
		id: string
		title: string
		address: string
		workersCount: number
	}> {
		const office = await this.prisma.office.findUnique({
			where: {
				id: officeId,
			},
			select: {
				id:      true,
				title:   true,
				address: true,
			},
		},)

		if (!office) {
			throw new NotFoundException('Office not found')
		}

		const workersCount = await this.prisma.workerOnOffice.count({
			where: {
				office: {
					id: officeId,
				},
			},
		},)

		return {
			id:      office.id,
			title:   office.title,
			address: office.address,
			workersCount,
		}
	}
}
