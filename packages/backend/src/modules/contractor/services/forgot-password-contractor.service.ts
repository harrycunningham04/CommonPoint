import { BadRequestException, Injectable, } from '@nestjs/common'

import { text, } from '../../../shared/text/en'

import { MailService, } from 'src/modules/mail/mail.service'
import { PrismaService, } from 'nestjs-prisma'
import { ConfigService, } from '@nestjs/config'
import { ContractorService, } from './contractor.service'
import { ForgotPasswordRepository, } from 'src/repositories/forgot-password/forgot-password.repository'
import type { ResetPasswordDto, } from 'src/shared/dto/forgot-password.dto'
import type { SendInstructionsDto, } from 'src/shared/dto/send-insructions.dto'
import type { BasicMessageDto, } from 'src/shared/dto/basic-message.dto'
import type { IBasicContractor, } from '../contractor.types'
import type { AvailableStatusDto, } from '../dto/available-status.dto'

@Injectable()
export class ForgotPasswordContractorService {
	constructor(
		private readonly forgotPasswordRepository: ForgotPasswordRepository,
		private readonly mailService: MailService,
    private readonly prisma: PrismaService,
		private readonly contractorService: ContractorService,
		private readonly configService: ConfigService,
	) {}

	public async sendInstructions(body: SendInstructionsDto,): Promise<BasicMessageDto> {
		const user = await this.checkUser(body.email,)

		if (!user) {
			return {
				message: text.userNotExist,
			}
		}

		const session = await this.forgotPasswordRepository.createForgotPasswordSessionByUserId(user.id,)

		await this.mailService.sendEmail({
			to:      user.email,
			subject: 'Reset password',
			html:    `
            <h1>Reset password</h1>
            <a href="${this.configService.get('CONTRACTOR_REDIRECT_URL',)}/forgot-password/${session.id}">Reset password</a>
            `,
		},)

		return {
			message: text.success,
		}
	}

	public async resetPassword({ id, newPassword, }: ResetPasswordDto,): Promise<BasicMessageDto> {
		const resetPasswordEntry = await this.forgotPasswordRepository.findById(id,)

		if (!resetPasswordEntry) {
			throw new BadRequestException(text.wrongId,)
		}

		await this.contractorService.changePasswordByAdminId(resetPasswordEntry.contractor_id, newPassword,)

		await this.forgotPasswordRepository.deleteById(id,)

		return {
			message: text.success,
		}
	}

	public async checkExistence(id: string,): Promise<AvailableStatusDto> {
		const resetPasswordEntry = await this.forgotPasswordRepository.findById(id,)

		return {
			available: Boolean(resetPasswordEntry,),
		}
	}

	private async checkUser(email: string,): Promise<IBasicContractor | null> {
		const user = await this.prisma.contractor.findUnique({
			where: {
				email,
			},
			select: {
				id: 	     true,
				email:     true,
			},
		},)

		return user
	}
}
