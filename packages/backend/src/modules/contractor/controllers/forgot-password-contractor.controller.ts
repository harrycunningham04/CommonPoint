import { Body, Controller, Get, Param, Post, UseFilters, } from '@nestjs/common'
import { ForgotPasswordContractorService, } from '../services/forgot-password-contractor.service'
import { SendInstructionsDto, } from 'src/shared/dto/send-insructions.dto'
import { ResetPasswordDto, } from 'src/shared/dto/forgot-password.dto'
import { BasicMessageDto, } from 'src/shared/dto/basic-message.dto'
import { ApiBody, ApiOkResponse, ApiParam, } from '@nestjs/swagger'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import { AvailableStatusDto, } from '../dto/available-status.dto'

@Controller('forgot-password-contractor',)
@UseFilters(HttpExceptionFilter,)
export class ForgotPasswordAdminController {
	constructor(
        private readonly forgotPasswordService: ForgotPasswordContractorService,
	) {}

	@Post('send-instructions',)
  @ApiBody({
  	type:        SendInstructionsDto,
  	description: 'Send instructions to reset password',
  },)
  @ApiOkResponse({
  	type:        BasicMessageDto,
  	description: 'Success message',
  },)
	public async sendInstructions(@Body() body: SendInstructionsDto,): Promise<BasicMessageDto> {
		return this.forgotPasswordService.sendInstructions(body,)
	}

	@Post('reset-password',)
  @ApiBody({
  	type:        ResetPasswordDto,
  	description: 'Reset password',
  },)
  @ApiOkResponse({
  	type:        BasicMessageDto,
  	description: 'Success message',
  },)
	public async resetPassword(@Body() body: ResetPasswordDto,): Promise<BasicMessageDto> {
		return this.forgotPasswordService.resetPassword(body,)
	}

	@Get('check/:id',)
  @ApiParam({
  	name:        'id',
  	type:        String,
  	description: 'Id to check',
  },)
  @ApiOkResponse({
  	type:        AvailableStatusDto,
  	description: 'Available status',
  },)
	public async check(@Param('id',) id: string,): Promise<AvailableStatusDto> {
		return this.forgotPasswordService.checkExistence(id,)
	}
}