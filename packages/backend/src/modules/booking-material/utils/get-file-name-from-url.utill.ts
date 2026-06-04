export const getFileNameFromUrl = (url: string,): string => {
	const urlParts = url.split('/',)
	const fileName = urlParts[urlParts.length - 1]
	return fileName !== undefined ?
		fileName :
		''
}