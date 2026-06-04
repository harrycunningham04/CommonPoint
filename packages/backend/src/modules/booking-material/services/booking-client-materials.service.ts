import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { ContractorSkillNama, MaterialTypeContent,} from '@prisma/client'
import { BookingStatus, MaterialRawType, } from '@prisma/client'
import type { BookingMaterialsQueryDtoClient, } from '../dto/booking-get-materials.dto'
import { BookingGroupService, } from '../../booking-group/booking-group.service'
import {
	ClientBookingInfoDto,
	ClientBookingMaterialCountDto,
	ClientBookingMaterialDto,
} from '../dto/get-client-materials.dto'
import { transformContentType, transformFromSkills, transformToClientContentType, } from '../utils/transform-content-type'
import { UploadService, } from '../../upload/upload.service'
import { getFileNameFromUrl, } from '../utils/get-file-name-from-url.utill'
import type { DownloadClientMaterialsDtoQuery, } from '../dto/download-client-materials.dto'
@Injectable()
export class BookingClientMaterialsService {
	constructor(
    private readonly prisma: PrismaService,
    private readonly bookingGroupService: BookingGroupService,
	private readonly uploadService: UploadService,
	) {}

	public async getBookingMaterials(
		bookingGroupId: string,
		query: BookingMaterialsQueryDtoClient,
	): Promise<ClientBookingMaterialDto> {
		const uniqueSkills =
		await this.bookingGroupService.getUniqueSkillsFromGroup(bookingGroupId,)

		const contentType = transformContentType(query.contentType,)
		const contentTypeFromSkills = transformFromSkills(uniqueSkills.map((skill,) => {
			return skill.name as ContractorSkillNama
		},),)

		const bookingWithMaterials = await this.prisma.booking.findMany({
			where: {
				bookingGroupId,
				booking_status: {
					equals: BookingStatus.DONE,
				},
			},
			select: {
				editedMaterial: {
					include: {
						EditedMaterialVote: true,
						clientPhoto:        true,
					},
					where: {
						contentType,
					},
				},
				rawMaterial: {
					include: {
						RawMaterialVote: true,
					},
					where: {
						rawType: MaterialRawType.RAW_ADDITIONAL,
					},
				},
			},
		},)

		const materialsCount = await Promise.all(
			contentTypeFromSkills.map(async(contentType,) => {
				const count = await this.prisma.editedMaterial.count({
					where: {
						contentType,
						booking: {
							bookingGroupId,
							booking_status: BookingStatus.DONE,
						},
					},
				},)

				const clientType = transformToClientContentType(contentType,)

				return {
					type:     clientType,
					uploaded: count,
				}
			},),
		)

		const bookingInfo = await this.bookingGroupService.getBookingInfo(
			bookingGroupId,
		)

		const editedMaterials = bookingWithMaterials.flatMap((booking,) => {
			return booking.editedMaterial
		},)
		const additionalRawMaterials = bookingWithMaterials.flatMap((booking,) => {
			return booking.rawMaterial
		},)
		return {
			bookingInfo: new ClientBookingInfoDto({
				id:       bookingInfo.id,
				address:  bookingInfo.address ?? '',
				dateTime: bookingInfo.date_time.toISOString(),
				uniqueSkills,
			},),
			requiredMaterials:
        ClientBookingMaterialDto.castRequiredMaterials(uniqueSkills,),
			editedMaterials: editedMaterials.map((material,) => {
				return ClientBookingMaterialDto.castEdited(material,)
			},),

			additionalRawMaterials: additionalRawMaterials.map((material,) => {
				return ClientBookingMaterialDto.castRaw(material,)
			},),
			materialsCount: ClientBookingMaterialCountDto.castMaterialsInfo(materialsCount,),
		}
	}

	public async changeHeroShoot(materialId: string,): Promise<void> {
		const material = await this.prisma.editedMaterial.findUnique({
			where:  { id: materialId, },
			select: {
				id:        true,
				bookingId: true,
			},
		},)

		if (!material) {
			throw new NotFoundException('Material not found',)
		}

		await this.prisma.editedMaterial.updateMany({
			where: {
				bookingId:   material.bookingId,
				isHeroShoot: true,
			},
			data: {
				isHeroShoot: false,
			},
		},)

		await this.prisma.editedMaterial.update({
			where: {
				id: material.id,
			},
			data: {
				isHeroShoot: true,
			},
		},)
	}

	public async downloadAllMaterials(bookingGroupId: string, query: DownloadClientMaterialsDtoQuery,): Promise<{ urls: Array<string>, fileNames: Array<string>, }> {
		let contentType: MaterialTypeContent | undefined

		if (query.contentType) {
			contentType = transformContentType(query.contentType,)
		}

		const booking = await this.prisma.booking.findMany({
			where:  { bookingGroupId, },
			select: {
				editedMaterial: {
					where: {
						contentType,
						id: {
							in: query.materialsId,
						},
					},
				},
			},
		},)

		const materials = booking.flatMap((booking,) => {
			return booking.editedMaterial
		},)

		const urls = await this.uploadService.getSignedUrlsData(materials.map((material,) => {
			return getFileNameFromUrl(material.url,)
		},),)

		return {
			urls,
			fileNames: materials.map((material,) => {
				return material.name
			},),
		}
	}
}
