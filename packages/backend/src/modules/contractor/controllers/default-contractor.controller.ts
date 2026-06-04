/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Controller, Get, Param, ParseEnumPipe, } from '@nestjs/common'
import { DefaultContractorsService, } from '../services/default-contractors.service'
import { ContractorSkillNama, } from '@prisma/client'
import { ApiTags, } from '@nestjs/swagger'

@Controller('default-contractor',)
@ApiTags('Default Contractor',)
export class DefaultContractorController {
	constructor(
        private readonly defaultContractorsService: DefaultContractorsService,
	) {}

    @Get(':skill',)
	public async getContractor(
        @Param('skill', new ParseEnumPipe(ContractorSkillNama,),)
        	skill: ContractorSkillNama,
	) {
		return this.defaultContractorsService.getDefaultContractor(skill,)
	}
}
