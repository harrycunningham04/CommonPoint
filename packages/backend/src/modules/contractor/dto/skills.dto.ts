import { ApiProperty, } from '@nestjs/swagger'
import { ContractorSkillNama, } from '@prisma/client'
import { IsArray, IsEnum, } from 'class-validator'

export class SkillsDto {
	constructor(data?: SkillsDto,) {
  	if (data) {
  		this.skills = data.skills
			return
  	}
		this.skills = []
	}

	@IsArray()
  @IsEnum(ContractorSkillNama, { each: true, },)
	@ApiProperty()
	public skills: Array<ContractorSkillNama>
}