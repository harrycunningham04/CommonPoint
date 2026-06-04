/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable, } from '@nestjs/common'
import { ESoftService, } from '../esoft.service'
import { ESoftProductTypes, } from '@prisma/client'
import type { Express, } from 'express'
import { UploadService, } from '../../upload/upload.service'
import type { IMaterialHttpFile, } from '../esoft.types'
import { v4, } from 'uuid'

@Injectable()
export class ESoftTestService {
	constructor(
        private readonly esoftService: ESoftService,
        private readonly uploadService: UploadService,
	) {}

	public async createTestOrder(
		pictures: Array<Express.Multer.File>,
		videos: Array<Express.Multer.File>,
	) {
		const pictureFiles: Array<IMaterialHttpFile> = []
		const videoFiles: Array<IMaterialHttpFile> = []
		for (const file of pictures) {
			const link = await this.uploadService.uploadFile(
				file.originalname,
				file.buffer,
			)
			pictureFiles.push({
				name: file.originalname,
				url:  link,
				size: file.size,
			},)
		}
		for (const file of videos) {
			const link = await this.uploadService.uploadFile(
				file.originalname,
				file.buffer,
			)
			videoFiles.push({
				name: file.originalname,
				url:  link,
				size: file.size,
			},)
		}
		return this.esoftService.editMaterials(v4(), [{
			type:      ESoftProductTypes.PHOTO,
			materials: pictureFiles,
		}, {
			type:      ESoftProductTypes.VIDEO,
			materials: videoFiles,
		},],)
	}

	public async editMaterials(id: string,) {
		return this.esoftService.createEditCorrectionOrder(id,)
	}
}
