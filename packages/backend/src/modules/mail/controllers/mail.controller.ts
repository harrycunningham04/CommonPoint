/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Body, Controller, Param, Post, Query, UseGuards, } from '@nestjs/common'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { MailService, } from '../mail.service'
import { SendContactFormDto, } from '../dto/send-contact-form.dto'
import { ConfigService, } from '@nestjs/config'

@Controller('mail',)
export class MailController {
	private readonly toEmail: string

	constructor(
		private readonly mailService: MailService,
        private readonly configService: ConfigService,
	) {
		const emailUser = this.configService.get('EMAIL_USER',)
		this.toEmail = emailUser
	}

	@Post('test',)
	public async test(@Body() data: { email: string, },): Promise<void> {
		return this.mailService.test(data.email,)
	}

	@UseGuards(ClientAuthGuard,)
	@Post('contact-form',)
	public async sendContactForm(@Body() data: SendContactFormDto,): Promise<void> {
		console.log(data,)
		return this.mailService.sendEmail({
			to:      this.toEmail,
			subject: 'User contact form',
			html:    `<p>User address: ${data.address} is not in available regions.</p><p>User contact email: ${data.email}</p><p>Details from user: ${data.details}</p>`,
		},)
	}
}
