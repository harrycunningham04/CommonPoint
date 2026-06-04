import { Controller, Get, Param, } from '@nestjs/common'
import { ClientBasicService, } from '../services/client-basic.service'
import type { B2BClientResponseDto, B2bClientSelectResponseDto, } from '../dto/b2b-client-response.dto'
import type { B2CClientResponseDto, } from '../dto/b2c-client-response.dto'
import type { ICheckEmailIsTakenResponse, } from '../types/client-basic.types'

@Controller('client-basic',)
export class ClientBasicController {
	constructor(
		private readonly clientBasicService: ClientBasicService,
	) {}

	@Get('client/:id',)
	public async getClientBasic(@Param('id',) id: string,): Promise<B2BClientResponseDto | B2CClientResponseDto | null> {
		return this.clientBasicService.getClientById(id,)
	}

	@Get('check-email/:email',)
	public async checkIfEmailIsTaken(@Param('email',) email: string,): Promise<ICheckEmailIsTakenResponse> {
		return this.clientBasicService.checkIfEmailIsTaken(email,)
	}

	@Get('b2b-clients-select',)
	public async getB2bClientsSelect(): Promise<Array<B2bClientSelectResponseDto>> {
		return this.clientBasicService.getB2bClientsSelect()
	}
}