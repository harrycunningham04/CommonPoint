import { PrismaService, } from 'nestjs-prisma/dist/prisma.service'
import { BookingMaterialService, } from './booking-materials.service'
import { Injectable, NotFoundException, } from '@nestjs/common'
import { BookingAdminRawMaterialsDto, BookingRawMaterialDtoResponse, } from '../dto/booking-admin-material.dto'
import { SelectBookingSkills, } from 'src/modules/booking/booking.const'

@Injectable()
export class AdminBookingMaterialsService {
	constructor(
        private readonly bookingMaterialsService: BookingMaterialService,
        private readonly prisma: PrismaService,

	) {}

	public async getBookingMaterials(bookingId: string,): Promise<BookingRawMaterialDtoResponse> {
		const [rawMaterials, bookingInfo,] = await Promise.all([
			this.prisma.rawMaterial.findMany({
				where: {
					bookingId,
				},
			},),
			this.prisma.booking.findUnique({
				where: {
					id: bookingId,
				},
				include: {
					...SelectBookingSkills,
				},
			},),
		],)

		if (!bookingInfo) {
			throw new NotFoundException('Booking not found',)
		}

		return new BookingRawMaterialDtoResponse({
			materialsRequired: BookingRawMaterialDtoResponse.castBooking(bookingInfo,),
			rawMaterials:      rawMaterials.map((material,) => {
				return new BookingAdminRawMaterialsDto({
					id:          material.id,
					url:         material.url,
					fileSize:    material.fileSize ?? 0,
					contentType: material.contentType,
					name:        material.name,
					rawType:     material.rawType,
				},)
			},),
		},)
	}
}

