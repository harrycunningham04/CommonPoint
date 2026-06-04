import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { ContractorSkillNama, } from '@prisma/client'
import type { CreateContractorSkillDto, UpdateContractorSkillDto, GetContractorSkillsQueryDto,} from '../dto/admin-contractor-skills.dto'
import { ContractorSkillResponseDto, } from '../dto/admin-contractor-skills.dto'

@Injectable()
export class AdminContractorSkillsService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getContractorSkills(query?: GetContractorSkillsQueryDto,): Promise<Array<ContractorSkillResponseDto>> {
		const where: any = {}

		if (query?.confirmed !== undefined) {
			where.confirmed = query.confirmed
		}

		if (query?.skillName) {
			where.skill = {
				name: query.skillName,
			}
		}

		const contractorSkills = await this.prisma.contractorSkills.findMany({
			where,
			include: {
				skill:      true,
				contractor: {
					select: {
						id:      true,
						name:    true,
						surname: true,
					},
				},
			},
		},)

		return contractorSkills.map((contractorSkill,) => {
			return ContractorSkillResponseDto.cast(contractorSkill,)
		},)
	}

	public async getContractorSkillsByContractorId(contractorId: string,): Promise<Array<ContractorSkillResponseDto>> {
		const contractorSkills = await this.prisma.contractorSkills.findMany({
			where: {
				contractor_id: contractorId,
			},
			include: {
				skill: true,
			},
		},)

		return contractorSkills.map((contractorSkill,) => {
			return ContractorSkillResponseDto.cast(contractorSkill,)
		},)
	}

	public async createContractorSkill(data: CreateContractorSkillDto,): Promise<ContractorSkillResponseDto> {
		// check if contractor exists
		const contractor = await this.prisma.contractor.findUnique({
			where: { id: data.contractorId, },
		},)

		if (!contractor) {
			throw new NotFoundException('Contractor not found',)
		}

		// find or create skill
		let skill = await this.prisma.skills.findFirst({
			where: { name: data.skillName, },
		},)

		if (!skill) {
			skill = await this.prisma.skills.create({
				data: { name: data.skillName, icon: '', },
			},)
		}

		// check if contractor already has this skill
		const existingSkill = await this.prisma.contractorSkills.findUnique({
			where: {
				contractor_id_skill_id: {
					contractor_id: data.contractorId,
					skill_id:      skill.id,
				},
			},
		},)

		if (existingSkill) {
			throw new Error('Contractor already has this skill',)
		}

		// create contractor skill
		const contractorSkill = await this.prisma.contractorSkills.create({
			data: {
				contractor_id: data.contractorId,
				skill_id:      skill.id,
				confirmed:     data.confirmed ?? true,
			},
			include: {
				skill: true,
			},
		},)

		return ContractorSkillResponseDto.cast(contractorSkill,)
	}

	public async updateContractorSkill(contractorId: string, skillId: string, data: UpdateContractorSkillDto,): Promise<ContractorSkillResponseDto> {
		const contractorSkill = await this.prisma.contractorSkills.findUnique({
			where: {
				contractor_id_skill_id: {
					contractor_id: contractorId,
					skill_id:      skillId,
				},
			},
			include: {
				skill: true,
			},
		},)

		if (!contractorSkill) {
			throw new NotFoundException('Contractor skill not found',)
		}

		const updatedContractorSkill = await this.prisma.contractorSkills.update({
			where: {
				contractor_id_skill_id: {
					contractor_id: contractorId,
					skill_id:      skillId,
				},
			},
			data: {
				confirmed: data.confirmed,
			},
			include: {
				skill: true,
			},
		},)

		return ContractorSkillResponseDto.cast(updatedContractorSkill,)
	}

	public async approveContractorSkill(contractorId: string, skillId: string,): Promise<ContractorSkillResponseDto> {
		return this.updateContractorSkill(contractorId, skillId, { confirmed: true, },)
	}

	public async deleteContractorSkill(contractorId: string, skillId: string,): Promise<void> {
		const contractorSkill = await this.prisma.contractorSkills.findUnique({
			where: {
				contractor_id_skill_id: {
					contractor_id: contractorId,
					skill_id:      skillId,
				},
			},
		},)

		if (!contractorSkill) {
			throw new NotFoundException('Contractor skill not found',)
		}

		await this.prisma.contractorSkills.delete({
			where: {
				contractor_id_skill_id: {
					contractor_id: contractorId,
					skill_id:      skillId,
				},
			},
		},)
	}
}