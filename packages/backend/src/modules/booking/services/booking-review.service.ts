/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { forwardRef, Inject, Injectable, NotFoundException, } from '@nestjs/common'
import type { Prisma,} from '@prisma/client'
import { ClientDisputeCategory, EditRequestStatus,} from '@prisma/client'
import { ESoftOrderType, ESoftProductTypes, MaterialTypeContent,} from '@prisma/client'
import { BookingStatus, EditRequestType, type Booking, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import type { CreateClientEditRequestDto, CreateEditRequestDto, } from '../dto/create-edit-request.dto'
import type { Express, } from 'express'
import { UploadService, } from '../../upload/upload.service'
import { BookingContractorService, } from './booking-contractor.service'
import { ESoftService, } from '../../esoft/esoft.service'
import { EditMaterialService, } from 'src/modules/edit-material/edit-material.service'
import { ClientBasicService, } from 'src/modules/clients/services/client-basic.service'
import { ClientDisputeService, } from 'src/modules/disputes/services/client-dispute.service'
import { ClientType, } from 'src/modules/clients/types/client.types'
@Injectable()
export class BookingReviewService {
	constructor(
        private readonly prisma: PrismaService,
        private readonly uploadService: UploadService,
		@Inject(forwardRef(() => {
			return BookingContractorService
		},),)
		private readonly bookingContractorService: BookingContractorService,
		private readonly esoftService: ESoftService,
		private readonly editMaterialService: EditMaterialService,
		private readonly clientBasicService: ClientBasicService,
		private readonly clientDisputeService: ClientDisputeService,
	) {}

	public async markBookingAsCompleted(bookingId: string,) {
		const booking = await this.prisma.booking.findFirst({
			where: { id: bookingId, },
		},)
		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		if (booking.isEditRequest) {
			await this.resolveEditRequest(booking,)
		}

		return this.prisma.booking.update({
			where: { id: bookingId, },
			data:  {
				booking_status: 'DONE',
			},
		},)
	}

	public async createEditRequest(
		bookingId: string,
		dto: CreateEditRequestDto,
	) {
		const booking = await this.prisma.booking.findFirst({
			where: { id: bookingId, },
		},)
		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		if (booking.isEditRequest) {
			await this.resolveEditRequest(booking,)
		}

		await this.prisma.booking.update({
			where: { id: booking.id, },
			data:  {
				booking_status: 'BOOKED',
				isEditRequest:  true,
			},
		},)

		if (dto.type === EditRequestType.SINGLE) {
			const editRequestSession = await this.prisma.editRequestSession.create({
				data: {
					bookingId,
				},
			},)
			await Promise.all(
				(dto.requestedChanges ?? []).map(async(requestedChange,) => {
					const eSoftOrderLineId = await this.getEsoftOrderLinesFromMaterialId(requestedChange.editedMaterialId,bookingId,)
					const editRequest = await this.prisma.editRequest.create({
						data: {
							editedMaterialId: requestedChange.editedMaterialId,
							requestedChange:  requestedChange.requestedChange,
							adminId:          dto.adminId,
							sessionId:        editRequestSession.id,
							orderLineId:      eSoftOrderLineId,
						},
					},)

					await this.editMaterialService.updateEditMaterialCorrection(requestedChange.editedMaterialId, true,)

					await this.createEditRequestMaterialSingle(editRequest.id,requestedChange.editedMaterialId,)
				},),
			)
			await this.esoftService.createEditCorrectionOrder(editRequestSession.id,)
		} else if (dto.type === EditRequestType.GROUP_BY_CONTENT_TYPE && dto.groupChanges) {
			const groupedEditedRequest = await this.prisma.editRequest.create({
				data: {
					contentType:     dto.groupChanges.contentType,
					requestedChange: dto.groupChanges.requestedChange,
					bookingId,
					type:            EditRequestType.GROUP_BY_CONTENT_TYPE,
					adminId:         dto.adminId,
				},
			},)

			await this.createEditRequestMaterials(bookingId,groupedEditedRequest.id,dto.groupChanges.contentType,)
		}

		await this.bookingContractorService.updateBookingStatus(booking.contractorId ?? '', bookingId, BookingStatus.BOOKED,)
	}

	public async getEsoftOrderLinesFromMaterialId(materialId: string,bookingId: string,): Promise<string> {
		const editedMaterial = await this.prisma.editedMaterial.findFirst({
			where: { id: materialId, },
		},)

		const eSoftOrderLineId: string | null = null

		if (!editedMaterial) {
			throw new NotFoundException('Edited material not found',)
		}

		const materialEditRequest = await this.prisma.editRequest.findFirst({
			where: {
				editedMaterialId: editedMaterial.id,
				type:             EditRequestType.SINGLE,
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: {
				orderLineId: true,
			},
		},)

		// if (!materialEditRequest?.orderLineId) {
		// 	const eSoftOrderLine = await this.prisma.eSoftOrder.findFirst({
		// 		where: {
		// 			reference: bookingId,
		// 		},
		// 		include: {
		// 			orderLines: {
		// 				where: {
		// 					type: editedMaterial.contentType === MaterialTypeContent.PHOTOS ?
		// 						eSoftProductTypes.PHOTO :
		// 						eSoftProductTypes.VIDEO,
		// 				},
		// 			},
		// 		},
		// 	},)

		// 	if (!eSoftOrderLine) {
		// 		throw new NotFoundException('Esoft order not found',)
		// 	}

		// 	eSoftOrderLineId = eSoftOrderLine.orderLines[0]?.id ?? null
		// }

		const eSoftOrderLine = await this.prisma.eSoftOrder.findFirst({
			where: {
				reference: bookingId,
				type:      ESoftOrderType.ORDER,
			},
			include: {
				orderLines: {
					where: {
						type: editedMaterial.contentType === MaterialTypeContent.PHOTOS ?
							ESoftProductTypes.PHOTO :
							ESoftProductTypes.VIDEO,
					},
				},
			},
		},)

		if (!eSoftOrderLine || !eSoftOrderLine.orderLines[0]?.id) {
			throw new NotFoundException('Esoft order line not found',)
		}

		return eSoftOrderLine.orderLines[0]?.id
	}

	public async createEditRequestMaterials(bookingId: string, editRequestId: string, contentType: MaterialTypeContent,) {
		const editRequestMaterials = await this.prisma.editedMaterial.findMany({
			where: {
				bookingId,
				contentType,
			},
		},)

		if (editRequestMaterials.length === 0) {
			throw new NotFoundException('Materials not found',)
		}

		const createManyEditRequestMaterials : Array<Prisma.EditRequestMaterialCreateManyInput> = editRequestMaterials.map((material,) => {
			return {
				editRequestId,
				name:         material.name,
				url:          material.url,
				thumbnailUrl: material.thumbnailUrl,
				contentType:  material.contentType,
				fileSize:     material.fileSize,
				mimetype:     material.mimetype,
			}
		},)

		await this.prisma.editRequestMaterial.createMany({
			data: createManyEditRequestMaterials,
		},)
	}

	public async createEditRequestMaterialSingle(editRequestId: string, editMaterialId: string,) {
		const editMaterial = await this.prisma.editedMaterial.findFirst({
			where: { id: editMaterialId, },
		},)

		if (!editMaterial) {
			throw new NotFoundException('Edit material not found',)
		}

		await this.prisma.editRequestMaterial.create({
			data: {
				editRequestId,
				name:         editMaterial.name,
				url:          editMaterial.url,
				thumbnailUrl: editMaterial.thumbnailUrl,
				contentType:  editMaterial.contentType,
				fileSize:     editMaterial.fileSize,
				mimetype:     editMaterial.mimetype,
			},
		},)
	}

	public async updateEditRequestStatus(bookingId: string, status: EditRequestStatus,) {
		const editRequests = await this.prisma.editRequest.findMany({
			where: { bookingId, },
		},)
		if (editRequests.length === 0) {
			return
		}

		await this.prisma.editRequest.updateMany({
			where: { bookingId, },
			data:  { status, },
		},)
	}

	public async uploadEditRequestMaterial(
		editRequestId: string,
		file: Express.Multer.File,
	) {
		const editRequest = await this.prisma.editRequest.findFirst({
			where:   { id: editRequestId, },
			include: { editRequestMaterials: true, },
		},)

		if (!editRequest) {
			throw new NotFoundException('Photo not found',)
		}

		if (editRequest.editRequestMaterials.length > 0) {
			try {
				await this.uploadService.deleteFile(
					editRequest.editRequestMaterials[0]?.url!,
				)
			} catch (error) {
				console.error(error,)
			}
			await this.prisma.editRequestMaterial.delete({
				where: {
					id: editRequest.editRequestMaterials[0]?.id,
				},
			},)
		}

		const uploadedUrl = await this.uploadService.uploadFile(
			file.originalname,
			file.buffer,
		)
		const createdMaterial = await this.prisma.editRequestMaterial.create({
			data: {
				editRequestId,
				mimetype:  file.mimetype,
				fileSize:  file.size,
				name:      file.originalname,
				url:       uploadedUrl,
			},
		},)

		return createdMaterial
	}

	public async deleteEditRequestMaterial(id: string,) {
		const material = await this.prisma.editRequestMaterial.findFirst({
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

		await this.prisma.editRequestMaterial.delete({ where: {
			id: material.id,
		},},)
	}

	private async resolveEditRequest(booking: Booking,) {
		if (!booking.isEditRequest) {
			return
		}
		const editRequestMaterials =
            await this.prisma.editRequestMaterial.findMany({
            	where: {
            		editRequest: {
            			editedMaterial: {
            				bookingId: booking.id,
            			},
            		},
            	},
            	select: {
            		name:         true,
            		url:          true,
            		thumbnailUrl: true,
            		contentType:  true,
            		fileSize:     true,
            		mimetype:     true,
            		editRequest:  {
            			select: {
            				editedMaterialId: true,
            			},
            		},
            	},
            },)

		await Promise.all(
			editRequestMaterials.map(async(material,) => {
				return this.prisma.editedMaterial.update({
					where: { id: material.editRequest.editedMaterialId ?? undefined, },
					data:  {
						name:        material.name,
						url:         material.url,
						fileSize:    material.fileSize,
						contentType: material.contentType,
						mimetype:    material.mimetype,
					},
				},)
			},),
		)

		await this.prisma.editRequest.deleteMany({
			where: {
				editedMaterial: {
					bookingId: booking.id,
				},
			},
		},)

		await this.prisma.booking.update({
			where: { id: booking.id, },
			data:  { isEditRequest: false, },
		},)
	}

	public async getBookingActiveSingleEditRequest(bookingId: string,):Promise<boolean> {
		const editRequest = await this.prisma.editRequest.findFirst({
			where: { bookingId, type: EditRequestType.SINGLE, status: EditRequestStatus.ACTIVE, }, select: {id: true,},
		},)
		return Boolean(editRequest,)
	}

	public async createClientEditRequest(clientId:string,dto:CreateClientEditRequestDto,) {
		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		const clientDispute = await this.clientDisputeService.createClientDispute({
			category:       ClientDisputeCategory.BOOKING_ISSUE,
			bookingGroupId: dto.bookingGroupId,
			description:    dto.requestedChanges?.map((change,) => {
				return change.requestedChange
			},).join(', ',),
			b2BClientId:    clientType === ClientType.B2B ?
				clientId :
				undefined,
			b2CClientId:    clientType === ClientType.B2C ?
				clientId :
				undefined,
		},)
		const bookingId = dto.requestedChanges?.[0]?.bookingId!

		if (dto.type === EditRequestType.SINGLE) {
			const editRequestSession = await this.prisma.editRequestSession.create({
				data: {
					bookingId,
				},
			},)

			await Promise.all(
				(dto.requestedChanges ?? []).map(async(requestedChange,) => {
					const editRequest = await this.prisma.editRequest.create({
						data: {
							editedMaterialId: requestedChange.editedMaterialId,
							requestedChange:  requestedChange.requestedChange,
							sessionId:        editRequestSession.id,
							clientDisputeId:  clientDispute.id,
						},
					},)
					await this.createEditRequestMaterialSingle(editRequest.id,requestedChange.editedMaterialId,)
				},),
			)
		} else if (dto.type === EditRequestType.GROUP_BY_CONTENT_TYPE && dto.groupChanges) {
			const bookingId = dto.groupChanges.bookingId!
			const groupedEditedRequest = await this.prisma.editRequest.create({
				data: {
					contentType:     dto.groupChanges.contentType,
					requestedChange: dto.groupChanges.requestedChange,
					clientDisputeId: clientDispute.id,
				},
			},)
			await this.createEditRequestMaterials(bookingId,groupedEditedRequest.id,dto.groupChanges.contentType,)
		}
	}
}
