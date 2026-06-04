import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import path from 'path'
import { UploadService, } from 'src/modules/upload/upload.service'
import type { Express, } from 'express'
import type { Attachment, } from '@prisma/client'

@Injectable()
export class BookingAttachmentService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
	) {}

	public async createAttachment(
		files: Array<Express.Multer.File>,
		bookingId: string,
	): Promise<Array<Attachment>> {
		const uploadsDir = path.resolve(
			__dirname,
			'..',
			'..',
			'..',
			'..',
			'..',
			'uploads',
		)
		const attachmentPromises = files.map(async(file,): Promise<Attachment> => {
			const filePath = path.join(uploadsDir, file.filename,)

			const uploadResult = await this.uploadService.uploadLocalFileToS3(
				filePath,
				file.originalname,
			)
			const attachment = await this.prisma.attachment.create({
				data: {
					bookingId,
					name: uploadResult.name,
					url:  uploadResult.url,
					size: file.size,
				},
			},)

			return attachment
		},)
		const attachments = await Promise.all(attachmentPromises,)

		return attachments.flat()
	}

	public async getBookingAttachments(bookingId:string,):Promise<Array<Attachment>> {
		const attachments = await this.prisma.attachment.findMany({
			where: {
				bookingId,
			},
		},)

		return attachments
	}

	public async deleteAttachment(itemId:string,):Promise<{message:string}> {
		await this.prisma.attachment.delete({
			where: {
				id: itemId,
			},
		},)

		return { message: 'Attachment deleted successfully.', }
	}
}
