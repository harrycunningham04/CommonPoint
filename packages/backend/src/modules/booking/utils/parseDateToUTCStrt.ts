export const parseDateToUTCStart = (isoDate: string): Date => {
	const date = new Date(isoDate)
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}
