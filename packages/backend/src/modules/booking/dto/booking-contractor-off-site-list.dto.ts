import { ApiProperty, } from '@nestjs/swagger'
import type { Booking, BookingCGIClientPhotos,} from '@prisma/client'
import { BookingStatus, } from '@prisma/client'
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, } from 'class-validator'
import { IsString, } from 'class-validator'
import type { SkillDto, } from './booking-mobile-res.dto'
import type { IProductTypeBooking, } from '../booking.types'
import { BookingUniqueSkills, } from './single-booking-res.dto'

export class BookingContractorOffsiteListDto {
	constructor(data?:BookingContractorOffsiteListDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.status = data.status
			this.uniqueSkills = data.uniqueSkills
			this.isEdited = data.isEdited
			this.bookingCGIClientPhotos = data.bookingCGIClientPhotos
			this.dateTime = data.dateTime
			this.isEditRequest = data.isEditRequest
		}
	}

	@ApiProperty({
		description: 'The id of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The address of the booking',
		example:     '123 Main St, Anytown, USA',
	},)
	@IsString()
	@IsNotEmpty()
	public address!: string

	@ApiProperty({
		description: 'The status of the booking',
		example:     'PENDING',
	},)
	@IsEnum(BookingStatus,)
	@IsNotEmpty()
	public status!: BookingStatus

	@ApiProperty({
		description: 'The unique skills of the booking',

	},)
	@IsArray()
	@IsNotEmpty()
	public uniqueSkills!: Array<SkillDto>

	@ApiProperty({
		description: 'The is edited of the booking',
		example:     true,
	},)
	@IsBoolean()
	public isEdited!: boolean

	@ApiProperty({
		description: 'The booking cgi client photos of the booking',
		example:     [],
	},)
	@IsArray()
	@IsNotEmpty()
	public bookingCGIClientPhotos!: Array<BookingCGIClientPhotos>

	@ApiProperty({
		description: 'The date time of the booking',
		example:     '2021-01-01T00:00:00.000Z',
	},)
	@IsString()
	public dateTime!: string

	@ApiProperty({
		description: 'The is edit request of the booking',
		example:     true,
	},)
	@IsBoolean()
	public isEditRequest!: boolean

	public static cast(booking: Booking & {
		BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}>,
        EditRequest: Array<{
            id: string,
        }>,
		BookingCGIClientPhotos: Array<BookingCGIClientPhotos>,
	},): BookingContractorOffsiteListDto {
		return new BookingContractorOffsiteListDto({
			id:                     booking.id,
			address:                booking.address ?? '',
			status:                 booking.booking_status,
			uniqueSkills:           BookingUniqueSkills.getUniqueSkills(booking,),
			isEdited:               booking.EditRequest.length > 0,
			bookingCGIClientPhotos: booking.BookingCGIClientPhotos,
			dateTime:               booking.date_time.toISOString(),
			isEditRequest:          booking.isEditRequest,
		},)
	}
}
