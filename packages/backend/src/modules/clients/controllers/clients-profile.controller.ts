import { Body, Controller, Patch, UseGuards, } from '@nestjs/common'
import { User, } from 'src/shared/decorators/user.decorator'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { ChangeClientDto, } from '../dto/b2c.dto'
import { ClientsB2BService, } from '../services/b2b.service'
import type { B2BClientResponseDto, } from '../dto/b2b-client-response.dto'

@Controller('clients/profile',)
@UseGuards(ClientAuthGuard,)
export class ClientsProfileController {
	constructor(private readonly clientsService: ClientsB2BService,) {}

    @Patch('update-b2b',)
	public async updateB2BProfile(@User() clientId:string,@Body() body: ChangeClientDto,): Promise<B2BClientResponseDto> {
		return this.clientsService.updateB2B(clientId,body,)
	}
}
