export const generateCouponCode = (): string => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let code = ''
	for (let i = 0; i < 8; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length,)
		code = code + charset[randomIndex]
	}
	return code
}
