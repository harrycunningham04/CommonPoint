import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { ForgotPasswordContractor, } from '@prisma/client'
import { Cron, CronExpression, } from '@nestjs/schedule'

@Injectable()
export class ForgotPasswordRepository {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async createForgotPasswordSessionByUserId(id: string,): Promise<ForgotPasswordContractor> {
		return this.prismaService.forgotPasswordContractor.upsert({
			where: {
				contractor_id: id,
			},
			create: {
				contractor: {
					connect: {
						id,
					},
				},
			},
			update: {
				updated_at: new Date(),
			},
		},)
	}

	public async findById(id: string,): Promise<ForgotPasswordContractor | null> {
		return this.prismaService.forgotPasswordContractor.findUnique({
			where: {
				id,
			},
		},)
	}

	public async deleteById(id: string,): Promise<ForgotPasswordContractor> {
		return this.prismaService.forgotPasswordContractor.delete({
			where: {
				id,
			},
		},)
	}

	private async cleanUp(): Promise<void> {
		const twentyFourHoursAgo = new Date()
		twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24,)

		await this.prismaService.forgotPasswordContractor.deleteMany({
			where: {
				updated_at: {
					lt: twentyFourHoursAgo,
				},
			},
		},)
	}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT,)
	public async handleCron(): Promise<void> {
		await this.cleanUp()
	}
}
