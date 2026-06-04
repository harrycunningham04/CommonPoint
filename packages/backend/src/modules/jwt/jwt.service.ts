import jwt from 'jsonwebtoken'
import { Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'

import { text, } from '../../shared/text/en'
import {
	JWT_REFRESH_TOKEN_EXP,
	JWT_TOKEN_EXP,
} from './jwt.constants'
import type {
	GenerateJWTTokenProps,
	GenerateTokensPairReturnType,
	JWTPayload,
} from './jwt.types'

@Injectable()
export class JWTService {
	private readonly jwtPrivateKey: string

	private readonly refreshJwtPrivateKey: string

	constructor(
        private readonly configService: ConfigService,
	) {
		this.jwtPrivateKey = this.configService.getOrThrow('JWT_PRIVATE_KEY',).replace(/\\n/g, '\n',)
		this.refreshJwtPrivateKey = this.configService.getOrThrow('JWT_PRIVATE_REFRESH_KEY',).replace(/\\n/g, '\n',)
	}

	public generateTokensPair(id: string, isAdmin: boolean, access?: number, archived?: boolean,): GenerateTokensPairReturnType {
		const token = this.generateJWTToken({
			id,
			isAdmin,
			access,
			archived,
			expirationTime: JWT_TOKEN_EXP,
			privateKey:     this.jwtPrivateKey,
		},)

		const refreshToken = this.generateJWTToken({
			id,
			isAdmin,
			access,
			archived,
			expirationTime: JWT_REFRESH_TOKEN_EXP,
			privateKey:     this.refreshJwtPrivateKey,
		},)

		return {
			token,
			refreshToken,
		}
	}

	public generateAdminTokensPair(id: string, isAdmin: boolean, access?: number, archived?: boolean,): GenerateTokensPairReturnType {
		const token = this.generateJWTToken({
			id,
			isAdmin,
			access,
			archived,
			expirationTime: JWT_TOKEN_EXP,
			privateKey:     this.jwtPrivateKey,
		},)

		const refreshToken = this.generateJWTToken({
			id,
			isAdmin,
			access,
			archived,
			expirationTime: JWT_REFRESH_TOKEN_EXP,
			privateKey:     this.refreshJwtPrivateKey,
		},)

		return {
			token,
			refreshToken,
		}
	}

	public generateStripeToken(id: string,): string {
		return this.generateJWTToken({
			id,
			isAdmin:        false,
			access:         1,
			expirationTime: JWT_TOKEN_EXP,
			privateKey:     this.jwtPrivateKey,
		},)
	}

	public generateJWTToken({
		id, access, isAdmin, expirationTime, privateKey, archived,
	}: GenerateJWTTokenProps,): string {
		const payload: JWTPayload = {
			id,
			isAdmin,
			access,
			archived,
			iat:  Math.floor(Date.now() / 1000,),
			exp:  Math.floor(Date.now() / 1000,) + expirationTime,
		}

		return jwt.sign(payload, privateKey, {
			algorithm: 'RS256',
		},)
	}

	public validateJWTToken(token: string, publicKey?: string,): boolean {
		let isValid = false

		jwt.verify(token, publicKey ?? '', {
			algorithms: ['RS256',],
		}, (err, decoded,) => {
			if (err) {
				throw text.invalidToken
			}

			isValid = Boolean(decoded,)
		},)

		return isValid
	}

	public decodeJWTToken(token: string,): JWTPayload {
		return jwt.decode(token,) as JWTPayload
	}
}
