/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Body, Controller, Get, Param, Post, } from '@nestjs/common'
import { ForgotPasswordClientsService, } from '../services/forgot-password-clients.service'
import { ResetPasswordDto, SendInstructionsDto, } from 'src/modules/admin/dto'
import { Message, } from 'src/shared/types'

@Controller('forgot-password-clients',)
export class ForgotPasswordClientController {
	constructor(
        private readonly forgotPasswordService:ForgotPasswordClientsService,
	) {}

    @Post('send-instructions',)
	public async sendInctructions(@Body() body: SendInstructionsDto,):Promise<Message> {
		return this.forgotPasswordService.sendInstructionsClient(body,)
	}

    @Get('check/:id',)
    public async check(@Param('id',) id:string,):Promise<{available : boolean}> {
    	return this.forgotPasswordService.checkExistence(id,)
    }

	@Post('reset-password',)
    public async resetPassword(@Body() body:ResetPasswordDto,):Promise<Message> {
    	return this.forgotPasswordService.resetPassword(body,)
    }
}