export enum SHARED_ROUTES {
	CHECK = 'check',
	MODULE = 'auth',
	CLIENT_CHECK = 'client/check'
}

export const GOOGLE_URLS = {
	GOOGLE_GET_TOKEN_URL: 'https://oauth2.googleapis.com/token',
	GOOGLE_GET_USER_URL:  'https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=',
} as const

export const MOCK_EMAIL = 'email@pm.me'
export const MOCK_PASSWORD = 'Password1234!'
