import { Body, Controller, Delete, Get, Post, Res, UseFilters, UseGuards, } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiTags, } from '@nestjs/swagger'
import { AuthContractorService, } from '../services/auth-contractor.service'
import {
	Response,
} from 'express'
import { SignInDto, } from 'src/shared/dto/sign-in.dto'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import { BasicMessageDto, } from 'src/shared/dto/basic-message.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import { BasicContractorService, } from '../services/basic-contractor.service'
import { AllContractorInfoResDto, } from '../dto/all-contractor-info.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('auth-contractor',)
@ApiTags('Auth Contractor',)
@UseFilters(HttpExceptionFilter,)
export class AuthContractorController {
	constructor(
    private readonly authContractorService: AuthContractorService,
		private readonly basicContractorService: BasicContractorService,
	) { }

  @Post('login',)
  @ApiBody({
  	type:        SignInDto,
  	description: 'Sign in contractor',
  },)
  @ApiOkResponse({
  	description: 'Contractor logged in',
  },)
  @ApiBadRequestResponse({
  	description: 'Email or password is incorrect',
  },)
	public async loginContractor(@Res({passthrough: true,},) res: Response, @Body() body: SignInDto,): Promise<void> {
		return this.authContractorService.loginContractor(res, body,)
	}

	@UseGuards(ContractorAuthGuard,)
	@Get('me',)
	@ApiOkResponse({
		type: 			    AllContractorInfoResDto,
		description: 'Contractor data',
	},)
	@ApiBadRequestResponse({
		description: 'Contractor not logged in',
	},)
  public async getContractorData(@User() id: string,): Promise<AllContractorInfoResDto> {
  	return this.basicContractorService.getAllContractorInfo(id,)
  }

	@Delete('logout',)
	@ApiOkResponse({
		type:        BasicMessageDto,
		description: 'Contractor logged out',
	},)
	@ApiBadRequestResponse({
		description: 'Contractor not logged in',
	},)
	public async logoutContractor(@Res({passthrough: true,},) res: Response,): Promise<BasicMessageDto> {
  	return this.authContractorService.logoutContractor(res,)
	}
}