import { Controller, Get, Param, } from '@nestjs/common'
import { OfficeBasicService, } from '../services/office-basic.service'

@Controller('office-basic',)
export class OfficeBasicController {
	constructor(private readonly officeBasicService: OfficeBasicService,) {}

	@Get(':officeId',)
	public async getOfficeBasic(@Param('officeId',) officeId: string,): Promise<{
		id: string
		title: string
		address: string
		workersCount: number
	}> {
		return this.officeBasicService.getOfficeBasic(officeId,)
	}
}