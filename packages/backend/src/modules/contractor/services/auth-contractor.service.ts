import { BadRequestException, HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type {
	Response,
} from 'express'
import { PrismaService, } from 'nestjs-prisma'
import { CryptoService, } from 'src/modules/crypto/crypto.service'
import { JWTService, } from 'src/modules/jwt/jwt.service'
import type { SignInDto, } from 'src/shared/dto/sign-in.dto'
import { text, } from 'src/shared/text/en'
import type { IBasicContractor, } from '../contractor.types'
import { setAuthCookiesContractor, } from 'src/shared/utils/set-auth-cookies.util'
import type { BasicMessageDto, } from 'src/shared/dto/basic-message.dto'
import { clearAuthCookiesContractor, } from 'src/shared/utils/crear-auth-cookies.util'

@Injectable()
export class AuthContractorService {
	constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JWTService,
      private readonly cryptoService: CryptoService,
	) {}

	private async validateContractor(body: SignInDto,): Promise<IBasicContractor> {
		const contractor = await this.prisma.contractor.findUnique({
			where: {
				email:    body.email,
			},
			select: {
				id:       true,
				email:    true,
				password: true,
				archived: true,
			},
		},)

		if (!contractor) {
			throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
		}

		if (contractor.archived) {
			throw new HttpException(text.accountIsArchived, HttpStatus.GONE,)
		}

		if (!contractor.password) {
			throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
		}

		const passwordValid = await this.cryptoService.comparePasswords(body.password, contractor.password,)

		if (!passwordValid) {
			throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
		}
		return {
			email: contractor.email,
			id:    contractor.id,
		}
	}

	private authorizeContractor(contractor: IBasicContractor, res: Response,): void {
		const tokens = this.jwtService.generateAdminTokensPair(contractor.id, false,)

		setAuthCookiesContractor(res, tokens.token, tokens.refreshToken,)
	}

	public async loginContractor(res: Response, body: SignInDto,): Promise<void> {
		const contractor = await this.validateContractor(body,)

		this.authorizeContractor(contractor, res,)
	}

	public async logoutContractor(res: Response,): Promise<BasicMessageDto> {
		clearAuthCookiesContractor(res,)

		return {
			message: text.success,
		}
	}
}