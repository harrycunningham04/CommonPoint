/* eslint-disable no-mixed-spaces-and-tabs */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { BookingMaterialListDto, } from '../dto/booking-material-list.dto'
import { SelectBookingSkills, } from 'src/modules/booking/booking.const'
import type {
	BookingMaterialsQueryDto,} from '../dto/booking-get-materials.dto'
import {
	BookingBasicMaterial,
	type BookingGetMaterialsResDto,
} from '../dto/booking-get-materials.dto'
import type { UploadMaterialDto, UploadMaterialDtoForService, } from '../dto/upload-material.dto'
import type { Express, } from 'express'
import { UploadService, } from 'src/modules/upload/upload.service'
import { BookingStatus, MaterialRawType, MaterialTypeContent, type EditedMaterial, type Prisma, } from '@prisma/client'
import type { Adjustments, BookingToProductType, ProductType, ProductTypeSkills, RawMaterial, Skills, } from '@prisma/client'
import { EMaterialType, } from 'src/modules/booking/booking.types'
import { MaterialType, } from '../types/material-type'
import { BookingBasicService, } from 'src/modules/booking/services/booking-basic.service'
import { RawMaterialService, } from 'src/modules/raw-material/raw-material.service'
import { EditMaterialService, } from 'src/modules/edit-material/edit-material.service'
import path from 'path'
import type { UploadRawAdminDto, UploadRawAdminDtoForService, } from '../dto/upload-raw-admin.dto'
import { BookingAdminRawMaterialsDto, } from '../dto/booking-admin-material.dto'
import type { UpdateMaterialDto, } from '../dto/update-material.dto'
@Injectable()
export class BookingMaterialService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
	private readonly bookingBasicService: BookingBasicService,
	private readonly rawMaterialService: RawMaterialService,
	private readonly editMaterialService: EditMaterialService,
	) {}

	public async getJobsMaterial(
		contractorId: string,
		paginator: PageOptionsDto,
	): Promise<PagedResDto<BookingMaterialListDto>> {
		const bookings = await this.prisma.booking.findMany({
			where: {
				contractorId,
				booking_status: {
					notIn: [BookingStatus.CANCELED, BookingStatus.DONE,],
				},
			},
			select: {
				id:                   true,
				address:              true,
				date_time:            true,
				booking_stage:        true,
				rawMaterial:   {
					where: {
						rawType: MaterialRawType.RAW,
					},
				},
				...SelectBookingSkills,
			},
			skip:    paginator.skip,
			take:    paginator.take,
		},)

		const totalCount = await this.bookingBasicService.getCount({
			where: {
				contractorId,
			},
		},)

		return {
			data: bookings.map((booking,) => {
				// @ts-ignore
				return BookingMaterialListDto.cast(booking,)
			},),
			hasNext: totalCount > paginator.skip + paginator.take,
		}
	}

	public async getJobMaterials(
		bookingId: string,
		data: BookingMaterialsQueryDto,
	): Promise<BookingGetMaterialsResDto> {
		const [rawMaterials, rawAdditionalMaterials,] = await Promise.all([
			this.rawMaterialService.getMaterials({where: {
				bookingId,
				contentType: data.contentType,
				rawType:     MaterialRawType.RAW,
			},},),
			this.rawMaterialService.getMaterials({where: {
				bookingId,
				contentType: data.contentType,
				rawType:     MaterialRawType.RAW_ADDITIONAL,
			},},),
		],)

		const bookingInfo = await this.bookingBasicService.getBookingById({
			where:   { id: bookingId, },
			include: { ...SelectBookingSkills, rawMaterial: true, },
		},)

		if (!bookingInfo) {
			throw new NotFoundException('Booking not found',)
		}

		return {
			rawMaterials:           BookingBasicMaterial.cast(rawMaterials,),
			rawAdditionalMaterials: BookingBasicMaterial.cast(rawAdditionalMaterials,),
			bookingInfo:            BookingMaterialListDto.cast({
				...bookingInfo,
				rawMaterial:          'rawMaterial' in bookingInfo ?
					bookingInfo.rawMaterial as Array<RawMaterial> :
					[],
				BookingToProductType: 'BookingToProductType' in bookingInfo ?
					bookingInfo.BookingToProductType as Array<BookingToProductType & {
						productType: ProductType & {
							adjustments: Adjustments,
							productTypeSkills: Array<ProductTypeSkills & {
								skill: Skills,
							}>,
						},
					}> :
					[],
			},),
		}
	}

	public async uploadMaterials(
		bookingId: string,
		body: UploadMaterialDto,
	): Promise<UploadMaterialDtoForService> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId, },
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		await this.rawMaterialService.createManyMaterials(body, bookingId,)

		let rawMaterials: Array<RawMaterial> = []
		let rawAdditionalMaterials: Array<RawMaterial> = []

		if (body.rawType === MaterialRawType.RAW) {
			rawMaterials = await this.rawMaterialService.getMaterials({
				where: { bookingId, rawType: MaterialRawType.RAW, contentType: body.contentType, },
			},)
		}

		if (body.rawType === MaterialRawType.RAW_ADDITIONAL) {
			rawAdditionalMaterials = await this.rawMaterialService.getMaterials({
				where: { bookingId, rawType: MaterialRawType.RAW_ADDITIONAL, contentType: MaterialTypeContent.PHOTOS, },
			},)
		}

		return { rawMaterials: rawMaterials.length > 0 ?
			BookingBasicMaterial.cast(rawMaterials,) :
			undefined,
		rawAdditionalMaterials: rawAdditionalMaterials.length > 0 ?
			BookingBasicMaterial.cast(rawAdditionalMaterials,) :
			undefined, }
	}

	public async uploadRawMaterialsAdmin(
		bookingId: string,
		body: UploadRawAdminDtoForService,
	): Promise<Array<BookingAdminRawMaterialsDto>> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId, },
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		await this.rawMaterialService.createManyMaterialsAdmin(body.rawMaterials.map((material,) => {
			return {
				bookingId,
				contentType: material.contentType,
				rawType:     material.rawType,
				url:         material.url,
				name:        material.name,
				fileSize:    material.fileSize,
			}
		},),)

		const rawMaterials = await this.rawMaterialService.getMaterials({
			where: { bookingId, },
		},)

		return rawMaterials.map((material,) => {
			return new BookingAdminRawMaterialsDto({
				id:          material.id,
				url:         material.url,
				name:        material.name,
				fileSize:    material.fileSize ?? 0,
				contentType: material.contentType,
				rawType:     material.rawType,
			},)
		},)
	}

	public async deleteMaterial(groupId: number,):Promise<void> {
		const materials = await this.prisma.rawMaterial.findMany({
			where: { groupId, },
		},)

		await Promise.all(materials.map(async(material,) => {
			return this.uploadService.deleteFile(material.url,)
		},
		),)

		await this.prisma.rawMaterial.deleteMany({
			where: { groupId, },
		},)
	}

	public async deleteMaterialSingle(materialId: string,):Promise<void> {
		const material = await this.prisma.rawMaterial.findUnique({
			where: { id: materialId, },
		},)

		if (!material) {
			throw new NotFoundException('Material not found',)
		}

		await this.uploadService.deleteFile(material.url,)

		await this.prisma.rawMaterial.delete({
			where: { id: materialId, },
		},)
	}

	public async updateMaterialGroup(groupId: number,):Promise<void> {
		const material = await this.prisma.rawMaterial.findFirst({
			where: { groupId, },
		},)

		if (!material) {
			throw new NotFoundException('Material group not found',)
		}

		await this.prisma.rawMaterial.updateMany({
			where: { groupId, },
			data:  { groupId: null, },
		},)
	}

	public async deleteAdditionalMaterials(ids: Array<string>,): Promise<void> {
		await this.prisma.rawMaterial.deleteMany({
			where: { id: { in: ids, }, },
		},)
	}

	public async updateMaterial(body: UpdateMaterialDto,):Promise<void> {
		const materials = await this.prisma.rawMaterial.findMany({
			where: { id: { in: body.materialIds, }, },
		},)

		if (materials.length !== body.materialIds.length) {
			throw new NotFoundException('Materials not found',)
		}

		await this.prisma.rawMaterial.updateMany({
			where: { id: { in: body.materialIds, }, },
			data:  { groupId: body.groupId ?
				Number(body.groupId,) :
				null, rawType: body.rawType, },
		},)
	}

	public async getMaterialsCount(bookingId: string,):Promise<{
		photos: number
		videos: number
		audios: number
	}> {
		const [photos, videos, audios,] = await Promise.all([
			this.prisma.rawMaterial.count({
				where:  { bookingId, rawType: MaterialRawType.RAW, contentType: MaterialTypeContent.PHOTOS, },
			},),
			this.prisma.rawMaterial.count({
				where:  { bookingId, rawType: MaterialRawType.RAW, contentType: MaterialTypeContent.VIDEOS, },
			},),
			this.prisma.rawMaterial.count({
				where:  { bookingId, rawType: MaterialRawType.RAW, contentType: MaterialTypeContent.AUDIOS, },
			},),
		],)

		return { photos, videos, audios, }
	}
}
