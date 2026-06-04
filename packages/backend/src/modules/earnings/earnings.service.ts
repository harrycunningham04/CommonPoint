/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { UpdateRatesDto, } from './dto/update-rates.dto'
import { ContractorService, } from '../contractor/services/contractor.service'
import type { FilterDto, } from '../contractor/dto/get-contractors.dto'
import type { Prisma, } from '@prisma/client'
import type { UpdateRateDto, } from './dto/update-rate.dto'

@Injectable()
export class EarningsService {
	constructor(
        private readonly prisma: PrismaService,
        private readonly contractorService: ContractorService,
	) {}

	public async upsertDefaultEarningRate(dto: UpdateRateDto,) {
		return this.prisma.earningRate.upsert({
			where: {
				defaultRateProductTypeId: dto.productTypeId,
			},
			update: {
				earningRate:     dto.earningRate,
				rateType:        dto.rateType,
				additionalPrice: dto.additionalPrice,
			},
			create: {
				earningRate:              dto.earningRate,
				rateType:                 dto.rateType,
				defaultRateProductTypeId: dto.productTypeId,
				additionalPrice:          dto.additionalPrice,
			},
		},)
	}

	public async updateEarningRatesByFilter(
		updateDto: UpdateRatesDto,
		filters: FilterDto,
	) {
		const contractorsWhere =
            this.contractorService.getContractorFilterWhere(filters,)

		const contractors = await this.prisma.contractor.findMany({
			where:  contractorsWhere,
			select: {
				id:           true,
				earningRates: {
					where: {
						individualRateProductTypeId: {
							in: updateDto.ratesUpdates.map(
								(r,) => r.productTypeId,
							),
						},
					},
				},
			},
		},)

		for (const contractor of contractors) {
			for (const update of updateDto.ratesUpdates) {
				this.prisma.earningRate.upsert({
					where: {
						individualRateProductTypeId_contractorId: {
							individualRateProductTypeId: update.productTypeId,
							contractorId:                contractor.id,
						},
					},
					create: {
						contractorId: contractor.id,
						...update,
					},
					update: {
						...update,
					},
				},)
			}
		}
	}

	public async createDefaultEarningRateForProductType(productTypeId: string,) {
		return this.prisma.earningRate.create({
			data: {
				defaultRateProductTypeId: productTypeId,
			},
		},)
	}

	public getDefaultEarningsWhere(): Prisma.EarningRateWhereInput {
		return {

		}
	}
}
