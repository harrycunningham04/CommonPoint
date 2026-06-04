/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import {
	BookingStage,
	BookingStatus,
	MaterialTypeContent,
	type EditedMaterial,
	type Prisma,
} from '@prisma/client'
import { ESoftService, } from '../esoft/esoft.service'
import type { ICreateEditMaterialOrderLine, } from '../esoft/esoft.types'

@Injectable()
export class EditMaterialService {
	constructor(
        private readonly prisma: PrismaService,
        private readonly eSoftService: ESoftService,
	) {}

	public async getMaterials({
		where,
	}: {
        where: Prisma.EditedMaterialWhereInput
    },): Promise<Array<EditedMaterial>> {
		return this.prisma.editedMaterial.findMany({
			where,
		},)
	}

	public async editMaterials(bookingId: string,isAdditional: boolean = false,): Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where: {
				id: bookingId,
			},
			include: {
				rawMaterial:          true,
				BookingToProductType: {
					include: {
						productType: {
							include: {
								adjustments:       true,
								additionalProduct: {
									include: {
										contractor: true,
									},
								},
							},
						},
					},
				},
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const rawMaterials = booking.rawMaterial

		const productTypes = booking.BookingToProductType.map(
			(bookingToProductType,) => {
				return bookingToProductType.productType
			},
		)

		const photos = rawMaterials.filter((material,) => {
			return material.contentType === MaterialTypeContent.PHOTOS
		},)

		const videos = rawMaterials.filter((material,) => {
			return material.contentType === MaterialTypeContent.VIDEOS
		},)

		const editedPhotosQuantity = productTypes.reduce((acc, cur,) => {
			return cur.adjustments?.type === 'PHOTOS' &&
                cur.additionalProduct?.contractor?.email === 'esoft@mail.com' ?
				acc + cur.adjustments.value :
				acc
		}, 0,)

		const editedVideosQuantity = productTypes.reduce((acc, cur,) => {
			return cur.adjustments?.type === 'CLIPS' &&
                cur.additionalProduct?.contractor?.email === 'esoft@mail.com' ?
				acc + cur.adjustments.value :
				acc
		}, 0,)

		const editMaterialsOrders: Array<ICreateEditMaterialOrderLine> = []

		if ((editedPhotosQuantity > 0 || isAdditional) && photos.length > 0) {
			editMaterialsOrders.push({
				type:      'PHOTO',
				materials: photos.map((photo,) => {
					return {
						name: photo.name,
						size: photo.fileSize ?? 0,
						url:  photo.url,
					}
				},),
				quantity: isAdditional ?
					photos.length :
					editedPhotosQuantity,
			},)
		}

		if (editedVideosQuantity > 0 && videos.length > 0) {
			editMaterialsOrders.push({
				type:      'VIDEO',
				materials: videos.map((video,) => {
					return {
						name: video.name,
						size: video.fileSize ?? 0,
						url:  video.url,
					}
				},),
				quantity: editedVideosQuantity,
			},)
		}

		if (editMaterialsOrders.length > 0) {
			await this.eSoftService.editMaterials(
				bookingId,
				editMaterialsOrders,
			)
		} else {
			await this.prisma.booking.update({
				where: {
					id: bookingId,
				},
				data: {
					booking_stage:  [...booking.booking_stage, BookingStage.PHOTOS_DELIVERED,],
					booking_status: BookingStatus.IN_REVIEW,
				},
			},)
		}
	}

	public async deleteEditMaterials(bookingId:string, contentType: MaterialTypeContent,) {
		await this.prisma.editedMaterial.deleteMany({
			where: {
				bookingId,
				contentType,
			},
		},)
	}

	public async updateEditMaterialCorrection(editMaterialId: string, isCorrection: boolean,) {
		await this.prisma.editedMaterial.update({
			where: {
				id: editMaterialId,
			},
			data: { isCorrection, },
		},)
	}
}
