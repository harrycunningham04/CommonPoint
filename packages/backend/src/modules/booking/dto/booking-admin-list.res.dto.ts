/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested, } from 'class-validator'

import { ApiProperty, } from '@nestjs/swagger'
import type { B2BClients, B2CClients, Booking, Contractor, Worker,} from '@prisma/client'
import { BookingStage,} from '@prisma/client'
import { BookingType,} from '@prisma/client'
import { BookingStatus, ClientStatus, } from '@prisma/client'
import { SkillDto, } from './booking-mobile-res.dto'
import { BookingUniqueSkills, } from './single-booking-res.dto'
import type { IProductTypeBooking, } from '../booking.types'
import { Type, } from 'class-transformer'

export class BookingAdminListResDto {
	constructor(data?:BookingAdminListResDto,) {
		if (data) {
			this.id = data.id
			this.clientFullName = data.clientFullName
			this.clientPhone = data.clientPhone
			this.priority = data.priority
			this.dateTime = data.dateTime
			this.address = data.address
			this.contractorFullName = data.contractorFullName
			this.contractorPhone = data.contractorPhone
			this.contractorAvatar = data.contractorAvatar
			this.status = data.status
			this.archived = data.archived
			this.contractorId = data.contractorId
			this.clientId = data.clientId
			this.bookingType = data.bookingType
			this.bookingStage = data.bookingStage
			this.price = data.price
			this.uniqueSkills = data.uniqueSkills

			this.duration = data.duration
			this.durationInMinutes = data.durationInMinutes
		}
	}

	@ApiProperty({
		description: 'Id of booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'Id of contractor',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public contractorId!: string

	@ApiProperty({
		description: 'Id of client',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public clientId!: string

	@ApiProperty({
		description: 'Full name of client',
		example:     'John Doe',
	},)
	@IsString()
	@IsNotEmpty()
	public clientFullName!: string

	@ApiProperty({
		description: 'Phone of client',
		example:     '+79991234567',
	},)
	@IsString()
	@IsNotEmpty()
	public clientPhone!: string

	@ApiProperty({
		description: 'Priority of booking',
		example:     'High',
	},)
	@IsString()
	@IsNotEmpty()
	public priority!: string

	@ApiProperty({
		description: 'Date and time of booking',
		example:     '2021-01-01T00:00:00.000Z',
	},)
	@IsString()
	@IsNotEmpty()
	public dateTime!: string

	@ApiProperty({
		description: 'Address of booking',
		example:     '123 Main St, Anytown, USA',
	},)
	@IsString()
	@IsNotEmpty()
	public address!: string

	@ApiProperty({
		description: 'Full name of contractor',
		example:     'John Doe',
	},)
	@IsString()
	@IsNotEmpty()
	public contractorFullName!: string

	@ApiProperty({
		description: 'Phone of contractor',
		example:     '+79991234567',
	},)
	@IsString()
	@IsNotEmpty()
	public contractorPhone!: string

	@ApiProperty({
		description: 'Avatar of contractor',
		example:     'https://example.com/avatar.png',
	},)
	@IsString()
	public contractorAvatar!: string

	@ApiProperty({
		description: 'Status of booking',
		example:     BookingStatus.AWAITING_PAYMENT,
	},)
	@IsNotEmpty()
	@IsEnum(BookingStatus,)
	public status!: BookingStatus

	@ApiProperty({
		description: 'Archived of booking',
		example:     false,
	},)
	@IsBoolean()
	@IsNotEmpty()
	public archived!: boolean

	@ApiProperty({
		description: 'The booking type',
		type:        BookingType,
	},)
	@IsEnum(BookingType,)
	@IsNotEmpty()
	public bookingType!: BookingType

	@ApiProperty({
		description: 'The booking stage',
		type:        BookingStage,
	},)
	@IsEnum(BookingStage,)
	public bookingStage!: Array<BookingStage>

	@ApiProperty({
		description: 'The price of booking',
		example:     '100',
	},)
	@IsString()
	public price!: string

	@ApiProperty({
		type:        Array<SkillDto>,
		description: 'The unique skills of the booking',
	},)
	@IsArray()
	@Type(() => {
		return SkillDto
	},)
	@ValidateNested({ each: true, },)
	public uniqueSkills!: Array<SkillDto>

	@ApiProperty({
		description: 'The duration of the booking',
		example:     '100',
	},)
	@IsNumber()
	public duration!: number

	@ApiProperty({
		description: 'The duration in minutes of the booking',
		example:     '100',
	},)
	@IsNumber()
	public durationInMinutes!: number

	public static cast(booking: Booking & {b2CClients?: B2CClients | null, contractor?: Contractor | null,b2BClients?: B2BClients | null, worker?: Worker | null,BookingToProductType: Array<{
		productType: IProductTypeBooking['productType'],
	}>},): BookingAdminListResDto {
		const client = booking.b2CClients ?? booking.b2BClients ?? booking.worker!

		return new BookingAdminListResDto({
			id:                 booking.id,
			clientFullName:     `${client.firstName} ${client.lastName}`,
			clientPhone:        client.phoneNumber,
			address:            booking.address ?? '',
			contractorFullName: `${booking.contractor?.name} ${booking.contractor?.surname}`,
			contractorPhone:    booking.contractor?.phone ?? '',
			status:             booking.booking_status,
			priority:           'officeStatus' in client ?
				(client.officeStatus === ClientStatus.PRIORITIZED ?
					'High priority' :
					'Standard') :
				'Standard',
			dateTime:           booking.date_time.toISOString(),
			archived:           booking.archived,
			contractorId:       booking.contractorId ?? '',
			clientId:           client.id,
			bookingType:        booking.bookingType,
			bookingStage:       booking.booking_stage,
			price:              booking.total_sum,
			uniqueSkills:      BookingUniqueSkills.getUniqueSkills(booking,),
			duration:           booking.duration ?? 0,
			durationInMinutes:  booking.durationInMinutes ?? 0,
			contractorAvatar:   booking.contractor?.avatar ?? '',
		},)
	}
}
