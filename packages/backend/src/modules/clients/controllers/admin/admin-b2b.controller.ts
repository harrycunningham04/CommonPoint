/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { ClientsB2BService, } from '../../services/b2b.service'
import { ClientsDto, IB2BClientListReturn, } from '../../dto/b2b.dto'
import { B2BClientResponseDto, } from '../../dto/b2b-client-response.dto'
import { CreateB2BDto, } from '../../dto/create-b2b.dto'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'

@UseGuards(AdminAuthGuard,)
@Controller('admin/clients/b2b',)
export class AdminClientsB2BController {
	constructor(private readonly clientsService: ClientsB2BService,) {}

  @Get()
	public async getB2BClients(@Query() query: ClientsDto,): Promise<IB2BClientListReturn> {
		return this.clientsService.get(query,)
	}

  @Post()
  public async addClient(@Body() data: CreateB2BDto,): Promise<B2BClientResponseDto> {
  	return this.clientsService.addClient(data,)
  }
}
