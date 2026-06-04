/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-await-in-loop */
import { Injectable, } from '@nestjs/common'
import type { Prisma,} from '@prisma/client'
import { ContractorSkillNama, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'

@Injectable()
export class DefaultContractorsService {
	constructor(private readonly prisma: PrismaService,) {}

	public async createDefaultContractors(): Promise<void> {
		const defaultContractors: Array<Prisma.ContractorCreateInput> = [
			{
				email:   'esoft@mail.com',
				name:    'Esoft',
				surname: '',
				onSite:  false,
			},
			{
				email:   'floorplan@mail.com',
				name:    'Contractor1',
				surname: '',
				onSite:  false,
			},
		]
		for (const contractor of defaultContractors) {
			const existingContractor = await this.prisma.contractor.findUnique({
				where: { email: contractor.email, },
			},)
			if (existingContractor) {
				continue
			}
			await this.prisma.contractor.create({ data: contractor, },)
		}
	}

	public async getDefaultContractorId(skill: ContractorSkillNama,) {
		const contractor = await this.getDefaultContractor(skill,)
		return contractor?.id ?? null
	}

	public async getDefaultContractor(skill: ContractorSkillNama,) {
		if (skill === ContractorSkillNama.PHOTO || skill === ContractorSkillNama.VIDEO) {
			const contractor = await this.prisma.contractor.findFirst({
				where: { email: 'esoft@mail.com', },
			},)
			return contractor
		}
		if (skill === ContractorSkillNama.FLOORPLAN || skill === ContractorSkillNama.LEASE_PLAN) {
			const contractor = await this.prisma.contractor.findFirst({
				where: { email: 'floorplan@mail.com', },
			},)
			return contractor
		}

		return null
	}
}
