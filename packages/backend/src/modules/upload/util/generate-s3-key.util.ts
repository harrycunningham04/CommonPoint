import { v4 as uuid4, } from 'uuid'

export const generateS3Key = (originalFileName: string,): string => {
	const extensionMatch = (/\.[^/.]+$/).exec(originalFileName,)
	const extension = extensionMatch ?
		extensionMatch[0] :
		''

	const baseName = originalFileName
		.replace(extension, '',)
		.replace(/[^\w\d_-]/g, '_',)
		.replace(/_+/g, '_',)
		.toLowerCase()
		.slice(0, 100,)

	const cleanFileName = `${baseName}${extension.toLowerCase()}`
	const key = `${uuid4()}-${cleanFileName}`

	return key
}