export type JWTPayload = {
    id: string
    isAdmin: boolean
    access?: number
    archived?: boolean
    iat: number
    exp: number
}

export type GenerateJWTTokenProps = {
    id: string
    isAdmin: boolean
    access?: number
    expirationTime: number
    privateKey: string
    archived?: boolean
}

export type GenerateTokensPairReturnType = {
    token: string
    refreshToken: string
}
