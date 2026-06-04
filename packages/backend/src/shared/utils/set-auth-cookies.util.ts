import type {
	Response,
} from 'express'

import {
	TOKEN_TYPES,
} from '../constants/token-types.constants'
import {
	JWT_COOKIES_OPTIONS,
} from '../configs/cookies.config'

export const setAuthCookiesAdmin = (res: Response, token: string, refreshToken: string,): void => {
	res.cookie(TOKEN_TYPES.JWT_ADMIN, token, JWT_COOKIES_OPTIONS,)
	res.cookie(TOKEN_TYPES.JWT_REFRESH_ADMIN, refreshToken, JWT_COOKIES_OPTIONS,)
}

export const setAuthCookiesContractor = (res: Response, token: string, refreshToken: string,): void => {
	res.cookie(TOKEN_TYPES.JWT_CONTRACTOR, token, JWT_COOKIES_OPTIONS,)
	res.cookie(TOKEN_TYPES.JWT_REFRESH_CONTRACTOR, refreshToken, JWT_COOKIES_OPTIONS,)
}

export const setAuthCookiesClient = (res: Response, token: string, refreshToken: string,): void => {
	res.cookie(TOKEN_TYPES.JWT_CLIENT, token, JWT_COOKIES_OPTIONS,)
	res.cookie(TOKEN_TYPES.JWT_REFRESH_CLIENT, refreshToken, JWT_COOKIES_OPTIONS,)
}
