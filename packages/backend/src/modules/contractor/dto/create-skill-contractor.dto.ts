import { ApiProperty, } from '@nestjs/swagger'
import { ContractorSkillNama, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'

export class CreateSkillDto {
    @ApiProperty({enum: ContractorSkillNama,},)
    @IsOptional()
    @IsEnum(ContractorSkillNama,)
	public skillName?: ContractorSkillNama
}
