/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { BadRequestException, Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import { PrismaService, } from 'nestjs-prisma'
import { ResetPasswordDto, SendInstructionsDto, } from 'src/modules/admin/dto'
import { CryptoService, } from 'src/modules/crypto/crypto.service'
import { MailService, } from 'src/modules/mail/mail.service'
import { Template, templateDictionary } from 'src/modules/mail/types/template.enum'
import { ForgotPasswordAdminRepository, } from 'src/repositories/forgot-password-admin/forgot-password-admin.repository'
import { text, } from 'src/shared/text/en'
import { ClientMessage, Message, } from 'src/shared/types'
import { EClientType, } from 'src/shared/types/client.type'

@Injectable()
export class ForgotPasswordClientsService {
	constructor(
		private readonly forgotPasswordRepository: ForgotPasswordAdminRepository,
		private readonly mailService: MailService,
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
		private readonly cryptoService: CryptoService,

	) {}

	 private async checkUser(email:string, id?:string,) {
		const b2cClient = await this.prisma.b2CClients.findFirst({where: {
			email,
		},},)

		const b2bClient = await this.prisma.b2BClients.findFirst({where: {
			email,
		},},)

		if (!b2bClient && !b2cClient) {
			throw new BadRequestException(text.userNotExist,)
		}

		const clientType = b2cClient ?
			EClientType.B2C :
			EClientType.B2B

		const client = b2cClient || b2bClient

		if (!client) {
			throw new Error('Client not found after check',)
		}

		return {
			clientType,
			client,
		}
	}

	public async sendInstructionsClient(body:SendInstructionsDto,):Promise<ClientMessage> {
		const clientData = await this.checkUser(body.email,)

		const session = await this.forgotPasswordRepository.createForgotPasswordSessionByClientId(clientData.client.id, clientData.clientType ,)

		await this.mailService.sendEmailWithTemplate(Template.FORGOT, {
			clickLondonUrl:       `${this.configService.getOrThrow('CLIENT_REDIRECT_URL',)}/forgot-password/${session?.id}` ,
			email:                clientData.client.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].recoverPasswordMessage,
		}, {
			to:      clientData.client.email,
			subject: 'Reset password',
		},)

		return {
			message: text.success,
		}
	}

	public async checkExistence(id: string,): Promise<{ available: boolean }> {
		const resetPasswordEntry = await this.forgotPasswordRepository.findByIdClient(
			id,
		)

		return {
			available: Boolean(resetPasswordEntry,),
		}
	}

	public async resetPassword({id,newPassword,} : ResetPasswordDto,):Promise<Message> {
		const resetPasswordEntry = await this.forgotPasswordRepository.findByIdClient(id,)

		if (!resetPasswordEntry) {
			throw new BadRequestException(text.wrongId,)
		}

		await this.changeClientPassword(newPassword,resetPasswordEntry.b2bClient_id,resetPasswordEntry.b2cClient_id,)

		await this.forgotPasswordRepository.deleteByIdClient(id,)

		return {
			message: text.success,
		}
	}

	private async changeClientPassword(newPassword:string,b2bId:string | null,b2cId:string | null,) {
		const password = await this.cryptoService.hashString(newPassword,)

		if (b2bId) {
			return this.prisma.b2BClients.update({
				where: {
					id: b2bId,
				},
				data: {
					password,
				},
			},)
		} else if (b2cId) {
			return this.prisma.b2CClients.update({
				where: {
					id: b2cId,
				},
				data: {
					password,
				},
			},)
		}

		return undefined
	}
}