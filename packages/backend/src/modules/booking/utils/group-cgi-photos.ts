import type { Express, } from 'express'
import type { IProcessedPhoto, } from '../booking.types'

export const processFilesAndBody = (files: Array<Express.Multer.File>, body: any,): Array<IProcessedPhoto> => {
	console.log(body);
	
	let photos
	if (typeof body.photos === 'string') {
		try {
			photos = JSON.parse(body.photos,)
		} catch (error) {
			throw new Error('Invalid JSON in body.photos',)
		}
	} else {
		photos = body.photos
	}

	const groupedPhotos: Array<IProcessedPhoto> = photos.map((photo: any, index: number,) => {
		const fileGroup = files.filter((file,) => {
			return file.fieldname.startsWith(`photos[${index}]`,)
		},)
		return {
			mainPhoto:     photo.mainPhoto,
			description:   photo.description,
			roomType:      photo.roomType,
			file:          fileGroup.find((file,) => {
				return file.fieldname === `photos[${index}][file]`
			},),
			exapmlePhotos: fileGroup.filter((file,) => {
				return file.fieldname.startsWith(`photos[${index}][exapmlePhotos]`,)
			},),
		}
	},)

	return groupedPhotos
}