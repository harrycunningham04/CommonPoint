import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { ForgotPasswordAdmin, ForgotPasswordClient, } from '@prisma/client'
import { Cron, CronExpression, } from '@nestjs/schedule'
import { EClientType, } from 'src/shared/types/client.type'

@Injectable()
export class ForgotPasswordAdminRepository {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async createForgotPasswordSessionByUserId(id: string,): Promise<ForgotPasswordAdmin> {
		return this.prismaService.forgotPasswordAdmin.upsert({
			where: {
				admin_id: id,
			},
			create: {
				admin: {
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

	public async createForgotPasswordSessionByClientId(id: string,clientType :EClientType,): Promise<ForgotPasswordClient | undefined> {
		if (clientType === EClientType.B2C) {
			return this.prismaService.forgotPasswordClient.upsert({
				where: {
					b2cClient_id: id,
				},
				create: {
					b2cClient: {
						connect: {
							id,
						},
					},
				},
				update: {
					updated_at: new Date(),
				},
			},)
		} else if (clientType === EClientType.B2B) {
			return this.prismaService.forgotPasswordClient.upsert({
				where: {
					b2bClient_id: id,
				},
				create: {
					b2bClient: {
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

		return undefined
	}

	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	public async findById(id: string,): Promise<ForgotPasswordAdmin | null> {
		return this.prismaService.forgotPasswordAdmin.findUnique({
			where: {
				id,
			},
		},)
	}

	public async findByIdClient(id: string,): Promise<ForgotPasswordClient | null> {
		return this.prismaService.forgotPasswordClient.findUnique({
			where: {
				id,
			},
		},)
	}

	public async deleteById(id: string,): Promise<ForgotPasswordAdmin> {
		return this.prismaService.forgotPasswordAdmin.delete({
			where: {
				id,
			},
		},)
	}

	public async deleteByIdClient(id: string,): Promise<ForgotPasswordClient> {
		return this.prismaService.forgotPasswordClient.delete({
			where: {
				id,
			},
		},)
	}

	private async cleanUp(): Promise<void> {
		const twentyFourHoursAgo = new Date()
		twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24,)

		await this.prismaService.forgotPasswordAdmin.deleteMany({
			where: {
				updated_at: {
					lt: twentyFourHoursAgo,
				},
			},
		},)
	}

	private async cleanUpClient(): Promise<void> {
		const twentyFourHoursAgo = new Date()
		twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24,)

		await this.prismaService.forgotPasswordClient.deleteMany({
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
		await this.cleanUpClient()
	}
}
