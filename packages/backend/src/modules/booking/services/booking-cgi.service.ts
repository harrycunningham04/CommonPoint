/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { UploadService, } from '../../upload/upload.service'
import type { Express, } from 'express'

@Injectable()
export class BookingCGIService {
	constructor(
        private readonly prisma: PrismaService,
        private readonly uploadService: UploadService,
	) {}

	public async uploadCGIMaterial(
		clientPhotoId: string,
		file: Express.Multer.File,
	) {
		const clientPhoto = await this.prisma.bookingCGIClientPhotos.findFirst({
			where:   { id: clientPhotoId, },
			include: { submittedMaterial: true, },
		},)

		if (!clientPhoto) {
			throw new NotFoundException('Photo not found',)
		}

		if (clientPhoto.submittedMaterial) {
			try {
				await this.uploadService.deleteFile(clientPhoto.submittedMaterial.url,)
			} catch (error) {
				console.error(error,)
			}
			await this.prisma.editedMaterial.delete({ where: {
				id: clientPhoto.submittedMaterial.id,
			},},)
		}

		const uploadedUrl = await this.uploadService.uploadFile(file.originalname, file.buffer,)
		const createdMaterial = await this.prisma.editedMaterial.create({
			data: {
				clientPhotoId,
				mimetype:  file.mimetype,
				fileSize:  file.size,
				name:      file.originalname,
				url:       uploadedUrl,
				bookingId: clientPhoto.bookingId,
			},
		},)

		return createdMaterial
	}

	public async deleteMaterial(id: string,) {
		const material = await this.prisma.editedMaterial.findFirst({
			where: { id, },
		},)
		if (!material) {
			throw new NotFoundException('Material not found',)
		}

		try {
			await this.uploadService.deleteFile(material.url,)
		} catch (error) {
			console.error(error,)
		}

		await this.prisma.editedMaterial.delete({ where: {
			id: material.id,
		},},)
	}
}
