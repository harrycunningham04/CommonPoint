import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, } from 'class-validator'
import type { Location, KeyLocation, Booking, Office,} from '@prisma/client'
import { BookingStatus, } from '@prisma/client'
import { IsNotEmpty, } from 'class-validator'
import type { BookingUniqueSkills,} from './single-booking-res.dto'
import { LocationDto, } from './single-booking-res.dto'
import type { IProductTypeBooking, } from '../booking.types'
import { transformStatusObject, } from '../utils/tranform-status'
import type { IBookingWithAllInfo, } from 'src/modules/booking-group/dto/booking-client-group.dto'
import type { SkillDto, } from './booking-mobile-res.dto'

export class HeroShootDto {
	constructor(data?:HeroShootDto,) {
		if (data) {
			this.id = data.id
			this.isHeroShoot = data.isHeroShoot
			this.url = data.url
			this.name = data.name
		}
	}

	@ApiProperty({
		description: 'The id of the hero shoot',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The is hero shoot of the hero shoot',
		example:     true,
	},)
	@IsBoolean()
	@IsNotEmpty()
	public isHeroShoot!: boolean

	@ApiProperty({
		description: 'The url of the hero shoot',
		example:     'https://www.google.com',
	},)
	@IsString()
	@IsNotEmpty()
	public url!: string

	@ApiProperty({
		description: 'The name of the hero shoot',
		example:     'Hero Shoot',
	},)
	@IsString()
	@IsNotEmpty()
	public name!: string
}

export class BookingClientListDto {
	constructor(data?:BookingClientListDto,) {
		if (data) {
			this.id = data.id
			this.status = data.status
			this.location = data.location
			this.officeName = data.officeName
			this.uniqueSkills = data.uniqueSkills
			this.dateTime = data.dateTime
			this.address = data.address
			this.hasMaterial = data.hasMaterial
			this.heroShoot = data.heroShoot
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
		description: 'The status of the booking',
		example:     BookingStatus.DONE,
	},)
	@IsEnum(BookingStatus,)
	public status!: BookingStatus | null

	@ApiProperty({
		description: 'The location of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsOptional()
	public location!: LocationDto | null

	@ApiProperty({
		description: 'The office name of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsOptional()
	public officeName?: string

	@ApiProperty({
		description: 'The unique skills of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsArray()
	public uniqueSkills!: Array<BookingUniqueSkills>

	@ApiProperty({
		description: 'The date and time of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public dateTime!: string

	@ApiProperty({
		description: 'The address of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public address!: string

	@ApiProperty({
		description: 'The has material of the booking',
		example:     true,
	},)
	@IsBoolean()
	public hasMaterial!: boolean

	@ApiProperty({
		description: 'The hero shoot of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsOptional()
	public heroShoot?: HeroShootDto | null

	public static cast(booking: IBookingWithAllInfo & {uniqueSkills:Array<SkillDto>},
		hasMaterial?: {
		hasMaterial: boolean,
		heroShoot?: { id: string; isHeroShoot: boolean; url: string; name: string },
	},): BookingClientListDto {
		const officeName = booking.office?.title
		const location = booking.location ?
			new LocationDto(booking.location,) :
			null
		return new BookingClientListDto({
			id:           booking.id,
			status:       transformStatusObject[booking.booking_status],
			location,
			officeName,
			uniqueSkills: booking.uniqueSkills,
			dateTime:     booking.date_time.toISOString(),
			address:      booking.address ?? '',
			hasMaterial:  hasMaterial?.hasMaterial ?? false,
			heroShoot:    hasMaterial?.heroShoot ?
				new HeroShootDto(hasMaterial.heroShoot,) :
				undefined,
		},)
	}
}

