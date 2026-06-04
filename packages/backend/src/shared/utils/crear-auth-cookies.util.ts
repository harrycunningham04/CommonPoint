import type {
	Response,
} from 'express'

import {
	TOKEN_TYPES,
} from '../constants/token-types.constants'
import {
	JWT_COOKIES_OPTIONS,
} from '../configs/cookies.config'

export const clearAuthCookiesAdmin = (res: Response,): void => {
	res.clearCookie(TOKEN_TYPES.JWT_ADMIN, JWT_COOKIES_OPTIONS,)
	res.clearCookie(TOKEN_TYPES.JWT_REFRESH_ADMIN, JWT_COOKIES_OPTIONS,)
}

export const clearAuthCookiesContractor = (res: Response,): void => {
	res.clearCookie(TOKEN_TYPES.JWT_CONTRACTOR, JWT_COOKIES_OPTIONS,)
	res.clearCookie(TOKEN_TYPES.JWT_REFRESH_CONTRACTOR, JWT_COOKIES_OPTIONS,)
}

export const clearAuthCookiesClient = (res: Response,): void => {
	res.clearCookie(TOKEN_TYPES.JWT_CLIENT, JWT_COOKIES_OPTIONS,)
	res.clearCookie(TOKEN_TYPES.JWT_REFRESH_CLIENT, JWT_COOKIES_OPTIONS,)
}
