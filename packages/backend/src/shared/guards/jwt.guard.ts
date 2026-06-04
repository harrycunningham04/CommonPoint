/* eslint-disable complexity */
/* eslint-disable max-depth */
import {
	Inject, Injectable,
} from '@nestjs/common'
import {
	ConfigService,
} from '@nestjs/config'

import {
	SHARED_ROUTES,
} from '../../modules/auth/auth.constants'
import {
	JWTService,
} from '../../modules/jwt/jwt.service'

import type {
	Response,
} from 'express'
import type {
	CanActivate, ExecutionContext,
} from '@nestjs/common'
import type {
	AuthRequest,
} from '../../modules/auth/auth.types'
import { setAuthCookiesAdmin, setAuthCookiesClient, setAuthCookiesContractor, } from '../utils/set-auth-cookies.util'
import { TOKEN_TYPES, } from '../constants/token-types.constants'

@Injectable()
export abstract class JWTAuthGuard implements CanActivate {
	protected abstract accessTokenName: string

	protected abstract refreshTokenName: string

	private readonly jwtPublicKey: string

	private readonly refreshJwtPublicKey: string

	constructor(
        @Inject(JWTService,) private readonly jwtService: JWTService,
		private readonly configService: ConfigService,
	) {
		this.jwtPublicKey = this.configService.getOrThrow('JWT_PUBLIC_KEY',).replace(/\\n/g, '\n',)
		this.refreshJwtPublicKey = this.configService.getOrThrow('JWT_PUBLIC_REFRESH_KEY',).replace(/\\n/g, '\n',)
	}

	public async canActivate(
		context: ExecutionContext,
	): Promise<boolean> {
		const request: AuthRequest = context.switchToHttp().getRequest()
		const response: Response = context.switchToHttp().getResponse()

		const isValid = await this.validateRequest(request, response,)

		if (request.url === `/${SHARED_ROUTES.MODULE}/${SHARED_ROUTES.CHECK}`) {
			request.auth = isValid

			return true
		}

		if (request.url === `/${SHARED_ROUTES.MODULE}/${SHARED_ROUTES.CLIENT_CHECK}`) {
			request.auth = isValid

			return true
		}

		return isValid
	}

	public async validateRequest(request: AuthRequest, response: Response,): Promise<boolean> {
		const token: string | undefined = request.cookies[this.accessTokenName]
		if (!token) {
			return false
		}

		try {
			const isValid = this.jwtService.validateJWTToken(token, this.jwtPublicKey,)
			if (isValid) {
				const payload = this.jwtService.decodeJWTToken(token,)
				if (payload.archived) {
					return false
				}

				request.id = payload.id
				request.access = payload.access
				request.isAdmin = payload.isAdmin
				request.archived = payload.archived

				return true
			}
		} catch {
			const refreshToken: string | undefined = request.cookies[this.refreshTokenName]

			if (!refreshToken) {
				return false
			}

			try {
				const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)

				if (isValid) {
					const payload = this.jwtService.decodeJWTToken(refreshToken,)

					if (payload.archived) {
						return false
					}

					const tokens = this.jwtService.generateTokensPair(payload.id, payload.isAdmin, payload.access, payload.archived,)

					request.id = payload.id
					request.access = payload.access
					request.isAdmin = payload.isAdmin
					request.archived = payload.archived

					this.setAuthCookies(response, tokens.token, tokens.refreshToken,)

					return true
				}
			} catch (err) {
				return false
			}
		}

		return false
	}

	protected abstract setAuthCookies(
		response: Response,
		token: string,
		refreshToken: string,
	): void
}

export class AdminAuthGuard extends JWTAuthGuard {
	protected accessTokenName = TOKEN_TYPES.JWT_ADMIN

	protected refreshTokenName = TOKEN_TYPES.JWT_REFRESH_ADMIN

	protected setAuthCookies(response: Response, token: string, refreshToken: string,): void {
		setAuthCookiesAdmin(response, token, refreshToken,)
	}
}

export class ContractorAuthGuard extends JWTAuthGuard {
	protected accessTokenName = TOKEN_TYPES.JWT_CONTRACTOR

	protected refreshTokenName = TOKEN_TYPES.JWT_REFRESH_CONTRACTOR

	protected setAuthCookies(response: Response, token: string, refreshToken: string,): void {
		setAuthCookiesContractor(response, token, refreshToken,)
	}
}

export class ClientAuthGuard extends JWTAuthGuard {
	protected accessTokenName = TOKEN_TYPES.JWT_CLIENT

	protected refreshTokenName = TOKEN_TYPES.JWT_REFRESH_CLIENT

	protected setAuthCookies(response: Response, token: string, refreshToken: string,): void {
		setAuthCookiesClient(response, token, refreshToken,)
	}
}
