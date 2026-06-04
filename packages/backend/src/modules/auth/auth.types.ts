import type { Admin, B2BClients, B2CClients, Worker, } from '@prisma/client'
import type {
	Request,
	Response,
} from 'express'

export type SignUpReturn = {
    token: string
    message: string
	email: string
}

export type AuthRequest = Request & {
	auth: boolean
	id: string
	isAdmin: boolean
	isClient?:boolean
	access?: number
    archived?: boolean
}

export type AuthCheckReturn = {
	auth: boolean
	admin?: Omit<Admin, 'password'>
}

export type AuthCheckClientReturn = {
	auth:boolean
	client?: Omit<B2BClients | B2CClients | Worker,'password'>,
	clientType? : 'B2C' | 'B2B' | 'WORKER'
}

export type GoogleTokens = {
	access_token: string,
	refresh_token: string,
	scope: string,
	id_token: string
}

export type GoogleUserInfo = {
	name: string,
	given_name: string,
	family_name: string,
	picture: string,
	email: string,
	email_verified: boolean,
	locale: string,
	hd: string
}

export type OauthLoginProps = {
	email: string,
	res: Response,
}

export type GithubOauthRes = {
	access_token: string,
	scope: string,
	token_type: string
}

export type GithubUser = {
	email?: string
	login: string
	id: number
	avatar_url: string
}

export type FacebookUser = {
	email?: string
}
