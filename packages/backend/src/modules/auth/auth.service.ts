import qs from 'querystring'

import { BadRequestException, Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'

import { text, } from '../../shared/text/en'
import { JWTService, } from '../jwt/jwt.service'
import { CryptoService, } from '../crypto/crypto.service'

import type { ClientMessage, Message, } from '../../shared/types'
import type { SignInDto, } from './dto/sign-in.dto'
import type { Response, } from 'express'
import type  { Admin, B2BClients, B2CClients, Worker, } from '@prisma/client'
import type {
	AuthCheckClientReturn,
	AuthCheckReturn,
	AuthRequest,
} from './auth.types'
import { MailService, } from '../mail/mail.service'
import { AdminService, } from '../admin/services/admin.service'
import { DashboardService, } from '../dashboard/services/dashboard.service'
import type { SignUpDto, } from './dto/sign-up.dto'
import { ClientsB2CService, } from '../clients/services/b2c.service'
import { PrismaService, } from 'nestjs-prisma'
import { EClientType, } from 'src/shared/types/client.type'
import { setAuthCookiesAdmin, setAuthCookiesClient, } from 'src/shared/utils/set-auth-cookies.util'
import { clearAuthCookiesAdmin, clearAuthCookiesClient, } from 'src/shared/utils/crear-auth-cookies.util'

@Injectable()
export class AuthService {
	public readonly oauthSuccessRedirectUrl: string

	public readonly oauthFailtureRedirectUrl: string

	public readonly frontendUrl: string

	constructor(
        private readonly prisma: PrismaService,

		private readonly jwtService: JWTService,
		private readonly cryptoService: CryptoService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService,
		private readonly adminService: AdminService,
		private readonly dashboardService:DashboardService,
		// private readonly b2cClientsService:ClientsB2CService ,

	) {
		this.oauthSuccessRedirectUrl = this.configService.getOrThrow('FRONTEND_REDIRECT_URL',) + this.configService.getOrThrow('OAUTH_SUCCESS_ROUTE',)
		this.oauthFailtureRedirectUrl = this.configService.getOrThrow('FRONTEND_REDIRECT_URL',) + this.configService.getOrThrow('OAUTH_FAILTURE_ROUTE',)
		this.frontendUrl = this.configService.getOrThrow('FRONTEND_REDIRECT_URL',)
	}

	// public async signIn(res: Response, body: SignInDto,): Promise<Message> {
	// 	const user = await this.userService.validateUser(body.email, body.password,)

	// 	this.authorizeUser(user, res,)

	// 	return {
	// 		message: text.successfullyLoggenIn,
	// 	}
	// }

	public async signInAdmin(res: Response, body: SignInDto,): Promise<Message> {
		const admin = await this.adminService.validateAdmin(body.email, body.password,)
		// eslint-disable-next-line no-unused-vars
		const { password:_, ...rest } = admin

		// this.dashboardService.initializeAdminsWidgets(admin.id,)

		this.authorizeAdmin({...admin,}, res,)

		return {
			admin:   rest,
			message: text.successfullyLoggenIn,
		}
	}

	public async logout(res: Response,): Promise<Message> {
		clearAuthCookiesAdmin(res,)

		return {
			message: text.success,
		}
	}

	public async logoutClient(res: Response,): Promise<Message> {
		clearAuthCookiesClient(res,)

		return {
			message: text.success,
		}
	}

	public async check(req: AuthRequest,): Promise<AuthCheckReturn> {
		if (!req.auth) {
			return {
				auth: false,
			}
		}

		const admin = await this.adminService.getAdminById(req.id,)
		if (admin) {
			// eslint-disable-next-line no-unused-vars
			const {password:_, ...rest} = admin

			return {
				auth:  req.auth,
				admin: rest,
			}
		}

		return {
			auth:  req.auth,
		}
	}

	// private authorizeUser(user: (OfficeWorker | Admin) & {isAdmin?: boolean}, res: Response,): void {
	// 	const tokens = this.jwtService.generateTokensPair(user.id, user.isAdmin ?? false, user.role,)

	// 	setAuthCookies(res, tokens.token, tokens.refreshToken,)
	// }

	private authorizeAdmin(admin: Admin, res: Response,): void {
		const tokens = this.jwtService.generateAdminTokensPair(admin.id, true, admin.access,)

		setAuthCookiesAdmin(res, tokens.token, tokens.refreshToken,)
	}

	private authorizeClient(client:B2CClients | B2BClients | Worker, res:Response,):void {
		const tokens = this.jwtService.generateTokensPair(client.id, false,)

		setAuthCookiesClient(res,tokens.token,tokens.refreshToken,)
	}

	public getFailureUrl(error: string,): string {
		const values = {
			error,
		}

		return `${this.oauthFailtureRedirectUrl}?${qs.stringify(values,)}`
	}

	public async signUpClient(body:SignUpDto,res:Response,) {
		const {email,password,} = body

		const hashedPassword = await this.cryptoService.hashString(password,)

		const newClient = await this.prisma.b2CClients.create({
			data: {
				email,
				password:    hashedPassword,
				firstName:   '',
				lastName:    '',
				address:     '',
				phoneNumber: '',
			},
		},)

		this.authorizeClient(newClient,res,)

		const {password : _, ...rest} = newClient

		return {
			message: 'succses',
			client:  rest,
		}
	}

	public async checkClient(request:AuthRequest,) : Promise<AuthCheckClientReturn> {
		if (!request.auth) {
			return {auth: false,}
		}

		const [b2cClient, b2bClient, worker,] = await Promise.all([
			this.prisma.b2CClients.findFirst({
				where: { id: request.id, },
			},),
			this.prisma.b2BClients.findFirst({
				where:   { id: request.id, },
				include: {
					offices: {
						select: {
							id:    true,
							title: true,
						},
					},
				},
			},),
			this.prisma.worker.findFirst({
				where:   { id: request.id, },
				include: {
					offices: {
						include: {
							office: true,
						},
					},
				},
			},),
		],)

		if (b2bClient || b2cClient || worker) {
			if (b2bClient) {
				const {password, ...rest} = b2bClient

				return {
					auth:       request.auth,
					client:     rest,
					clientType: 'B2B',
				}
			} else if (b2cClient) {
				const {password, ...rest} = b2cClient

				return {
					auth:       request.auth,
					client:     rest,
					clientType: 'B2C',
				}
			} else if (worker) {
				const {password, ...rest} = worker

				const transformedWorker = {
					...rest,
					offices: worker.offices.map((item,) => {
						return item.office
					},),
				}

				return {
					auth:       request.auth,
					client:     transformedWorker,
					clientType: 'WORKER',
				}
			}
		}

		return {
			auth: request.auth,
		}
	}

	public async loginClient(res:Response,body:SignInDto,):Promise<ClientMessage> {
		const {password : passwordUser,email,} = body

		const b2cUser = await this.prisma.b2CClients.findFirst({where: {
			email,
		},},)

		const b2bUser = await this.prisma.b2BClients.findFirst({where: {
			email,
		}, include: {offices: true,},},)

		const officeWorker = await this.prisma.worker.findFirst({where: {
			email,
		}, include: {offices: {
			include: {
				office: true,
			},
		},},},)

		if (b2cUser) {
			const isValidPassword = await this.cryptoService.comparePasswords(passwordUser,b2cUser.password,)

			if (!isValidPassword) {
				throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
			}

			this.authorizeClient(b2cUser,res,)

			const {password,...rest} = b2cUser

			return {
				message:    text.successfullyLoggenIn,
				client:     b2cUser,
				clientType: EClientType.B2C,
			}
		} else if (b2bUser) {
			const isValidPassword = await this.cryptoService.comparePasswords(passwordUser,b2bUser.password,)

			if (!isValidPassword) {
				throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
			}

			this.authorizeClient(b2bUser,res,)

			const {password,...rest} = b2bUser

			return {
				message:    text.successfullyLoggenIn,
				client:     rest,
				clientType: EClientType.B2B,
			}
		} else if (officeWorker) {
			const isValidPassword = await this.cryptoService.comparePasswords(passwordUser,officeWorker.password,)

			if (!isValidPassword) {
				throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
			}

			this.authorizeClient(officeWorker,res,)

			const {password, ...rest} = officeWorker

			const transformedWorker = {
				...rest,
				offices: rest.offices.map((item,) => {
					return item.office
				},),
			}

			return {
				message:    text.successfullyLoggenIn,
				client:     transformedWorker,
				clientType: EClientType.WORKER,
			}
		}

		return {
			message: text.wrongAuthProvider,
		}
	}
}
