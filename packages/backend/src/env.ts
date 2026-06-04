import {
	cleanEnv,
	str,
	num,
} from 'envalid'

export default function checkEnv(): void {
	cleanEnv(process.env, {
		PORT:                    num(),
		DATABASE_URL:            str(),
		JWT_PRIVATE_KEY:         str(),
		JWT_PUBLIC_KEY:          str(),
		JWT_PRIVATE_REFRESH_KEY: str(),
		JWT_PUBLIC_REFRESH_KEY:  str(),
		GOOGLE_CLIENT_ID:        str(),
		GOOGLE_CLIENT_SECRET:    str(),
		GOOGLE_REDIRECT_URL:     str(),
		FRONTEND_REDIRECT_URL:   str(),
		LANDING_REDIRECT_URL:    str(),
		BACKEND_URL:             str(),
		CONTRACTOR_REDIRECT_URL: str(),
		CLIENT_REDIRECT_URL:     str(),
		OAUTH_SUCCESS_ROUTE:     str(),
		OAUTH_FAILTURE_ROUTE:    str(),
		BREVO_API_KEY:           str(),
		AWS_S3_REGION:           str(),
		AWS_ACCESS_KEY:          str(),
		AWS_SECRET_ACCESS_KEY:   str(),
		AWS_BUCKET_NAME:         str(),
		EMAIL_USER:              str(),
		EMAIL_PASS:              str(),
		SUPER_ADMIN_EMAIL:       str(),
		SUPER_ADMIN_PASSWORD:    str(),
		STRIPE_CLIENT_ID:        str(),
		ESOFT_API_URL:           str(),
		ESOFT_API_KEY:           str(),
		ESOFT_CLIENT_ID:         str(),
	},)
}
