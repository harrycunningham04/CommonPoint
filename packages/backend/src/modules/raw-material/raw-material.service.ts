import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { RawMaterialsDto, } from './dto/floorplans.dto'
import type { Prisma, RawMaterial,} from '@prisma/client'
import type { MaterialTypeContent, } from '@prisma/client'
import type { UploadMaterialDto, } from '../booking-material/dto/upload-material.dto'

import { UploadService, } from '../upload/upload.service'

@Injectable()
export class RawMaterialService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
	) {}

	public async createOrUpdateRawMaterial(data: RawMaterialsDto, materialType: MaterialTypeContent,): Promise<void> {
		const rawMaterialsWithId = data.rawMaterials.filter((it,) => {
			return it.id
		},)

		await this.prisma.rawMaterial.deleteMany({
			where: {
				bookingId: data.id,
				NOT:       {
					id: {
						in: rawMaterialsWithId.filter((item,) => {
							return item.id
						},).map((item,) => {
							return item.id ?? ''
						},),
					},
				},
			},
		},)

		const rawMaterialsToUpload = await Promise.all(data.rawMaterials.map(async(item,) => {
			if (item.url.startsWith('http',)) {
				return item
			}
			const key = `${data.id}-${new Date().getTime()}-${item.name}`
			const url = await this.uploadService.uploadBase64(key, item.url,)

			return {
				...item,
				url,
			}
		},),)

		await Promise.all(rawMaterialsToUpload.map(async(item,) => {
			if (!item.id) {
				return this.prisma.rawMaterial.create({
					data: {
						contentType: materialType,
						url:         item.url,
						name:        item.name,
						bookingId:   data.id,
					},
				},)
			}
			return this.prisma.rawMaterial.upsert({
				where: {
					id: item.id,
				},
				update: {
					contentType: materialType,
					url:         item.url,
					name:        item.name,
					bookingId:   data.id,
				},
				create: {
					contentType: materialType,
					url:         item.url,
					name:        item.name,
					bookingId:   data.id,
				},
			},)
		},),)
	}

	public async createManyMaterials(
		body: UploadMaterialDto,
		bookingId: string,
	): Promise<void> {
		await this.prisma.rawMaterial.createMany({
			data: body.rawMaterials.map((file,) => {
				return {
					url:         file.url,
					contentType: body.contentType,
					name:        file.name,
					fileSize:    file.fileSize,
					bookingId,
					rawType:     body.rawType,
					groupId:     file.groupId,
					takenAt:     file.takenAt,
				}
			},),
			skipDuplicates: true,
		},)
	}

	public async createManyMaterialsAdmin(
		body: Array<Prisma.RawMaterialCreateManyInput>,
	): Promise<void> {
		await this.prisma.rawMaterial.createMany({
			data: body,
		},)
	}

	public async createMaterial(data: Prisma.RawMaterialCreateInput,): Promise<RawMaterial> {
		return this.prisma.rawMaterial.create({
			data,
		},)
	}

	public async getMaterials({where,}: {where: Prisma.RawMaterialWhereInput,},): Promise<Array<RawMaterial>> {
		return this.prisma.rawMaterial.findMany({
			where,
		},)
	}
}
