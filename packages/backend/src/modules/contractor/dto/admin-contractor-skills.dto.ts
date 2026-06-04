import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUUID, } from 'class-validator'
import { ContractorSkillNama, } from '@prisma/client'

export class CreateContractorSkillDto {
	@IsUUID()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	public contractorId!: string

	@IsEnum(ContractorSkillNama,)
	@IsNotEmpty()
	@ApiProperty({
		description: 'Skill name',
		example:     'PHOTO',
		enum:        ContractorSkillNama,
	},)
	public skillName!: ContractorSkillNama

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		description: 'Whether the skill is confirmed by admin',
		example:     true,
		default:     true,
	},)
	public confirmed?: boolean = true
}

export class UpdateContractorSkillDto {
	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Whether the skill is confirmed by admin',
		example:     true,
	},)
	public confirmed!: boolean
}

export class ContractorSkillResponseDto {
	constructor(data?: ContractorSkillResponseDto,) {
		if (data) {
			this.contractorId = data.contractorId
			this.skillId = data.skillId
			this.skillName = data.skillName
			this.confirmed = data.confirmed
			this.createdAt = data.createdAt
			this.updatedAt = data.updatedAt
			return
		}
		this.contractorId = ''
		this.skillId = ''
		this.skillName = ContractorSkillNama.PHOTO
		this.confirmed = false
		this.createdAt = new Date()
		this.updatedAt = new Date()
	}

	@ApiProperty({
		description: 'Contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	public contractorId!: string

	@ApiProperty({
		description: 'Skill ID',
		example:     '123e4567-e89b-12d3-a456-426614174001',
	},)
	public skillId!: string

	@ApiProperty({
		description: 'Skill name',
		example:     'PHOTO',
		enum:        ContractorSkillNama,
	},)
	public skillName!: ContractorSkillNama

	@ApiProperty({
		description: 'Whether the skill is confirmed by admin',
		example:     true,
	},)
	public confirmed!: boolean

	@ApiProperty({
		description: 'Creation date',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'Last update date',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	public static cast(contractorSkill: {
		contractor_id: string
		skill_id:      string
		skill:         {
			name: ContractorSkillNama
		}
		confirmed:     boolean
		created_at:    Date
		updated_at:    Date
	},): ContractorSkillResponseDto {
		return new ContractorSkillResponseDto({
			contractorId: contractorSkill.contractor_id,
			skillId:      contractorSkill.skill_id,
			skillName:    contractorSkill.skill.name,
			confirmed:    contractorSkill.confirmed,
			createdAt:    contractorSkill.created_at,
			updatedAt:    contractorSkill.updated_at,
		},)
	}
}

export class GetContractorSkillsQueryDto {
	@IsOptional()
	@ApiProperty({
		description: 'Filter by confirmation status',
		example:     true,
		required:    false,
	},)
	public confirmed?: boolean

	@IsOptional()
	@IsEnum(ContractorSkillNama,)
	@ApiProperty({
		description: 'Filter by skill name',
		example:     'PHOTO',
		required:    false,
		enum:        ContractorSkillNama,
	},)
	public skillName?: ContractorSkillNama
}