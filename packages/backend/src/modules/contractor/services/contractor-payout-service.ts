import { PrismaService, } from 'nestjs-prisma'
import { Injectable, NotFoundException, } from '@nestjs/common'
import { ContractorPayoutDto,} from '../dto/contractor-payout.dto'
import type { CreateContractorPayoutDto, } from '../dto/contractor-payout.dto'
import { ContractorPayoutStatus, type ContractorPayout, } from '@prisma/client'

@Injectable()
export class ContractorPayoutService {
	constructor(private readonly prisma: PrismaService,) {}

	public async createContractorPayout(dto: CreateContractorPayoutDto,): Promise<void> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id: dto.contractorId,
			},
		},)

		if (!contractor) {
			throw new NotFoundException('Contractor not found',)
		}

		await this.prisma.contractorPayout.create({
			data: {
				contractorId: dto.contractorId,
				amount:       dto.amount,
				transferId:   dto.transferId,
			},
		},)
	}

	public async getContractorsPendingPayouts(): Promise<Array<ContractorPayoutDto >> {
		const pendingPayouts = await this.prisma.contractorPayout.findMany({
			where: {
				status: ContractorPayoutStatus.PENDING,
			},
			include: {
				contractor: {
					select: {
						id:       true,
						stripeId: true,
					},
				},
			},
		},)

		return pendingPayouts.map((payout,) => {
			return new ContractorPayoutDto({
				id:                 payout.id,
				contractorId:       payout.contractorId,
				amount:             payout.amount,
				transferId:         payout.transferId,
				contractorStripeId: payout.contractor.stripeId ?? '',
			},)
		},)
	}

	public async markPayoutAsPaid(payoutId: string,): Promise<void> {
		await this.prisma.contractorPayout.update({
			where: {
				id: payoutId,
			},
			data: {
				status: ContractorPayoutStatus.PAID,
			},
		},)
	}
}