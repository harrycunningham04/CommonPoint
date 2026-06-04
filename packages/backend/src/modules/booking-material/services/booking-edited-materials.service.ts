/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { AddEditedMaterialsDto, } from '../dto/add-edited-material.dto'
import { BookingStatus, EditRequestStatus, type Prisma, } from '@prisma/client'
import {
	BookingAdminEditedMaterialsDto,
	BookingAdminEditedMaterialsDtoResponse,
	BookingRawMaterialDtoResponse,
} from '../dto/booking-admin-material.dto'
import { SelectBookingSkills, } from 'src/modules/booking/booking.const'
import { MaterialTypeContent, } from 'src/modules/booking/booking.types'
import { UploadService, } from 'src/modules/upload/upload.service'
@Injectable()
export class BookingEditedMaterialsService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
	) {}

	public async getBookingEditedMaterials(
		bookingId: string,
	): Promise<BookingAdminEditedMaterialsDtoResponse> {
		const booking = await this.prisma.booking.findUnique({
			where:   { id: bookingId, },
			include: {
				...SelectBookingSkills,
				EditRequest: {
					where: {
						status: EditRequestStatus.ACTIVE,
					},
				},
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const editedMaterials = await this.prisma.editedMaterial.findMany({
			where: {
				bookingId,
				OR: [
					{
						booking: {
							booking_status: {
								in: [BookingStatus.IN_REVIEW, BookingStatus.DONE,],
							},
						},
					},
					{
						isAdminUploaded: true,
					},
				],
			},
			include: {
				editRequest: true,
			},
		},)

		return new BookingAdminEditedMaterialsDtoResponse({
			materialsRequired: BookingRawMaterialDtoResponse.castBooking(
				booking,
				true,
			),
			editedMaterials: editedMaterials.map((material,) => {
				return new BookingAdminEditedMaterialsDto({
					id:            material.id,
					url:           material.url,
					fileSize:      material.fileSize ?? 0,
					contentType:   material.contentType,
					name:          material.name,
					editRequest:   material.editRequest ?? null,
					isEditRequest: Boolean(material.editRequest,),
				},)
			},),
			materialsRequested:
        BookingAdminEditedMaterialsDtoResponse.castMaterialsRequested(
				booking.EditRequest,
        		editedMaterials,
        ),
		},)
	}

	public async addBookingEditedMaterials(
		bookingId: string,
		materials: AddEditedMaterialsDto,
	): Promise<Array<BookingAdminEditedMaterialsDto>> {
		const booking = await this.prisma.booking.findUnique({
			where: { id: bookingId, },
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const createManyMaterials: Array<Prisma.EditedMaterialCreateManyInput> = []

		if (materials.isReplace) {
			await this.deleteEditedSketches(bookingId,)
		}

		for (const material of materials.materials) {
			createManyMaterials.push({
				...material,
				bookingId,
			},)
		}

		const editedMaterials = await this.prisma.editedMaterial.createMany({
			data: createManyMaterials,
		},)

		const editedMaterialsResponse = await this.prisma.editedMaterial.findMany({
			where:   { bookingId, },
			include: {
				editRequest: true,
			},
		},)

		return editedMaterialsResponse.map((material,) => {
			return new BookingAdminEditedMaterialsDto({
				id:            material.id,
				url:           material.url,
				fileSize:      material.fileSize ?? 0,
				contentType:   material.contentType,
				name:          material.name,
				editRequest:   material.editRequest ?? null,
				isEditRequest: Boolean(material.editRequest,),
			},)
		},)
	}

	public async deleteBookingEditedMaterial(materialId: string,) {
		const material = await this.prisma.editedMaterial.findUnique({
			where: { id: materialId, },
		},)

		if (!material) {
			throw new NotFoundException('Material not found',)
		}

		await this.prisma.editedMaterial.delete({
			where: { id: materialId, },
		},)
	}

	public async deleteEditedSketches(bookingId: string,) {
		const booking = await this.prisma.booking.findUnique({
			where:   { id: bookingId, },
			include: {
				editedMaterial: {
					where: {
						contentType: MaterialTypeContent.SKETCHES,
					},
				},
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		if (booking.editedMaterial.length === 0) {
			throw new NotFoundException('No sketches found for this booking',)
		}


		await this.prisma.editedMaterial.deleteMany({
			where: { bookingId, contentType: MaterialTypeContent.SKETCHES, },
		},)
	}
}
