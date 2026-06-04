import axios from 'axios'

export async function getFileSize(url: string,): Promise<number | null> {
	try {
		const response = await axios.head(url,)
		const size = response.headers['content-length']
		return size ?
			parseInt(size, 10,) :
			null
	} catch (error) {
		console.warn(`Unable to get file size for ${url}:`, (error).message,)
		return null
	}
}
