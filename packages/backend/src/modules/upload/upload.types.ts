export type UploadedFile = {
	url: string
	name: string
	contentType:string
}

export const mimeTypes: Record<string, string> = {
	txt:   'text/plain',
	html:  'text/html',
	jpeg:  'image/jpeg',
	jpg:   'image/jpeg',
	png:   'image/png',
	gif:   'image/gif',
	mp4:   'video/mp4',
	pdf:   'application/pdf',
	other: 'application/octet-stream',
}
