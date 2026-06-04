import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { AllContractorInfoResDto, } from '../dto/all-contractor-info.dto'
import { SkillsAndCertificationsResDto, } from '../dto/skills-and-certifications.dto'
import {
	AdjustmentFeeStatus,
	AdjustmentFeeType,
	type AdjustmentFee,
	type Contractor,
	type ContractorLocation,
	type ContractorTransportation,
	type PaymentType,
	type Prisma,
} from '@prisma/client'

@Injectable()
export class BasicContractorService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getAllContractorInfo(
		userId: string,
	): Promise<AllContractorInfoResDto> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id: userId,
			},
			include: {
				ContractorLocation: {
					select: {
						placeId:   true,
						latitude:  true,
						longitude: true,
					},
				},
				skills: {
					select: {
						skill: {
							select: {
								id:   true,
								name: true,
							},
						},
					},
				},
				SpecificDocuments: true,

				regions: {
					select: {
						isHome: true,
						region: {
							select: {
								id:   true,
								name: true,
							},
						},
					},
				},
			},
		},)

		if (!contractor) {
			throw new NotFoundException('Contractor not found',)
		}

		return AllContractorInfoResDto.cast(contractor,)
	}

	public async getSkillsAndCertifications(
		userId: string,
	): Promise<SkillsAndCertificationsResDto> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id: userId,
			},
			include: {
				skills: {
					select: {
						skill: {
							select: {
								id:   true,
								name: true,
							},
						},
					},
				},
				SpecificDocuments: true,
			},
		},)
		return SkillsAndCertificationsResDto.cast(contractor,)
	}

	public async getContractor(
		where: Prisma.ContractorWhereUniqueInput,
		select: Prisma.ContractorSelect,
	): Promise<Contractor | null> {
		return this.prisma.contractor.findUnique({
			where,
			select,
		},)
	}

	public async getContractors({
		where,
		skip,
		take,
		select,
	}: {
    where: Prisma.ContractorWhereInput;
    skip: number;
    take: number;
    select: Prisma.ContractorSelect;
  },): Promise<Array<Contractor>> {
		return this.prisma.contractor.findMany({
			where,
			skip,
			take,
			select,
			orderBy: {
				created_at: 'desc',
			},
		},)
	}

	public async getCount(where: Prisma.ContractorWhereInput,): Promise<number> {
		return this.prisma.contractor.count({
			where,
		},)
	}

	public async getContractorLocations(contractorIds: Array<string>,): Promise<
    Array<{
      contractorId: string;
      location: ContractorLocation | null;
    }>
  > {
		const contractorLocations = await this.prisma.contractor.findMany({
			where: {
				id: {
					in: contractorIds,
				},
			},
			select: {
				id:                 true,
				ContractorLocation: true,
			},
		},)

		return contractorLocations.map((contractor,) => {
			return {
				contractorId: contractor.id,
				location:     contractor.ContractorLocation,
			}
		},)
	}

	public async getContractorTransportation(
		contractorIds: Array<string>,
	): Promise<Map<string, ContractorTransportation>> {
		const contractorTransportation = await this.prisma.contractor.findMany({
			where: {
				id: {
					in: contractorIds,
				},
			},
			select: {
				id:             true,
				transportation: true,
			},
		},)

		return contractorTransportation.reduce((acc, contractor,) => {
			acc.set(contractor.id, contractor.transportation,)
			return acc
		}, new Map<string, ContractorTransportation>(),)
	}

	public async getContractorsPay(
		startDate: Date,
		endDate: Date,
	): Promise<
    Array<{
      stripeId: string;
      id: string;
      paymentType: PaymentType;
      fullName: string;
    }>
  > {
		const contractors = await this.prisma.contractor.findMany({
			where: {
				stripeId: {
					not: null,
				},
				OR: [
					{
						Booking: {
							some: {
								bookingCompletedAt: {
									gte: startDate,
									lte: endDate,
								},
							},
						},
					},
					{
						additionalProductType: {
							some: {
								productType: {
									BookingToProductType: {
										some: {
											booking: {
												bookingCompletedAt: {
													gte: startDate,
													lte: endDate,
												},
											},
										},
									},
								},
							},
						},
					},
				],
			},
			select: {
				id:          true,
				stripeId:    true,
				paymentType: true,
				name:        true,
				surname:     true,
			},
		},)

		return contractors.map((contractor,) => {
			return {
				stripeId:    contractor.stripeId ?? '',
				id:          contractor.id,
				paymentType: contractor.paymentType,
				fullName:    `${contractor.name} ${contractor.surname}`,
			}
		},)
	}

	public async getContractorAdjustmentFeesPrice(contractorId: string,): Promise<{
    ids: Array<string>;
    bonus: number;
    penalty: number;
  }> {
		const adjustmentFees = await this.prisma.adjustmentFee.findMany({
			where: {
				contractorId,
				status: AdjustmentFeeStatus.PENDING,
			},
			select: {
				id:     true,
				amount: true,
				type:   true,
			},
		},)

		const result = adjustmentFees.reduce<{
      ids: Array<string>;
      bonus: number;
      penalty: number;
    }>(
    	(acc, fee,) => {
    		acc.ids.push(fee.id,)

    		if (fee.type === AdjustmentFeeType.BONUS) {
    			acc.bonus = acc.bonus + fee.amount
    		} else {
    			acc.penalty = acc.penalty + fee.amount
    		}

    		return acc
    },
    	{
    		ids:     [],
    		bonus:   0,
    		penalty: 0,
    	},
    )

		return result
	}

	public async updateManyAdjustmentFeesStatus(
		ids: Array<string>,
	): Promise<void> {
		await this.prisma.adjustmentFee.updateMany({
			where: {
				id: { in: ids, },
			},
			data: {
				status: AdjustmentFeeStatus.PAID,
			},
		},)
	}
}
