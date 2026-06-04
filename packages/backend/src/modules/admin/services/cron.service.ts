import { Injectable, Logger, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import * as cron from 'node-cron'

@Injectable()
export class CronService {
	private readonly logger = new Logger(CronService.name,)

	constructor(private readonly prisma: PrismaService,) {
		this.scheduleAdminDeletion()
	}

	private scheduleAdminDeletion(): void {
		cron.schedule('0 0 * * *', async() => {
			this.logger.log('Running scheduled admin deletion task',)
			const sixMonthsAgo = new Date()
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6,)

			await this.prisma.admin.deleteMany({
				where: {
					archived:   true,
					archivedAt: {
						lt: sixMonthsAgo,
					},
				},
			},)

			this.logger.log('Scheduled admin deletion task completed',)
		},)
	}
}
