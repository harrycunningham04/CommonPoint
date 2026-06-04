/* eslint-disable complexity */
/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { BookingStageHistory,} from '@prisma/client'
import { Booking, Location, PropertyAccessType,} from '@prisma/client'
import { BookingStatus, PropertyType, } from '@prisma/client'
import { IsArray, IsEnum, IsNumber, IsObject, IsString, } from 'class-validator'
import type { LocationDto, } from './single-booking-res.dto'
import type { BookingUniqueSkills, } from './single-booking-res.dto'
import type { SkillDto, } from './booking-mobile-res.dto'
import type { IBookingWithAllInfo, } from 'src/modules/booking-group/dto/booking-client-group.dto'

export class BookingGeneralInfoDto {
	constructor(data?: BookingGeneralInfoDto,) {
		if (data) {
			this.status = data.status
			this.dateTime = data.dateTime
			this.location = data.location
			this.numberOfBedrooms = data.numberOfBedrooms
			this.squareFootage = data.squareFootage
			this.propertyType = data.propertyType
			this.dateTime = data.dateTime
			this.address = data.address
			this.bookingStageHistory = data.bookingStageHistory
		}
	}

  @ApiProperty({
  	description: 'The status of the booking',
  },)
  @IsEnum(BookingStatus,)
	public status!: BookingStatus

  @ApiProperty({
  	description: 'The property type of the booking',
  },)
  @IsEnum(PropertyType,)
  public propertyType!: PropertyType | null

  @ApiProperty({
  	description: 'The location of the booking',
  },)
  @IsString()
  public location?: LocationDto | null

  @ApiProperty({
  	description: 'The number of bedrooms of the booking',
  },)
  @IsNumber()
  public numberOfBedrooms!: number

  @ApiProperty({
  	description: 'The square footage of the booking',
  },)
  @IsNumber()
  public squareFootage!: number

  @ApiProperty({
  	description: 'The date and time of the booking',
  },)
  @IsString()
  public dateTime!: string

  @ApiProperty({
  	description: 'The address of the booking',
  },)
  @IsString()
  public address!: string

  @ApiProperty({
  	description: 'The booking stage history of the booking',
  },)
  @IsArray()
  public bookingStageHistory!: Array<BookingStageHistory>
}

export class BookingKeysDetailsDto {
	constructor(data?: BookingKeysDetailsDto,) {
		if (data) {
			this.keysDateTime = data.keysDateTime
			this.alarmDetails = data.alarmDetails
			this.keyLocationAddress = data.keyLocationAddress
			this.trusteeName = data.trusteeName
			this.trusteeSurname = data.trusteeSurname
			this.trusteeContact = data.trusteeContact
			this.alarmCode = data.alarmCode
			this.propertyAccess = data.propertyAccess
		}
	}

  @ApiProperty({
  	description: 'The date and time of the booking',
  },)
  @IsString()
	public keysDateTime!: string

  @ApiProperty({
  	description: 'The alarm details of the booking',
  },)
  @IsString()
  public alarmDetails!: string

  @ApiProperty({
  	description: 'The key location address of the booking',
  },)
  @IsString()
  public keyLocationAddress!: string

  @ApiProperty({
  	description: 'The trustee name of the booking',
  },)
  @IsString()
  public trusteeName!: string

  @ApiProperty({
  	description: 'The trustee surname of the booking',
  },)
  @IsString()
  public trusteeSurname!: string

  @ApiProperty({
  	description: 'The trustee contact of the booking',
  },)
  @IsString()
  public trusteeContact!: string

  @ApiProperty({
  	description: 'The alarm code of the booking',
  },)
  @IsString()
  public alarmCode!: string

  @ApiProperty({
  	description: 'The property access of the booking',
  },)
  @IsEnum(PropertyAccessType,)
  public propertyAccess!: PropertyAccessType
}

export class BookingClientDetailsDto {
	constructor(data?: BookingClientDetailsDto,) {
		if (data) {
			this.id = data.id
			this.uniqueSkills = data.uniqueSkills
			this.totalPrice = data.totalPrice
			this.generalInfo = data.generalInfo
			this.preferences = data.preferences
			this.keysDetails = data.keysDetails
		}
	}

  @ApiProperty({
  	description: 'Booking group ID',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
	public id!: string

  @ApiProperty({
  	description: 'The unique skills of the booking',
  },)
  @IsArray()
  public uniqueSkills!: Array<BookingUniqueSkills>

  @ApiProperty({
  	description: 'The total price of the booking',
  },)
  @IsNumber()
  public totalPrice!: number

  @ApiProperty({
  	description: 'The general info of the booking',
  },)
  @IsObject()
  public generalInfo!: BookingGeneralInfoDto

  @ApiProperty({
  	description: 'The preferences of the booking',
  },)
  @IsArray()
  public preferences!: Array<string>

  @ApiProperty({
  	description: 'The keys details of the booking',
  },)
  @IsObject()
  public keysDetails!: BookingKeysDetailsDto

  public static cast(booking: IBookingWithAllInfo & {uniqueSkills : Array<SkillDto>},) : BookingClientDetailsDto {
  	return new BookingClientDetailsDto({
  		id:           booking.id,
  		uniqueSkills: booking.uniqueSkills,
  		preferences:  booking.preferences,
  		totalPrice:   Number(booking.total_sum,),
  		generalInfo:  new BookingGeneralInfoDto({
  			status:              booking.booking_status,
  			propertyType:        booking.property_type,
  			location:            booking.location ,
  			numberOfBedrooms:    Number(booking.number_of_bedrooms,),
  			squareFootage:       Number(booking.square_footage,),
  			dateTime:            booking.created_at.toISOString(),
  			address:             booking.address ?? '',
  			bookingStageHistory: booking.BookingStageHistory,
  		},),
  		keysDetails: new BookingKeysDetailsDto({
  			keysDateTime:       booking.keysDateTime ?
  				booking.keysDateTime.toISOString() :
  				'',
  			alarmDetails:       booking.alarmDetails ?? '',
  			keyLocationAddress: booking.key_location_address ?? '',
  			trusteeName:        booking.trusteeName?.split(' ',)[0] ?? '',
  			trusteeSurname:     booking.trusteeName?.split(' ',)[1] ?? '',
  			trusteeContact:     booking.trusteePhone ?? '',
  			alarmCode:          booking.alarmCode ?? '',
  			propertyAccess:     booking.propertyAccess,
  	},),
  	},)
  }
}
