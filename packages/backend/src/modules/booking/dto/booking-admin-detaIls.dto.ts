/* eslint-disable complexity */
import { ApiProperty, } from '@nestjs/swagger'
import type { B2BClients, B2CClients, Booking, Contractor, EditedMaterial, KeyLocation, RawMaterial,} from '@prisma/client'
import { BookingStatus, BookingType,  Prisma,} from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested, } from 'class-validator'
import { BookingDetailType, type IProductTypeBooking, } from '../booking.types'
import { SkillDto, } from './booking-mobile-res.dto'
import { BookingUniqueSkills, } from './single-booking-res.dto'

export class BookingDetailContractorDto {
	constructor(data?:BookingDetailContractorDto,) {
		if (data) {
			this.id = data.id
			this.fullName = data.fullName
			this.phone = data.phone
			this.avatar = data.avatar
			this.onSite = data.onSite
		}
	}

	@ApiProperty({
		description: 'The id of the contractor',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The full name of the contractor',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public fullName!: string

	@ApiProperty({
		description: 'The phone of the contractor',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public phone!: string

	@ApiProperty({
		description: 'The avatar of the contractor',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public avatar!: string

	@ApiProperty({
		description: 'The on site of the contractor',
		type:        Boolean,
	},)
	@IsBoolean()
	@IsNotEmpty()
	public onSite!: boolean
}

export class KeyDetailsDto {
	constructor(data?:KeyDetailsDto,) {
		if (data) {
			this.detailType = data.detailType
			this.trusteeName = data.trusteeName
			this.trusteePhone = data.trusteePhone

			this.isAlarm = data.isAlarm
			this.alarmCode = data.alarmCode
			this.alarmDetails = data.alarmDetails

			this.keyLocationAddress = data.keyLocationAddress
			this.keyInstruction = data.keyInstruction
			this.keysDateTime = data.keysDateTime
		}
	}

	@ApiProperty({
		description: 'The detail type',
		type:        String,
	},)
	@IsEnum(BookingDetailType,)
	@IsNotEmpty()
	public detailType!: BookingDetailType

	@ApiProperty({
		description: 'The trustee name',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public trusteeName!: string

	@ApiProperty({
		description: 'The trustee phone',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public trusteePhone!: string

	@ApiProperty({
		description: 'The is alarm',
		type:        Boolean,
	},)
	@IsBoolean()
	@IsNotEmpty()
	public isAlarm!: boolean

	@ApiProperty({
		description: 'The alarm code',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public alarmCode!: string

	@ApiProperty({
		description: 'The alarm details',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public alarmDetails!: string

	@ApiProperty({
		description: 'The key location address',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public keyLocationAddress!: string

	@ApiProperty({
		description: 'The key instruction',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public keyInstruction!: string

	@ApiProperty({
		description: 'The keys date time',
		type:        Date,
	},)
	@IsDate()
	@IsNotEmpty()
	public keysDateTime!: Date
}

export class ClientInfoDto {
	constructor(data?:ClientInfoDto,) {
		if (data) {
			this.id = data.id
			this.fullName = data.fullName
			this.phone = data.phone
		}
	}

	@ApiProperty({
		description: 'The id of the client',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The full name of the client',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public fullName!: string

	@ApiProperty({
		description: 'The phone of the client',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public phone!: string
}

export class OrderInfoDto {
	constructor(data?:OrderInfoDto,) {
		if (data) {
			this.propertyType = data.propertyType
			this.numberOfBedrooms = data.numberOfBedrooms
			this.squareFootage = data.squareFootage
			this.address = data.address
		}
	}

	@ApiProperty({
		description: 'The property type',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public propertyType!: string

	@ApiProperty({
		description: 'The number of bedrooms',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public numberOfBedrooms!: string

	@ApiProperty({
		description: 'The square footage',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public squareFootage!: string

	@ApiProperty({
		description: 'The address',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public address!: string
}

export class ProductDetailsDto {
	constructor(data?:ProductDetailsDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.dateTime = data.dateTime
			this.duration = data.duration
		}
	}

	@ApiProperty({
		description: 'The id of the product',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The name of the product',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public name!: string

	@ApiProperty({
		description: 'The date and time of the product',
		type:        Date,
	},)
	@IsDate()
	@IsNotEmpty()
	public dateTime!: Date

	@ApiProperty({
		description: 'The duration of the product',
		type:        Number,
	},)
	@IsNumber()
	@IsNotEmpty()
	public duration!: number
}

export class BookingAdminDetailsDto {
	constructor(data?:BookingAdminDetailsDto,) {
		if (data) {
			this.id = data.id
			this.dateTime = data.dateTime
			this.price = data.price
			this.status = data.status
			this.contractorInfo = data.contractorInfo
			this.orderInfo = data.orderInfo
			this.productDetails = data.productDetails
			this.clientInfo = data.clientInfo
			this.uniqueSkills = data.uniqueSkills
			this.isEditRequest = data.isEditRequest
			this.editedMaterial = data.editedMaterial
			this.rawMaterial = data.rawMaterial
			this.keyDetails = data.keyDetails
			this.floorplanChecklist = data.floorplanChecklist
			this.archived = data.archived
		}
	}

	@ApiProperty({
		description: 'The id of the booking',
		type:        String,
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The contractor info',
		type:        BookingDetailContractorDto,
	},)
	@ValidateNested()
	@Type(() => {
		return BookingDetailContractorDto
	},)
	public contractorInfo!: BookingDetailContractorDto

	@ApiProperty({
		description: 'The date and time of the booking',
		type:        Date,
	},)
	@IsDate()
	@IsNotEmpty()
	public dateTime!: Date

	@ApiProperty({
		description: 'The price of the booking',
		type:        Number,
	},)
	@IsNumber()
	@IsNotEmpty()
	public price!: number

	@ApiProperty({
		description: 'The status of the booking',
		type:        String,
	},)
	@IsEnum(BookingStatus,)
	@IsNotEmpty()
	public status!: BookingStatus

	@ApiProperty({
		description: 'The order info',
		type:        OrderInfoDto,
	},)
	@ValidateNested()
	@Type(() => {
		return OrderInfoDto
	},)
	public orderInfo!: OrderInfoDto

	@ApiProperty({
		description: 'The product details',
		type:        ProductDetailsDto,
	},)
	@ValidateNested()
	@Type(() => {
		return ProductDetailsDto
	},)
	public productDetails!: Array<ProductDetailsDto>

	@ApiProperty({
		description: 'The client info',
		type:        ClientInfoDto,
	},)
	@ValidateNested()
	@Type(() => {
		return ClientInfoDto
	},)
	public clientInfo!: ClientInfoDto

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
		description: 'The is edit request',
		type:        Boolean,
	},)
	@IsBoolean()
	@IsNotEmpty()
	public isEditRequest!: boolean

	@ApiProperty({
		description: 'The edited material',
		type:        Array<EditedMaterial>,
	},)
	@IsArray()
	@ValidateNested({ each: true, },)
	public editedMaterial!: Array<EditedMaterial>

	@ApiProperty({
		description: 'The raw materials',
		type:        Array<RawMaterial>,
	},)
	@IsArray()
	@ValidateNested({ each: true, },)
	public rawMaterial!: Array<RawMaterial>

	@ApiProperty({
		description: 'The key details',
		type:        KeyDetailsDto,
	},)
	@ValidateNested()
	@Type(() => {
		return KeyDetailsDto
	},)
	public keyDetails!: KeyDetailsDto

	@ApiProperty({
		description: 'The floorplan client photos',
		type:        JSON,
	},)
	public floorplanChecklist!: Prisma.JsonValue

	@ApiProperty({
		description: 'The archived',
		type:        Boolean,
	},)
	public archived!: boolean

	public static cast(booking: Booking & {
		keyLocation?: KeyLocation | null,
		contractor?: Partial<Contractor> | null,
		b2CClients?: B2CClients | null,
		b2BClients?: B2BClients | null,
		rawMaterial?: Array<RawMaterial> | null,
		editedMaterial?: Array<EditedMaterial> | null,
		BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}>,
	},): BookingAdminDetailsDto {
		const client = booking.b2CClients ?? booking.b2BClients!
		const contractor = booking.contractor!


		return new BookingAdminDetailsDto({
			id:             booking.id,
			dateTime:       booking.date_time,
			price:          Number(booking.total_sum,),
			status:         booking.booking_status,
			contractorInfo: new BookingDetailContractorDto({
				id:       contractor.id ?? '',
				fullName: `${contractor.name} ${contractor.surname}`,
				phone:    contractor.phone ?? '',
				avatar:   contractor.avatar ?? '',
				onSite:   contractor.onSite ?? false,
			},),
			orderInfo: new OrderInfoDto({
				propertyType:     booking.property_type ?? '',
				numberOfBedrooms: booking.number_of_bedrooms,
				squareFootage:    booking.square_footage ?? '',
				address:          booking.address ?? '',
			},),
			productDetails: booking.BookingToProductType.map((product,) => {
				return new ProductDetailsDto({
					id:       product.productType.id,
					name:     product.productType.name,
					dateTime: booking.date_time,
					duration: booking.duration ?? 0,
				},)
			},),
			clientInfo: new ClientInfoDto({
				id:       client.id,
				fullName: `${client.firstName} ${client.lastName}`,
				phone:    client.phoneNumber,
			},),
			uniqueSkills:   BookingUniqueSkills.getUniqueSkills(booking,),
			isEditRequest:  booking.isEditRequest,
			editedMaterial: booking.editedMaterial ?? [],
			rawMaterial:    booking.rawMaterial ?? [],
			keyDetails:     new KeyDetailsDto({
				detailType:         booking.trusteeName ?
					BookingDetailType.APPOINTMENT :
					BookingDetailType.KEYS,
				trusteeName:        booking.trusteeName ?? '',
				trusteePhone:       booking.trusteePhone ?? '',
				isAlarm:            booking.isAlarm,
				alarmCode:          booking.alarmCode ?? '',
				alarmDetails:       booking.alarmDetails ?? '',
				keyLocationAddress: booking.key_location_address ?? '',
				keyInstruction:     booking.key_instruction ?? '',
				keysDateTime:       booking.keysDateTime ?? new Date(),
			},),
			floorplanChecklist: booking.floorplanChecklist,
			archived:           booking.archived,
		},)
	}
}

