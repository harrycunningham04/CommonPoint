import {
	Body,
	Controller,
	Get,
	Param,
	Post,
} from '@nestjs/common'

import type { Message, } from '../../../shared/types'
import { SendInstructionsDto, } from '../dto/send-insructions.dto'
import { ForgotPasswordAdminService, } from '../services/forgot-password-admin.service'
import { ResetPasswordDto, } from '../dto/forgot-password.dto'

@Controller('forgot-password-admin',)
export class ForgotPasswordAdminController {
	constructor(
        private readonly forgotPasswordService: ForgotPasswordAdminService,
	) {}

	@Post('send-instructions',)
	public async sendInstructions(@Body() body: SendInstructionsDto,): Promise<Message> {
		return this.forgotPasswordService.sendInstructions(body,)
	}

	@Post('reset-password',)
	public async resetPassword(@Body() body: ResetPasswordDto,): Promise<Message> {
		return this.forgotPasswordService.resetPassword(body,)
	}

	@Get('check/:id',)
	public async check(@Param('id',) id: string,): Promise<{available: boolean}> {
		return this.forgotPasswordService.checkExistence(id,)
	}
}
