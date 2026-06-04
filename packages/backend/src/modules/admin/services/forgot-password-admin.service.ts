import {
	BadRequestException,
	Inject,
	Injectable,
	forwardRef,
} from '@nestjs/common'
import { text, } from '../../../shared/text/en'
import { ForgotPasswordAdminRepository, } from 'src/repositories/forgot-password-admin/forgot-password-admin.repository'
import type { Message, } from '../../../shared/types'
import type { SendInstructionsDto, ResetPasswordDto, } from '../dto'
import { MailService, } from 'src/modules/mail/mail.service'
import { PrismaService, } from 'nestjs-prisma'
import { AdminService, } from './admin.service'
import type { Admin, } from '@prisma/client'
import { ConfigService, } from '@nestjs/config'
import { Template, templateDictionary } from 'src/modules/mail/types/template.enum'

@Injectable()
export class ForgotPasswordAdminService {
	constructor(
		private readonly forgotPasswordRepository: ForgotPasswordAdminRepository,
		private readonly mailService: MailService,
		private readonly prisma: PrismaService,
		@Inject(
			forwardRef(() => {
				return AdminService
			},),
		)
		private readonly adminService: AdminService,
		private readonly configService: ConfigService,
	) {}

	public async sendInstructions(body: SendInstructionsDto,): Promise<Message> {
		const user = await this.checkUser(body.email,)

		if (!user) {
			throw new BadRequestException(text.userNotExist,)
		}

		const session =
			await this.forgotPasswordRepository.createForgotPasswordSessionByUserId(
				user.id,
			)

		await this.mailService.sendEmailWithTemplate(Template.FORGOT, {
			clickLondonUrl:       `${this.configService.getOrThrow('FRONTEND_REDIRECT_URL',)}/forgot-password/${session.id}` ,
			email:                user.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].recoverPasswordMessage,
		}, {
			to:      user.email,
			subject: 'Reset password',
		},)

		return {
			message: text.success,
		}
	}

	public async resetPassword({
		id,
		newPassword,
	}: ResetPasswordDto,): Promise<Message> {
		const resetPasswordEntry = await this.forgotPasswordRepository.findById(
			id,
		)

		if (!resetPasswordEntry) {
			throw new BadRequestException(text.wrongId,)
		}

		await this.adminService.changePasswordByAdminId(
			resetPasswordEntry.admin_id,
			newPassword,
		)

		await this.forgotPasswordRepository.deleteById(id,)

		return {
			message: text.success,
		}
	}

	public async checkExistence(id: string,): Promise<{ available: boolean }> {
		const resetPasswordEntry = await this.forgotPasswordRepository.findById(
			id,
		)

		return {
			available: Boolean(resetPasswordEntry,),
		}
	}

	private async checkUser(email: string,): Promise<Admin | null> {
		const user = await this.prisma.admin.findUnique({
			where: {
				email,
			},
		},)

		return user
	}
}
