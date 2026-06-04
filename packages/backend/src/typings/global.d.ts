declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string
        DATABASE_URL: string
        NODE_ENV: string
        JWT_PRIVATE_KEY: string
        JWT_PUBLIC_KEY: string
        JWT_PRIVATE_REFRESH_KEY: string
        JWT_PUBLIC_REFRESH_KEY: string
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        GOOGLE_REDIRECT_URL: string
        GITHUB_CLIENT_ID: string
        GITHUB_CLIENT_SECRET: string
        GITHUB_REDIRECT_URL: string
        FACEBOOK_CLIENT_ID: string
        FACEBOOK_CLIENT_SECRET: string
        FRONTEND_REDIRECT_URL: string
        LANDING_REDIRECT_URL: string
        CONTRACTOR_REDIRECT_URL: string
        CLIENT_REDIRECT_URL: string
        BACKEND_URL: string
        OAUTH_SUCCESS_ROUTE: string
        OAUTH_FAILTURE_ROUTE: string
        BREVO_API_KEY: string
        STRIPE_WEBHOOK_SECRET: string
        STRIPE_CLIENT_ID: string
        ESOFT_API_URL: string
        ESOFT_API_KEY: string
        ESOFT_CLIENT_ID: string
    }
}
