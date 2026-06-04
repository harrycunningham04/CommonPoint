/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable no-mixed-spaces-and-tabs */
import type {
	Attachment,
	BookingCGIClientPhotos,
	EditedMaterial,
	EditRequest,
	KeyLocation,
	RawMaterial,} from '@prisma/client'
import {
	EditRequestStatus,
	EditRequestType,
} from '@prisma/client'
import {
	BookingPreference,
	ClientStatus,
	BookingStage,
	BookingStatus,
	PropertyType,
	BookingType,
	MaterialTypeContent,
} from '@prisma/client'
import { PropertyAccessType, type Booking, type Location, } from '@prisma/client'
import {
	IsArray,
	IsBoolean,
	IsDate,
	IsEnum,
	isNotEmpty,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	ValidateNested,
} from 'class-validator'
import { Type, } from 'class-transformer'
import { BookingAttachmentResDto, } from './booking-attachment-res.dto'
import type { IProductTypeBooking, } from '../booking.types'
import { FloorplanCheckDto, FloorplanChecklistDto, RawMaterialsDto, RawMaterialDto, } from 'src/modules/raw-material/dto/floorplans.dto'
import { ApiProperty, } from '@nestjs/swagger'
import { MapInfoDto, SkillDto, } from './booking-mobile-res.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
export class BookingUniqueSkills {
	public static getUniqueSkills(booking: {
		BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}>,
	},): Array<SkillDto> {
		const skills = booking.BookingToProductType.flatMap((productType,) => {
			return productType.productType.productTypeSkills.map((skill,) => {
				return new SkillDto({
					id:   skill.skill.id,
					name: skill.skill.name,
					icon: skill.skill.icon,
				},)
			},)
		},)
		const skillsMap = new Map()
		skills.forEach((skill,) => {
			skillsMap.set(skill.id, skill,)
		},)

		return [...skillsMap.values(),]
	}
}

export class UploadedSketchesDto {
	constructor(data?: UploadedSketchesDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.url = data.url
			this.fileSize = data.fileSize
		}
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the uploaded sketch',
	},)
	@IsString()
	public id!: string

	@ApiProperty({
		type:        String,
		description: 'The name of the uploaded sketch',
	},)
	@IsString()
	public name!: string

	@ApiProperty({
		type:        String,
		description: 'The url of the uploaded sketch',
	},)
	@IsString()
	public url!: string

	@ApiProperty({
		type:        Number,
		description: 'The file size of the uploaded sketch',
	},)
	@IsNumber()
	public fileSize!: number
}

export class LocationDto {
	constructor(data?: LocationDto,) {
		if (data) {
			this.latitude = data.latitude
			this.longitude = data.longitude
			return
		}
		this.latitude = 0
		this.longitude = 0
	}

	@ApiProperty({
		type:        Number,
		description: 'The latitude of the location',
	},)
	@IsNumber()
	public latitude: number

	@ApiProperty({
		type:        Number,
		description: 'The longitude of the location',
	},)
	@IsNumber()
	public longitude: number
}

export class EditRequestDto {
	constructor(data?: EditRequestDto,) {
		if (data) {
			this.id = data.id
			this.requestedChange = data.requestedChange
			this.type = data.type
			this.status = data.status
			this.contentType = data.contentType
			this.dateTime = data.dateTime
		}
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the edit request',
	},)
	@IsString()
	public id!: string

	@ApiProperty({
		type:        String,
		description: 'The requested change of the edit request',
	},)
	@IsString()
	public requestedChange!: string

	@ApiProperty({
		type:        String,
		description: 'The type of the edit request',
	},)
	@IsEnum(EditRequestType,)
	public type!: EditRequestType

	@ApiProperty({
		type:        String,
		description: 'The status of the edit request',
	},)
	@IsString()
	public status!: EditRequestStatus

	@ApiProperty({
		type:        String,
		description: 'The content type of the edit request',
	},)
	@IsEnum(MaterialTypeContent,)
	@IsOptional()
	public contentType?: MaterialTypeContent | null

	@ApiProperty({
		type:        Date,
		description: 'The date and time of the edit request',
	},)
	@IsString()
	public dateTime!: string
}

export class BookingMobileJobResDto {
	constructor(data?: BookingMobileJobResDto,) {
		if (data) {
			this.id = data.id
			this.bookingType = data.bookingType
			this.address = data.address
			this.propertyType = data.propertyType
			this.numberOfBedrooms = data.numberOfBedrooms
			this.squareFootage = data.squareFootage
			this.duration = data.duration
			this.durationInMinutes = data.durationInMinutes
			this.bookingStatus = data.bookingStatus
			this.bookingStage = data.bookingStage
			this.bookingLocation = data.bookingLocation
			this.keyLocation = data.keyLocation
			this.time = data.time
			this.uniqueSkills = data.uniqueSkills
			this.dateTime = data.dateTime
			this.date_time = data.date_time
			return
		}
		this.id = ''
		this.bookingType = BookingType.BOOKING
		this.address = ''
		this.propertyType = PropertyType.BUNGALOW
		this.numberOfBedrooms = ''
		this.squareFootage = ''
		this.duration = 0
		this.durationInMinutes = 0
		this.bookingStatus = BookingStatus.BOOKED
		this.bookingStage = []
		this.bookingLocation = new LocationDto()
		this.uniqueSkills = []
		this.dateTime = new Date()
		this.date_time = new Date()
	}

  @ApiProperty({
  	type:        String,
  	description: 'The id of the booking',
  },)
  @IsUUID()
  @IsNotEmpty()
	public id: string

	@ApiProperty({
		type:        String,
		description: 'The type of the booking',
	},)
	@IsEnum(BookingType,)
  public bookingType: BookingType

  @IsEnum(PropertyType,)
	public propertyType: PropertyType

  @ApiProperty({
  	type:        String,
  	description: 'The number of bedrooms of the booking',
  },)
  @IsString()
  @IsNotEmpty()
  public numberOfBedrooms: string

  @ApiProperty({
  	type:        String,
  	description: 'The square footage of the booking',
  },)
  @IsString()
  @IsNotEmpty()
  public squareFootage: string

  @ApiProperty({
  	type:        Number,
  	description: 'The duration of the booking',
  },)
  @IsNumber()
  @IsNotEmpty()
  public duration: number

	@ApiProperty({
		type:        Number,
		description: 'The duration in minutes of the booking',
	},)
	@IsNumber()
	@IsNotEmpty()
  public durationInMinutes: number

  @IsEnum(BookingStatus,)
  @IsNotEmpty()
	public bookingStatus: BookingStatus

	@ApiProperty({
		type:        Array<BookingStage>,
		description: 'The stage of the booking',
	},)
	@IsArray()
	@IsEnum(BookingStage, { each: true, },)
  public bookingStage: Array<BookingStage>

	@ApiProperty({
		type:        String,
		description: 'The address of the booking',
	},)
	@IsString()
	@IsNotEmpty()
	public address: string

	@ApiProperty({
		type:        LocationDto,
		description: 'The location of the booking',
	},)
	@ValidateNested()
	@Type(() => {
		return LocationDto
	},)
	public bookingLocation: LocationDto

	@ApiProperty({
		type:        LocationDto,
		description: 'The key location of the booking',
	},)
	@IsOptional()
	@ValidateNested()
	@Type(() => {
		return LocationDto
	},)
	public keyLocation?: LocationDto

	@ApiProperty({
		type:        Number,
		description: 'The time between the current booking and previous booking',
	},)
	@IsNumber()
	@IsOptional()
	public time?: number

	@ApiProperty({
		type:        Array<SkillDto>,
		description: 'The unique skills of the booking',
	},)
	@IsArray()
	@Type(() => {
		return SkillDto
	},)
	@ValidateNested({ each: true, },)
	public uniqueSkills: Array<SkillDto>

	@ApiProperty({
		type:        Date,
		description: 'The date and time of the booking',
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public dateTime: Date

	@ApiProperty({
		type:        Date,
		description: 'The date and time of the booking',
	},)
	@IsDate()
	@Type(() => {
		return Date
	},)
	public date_time: Date

	public static cast(booking: Booking & {
		location: Location | null,
		keyLocation: KeyLocation | null,
		BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}>,
	},): BookingMobileJobResDto {
		return new BookingMobileJobResDto({
			id:                booking.id,
			bookingType:       booking.bookingType,
			address:           booking.address ?? '',
			propertyType:      booking.property_type ?? PropertyType.BUNGALOW,
			numberOfBedrooms:  booking.number_of_bedrooms,
			squareFootage:     booking.square_footage ?? '',
			duration:          booking.duration ?? 0,
			bookingStatus:     booking.booking_status,
			bookingStage:      booking.booking_stage,
			durationInMinutes: booking.durationInMinutes ?? 0,
			bookingLocation:   booking.location ?
				new LocationDto(booking.location,) :
				new LocationDto(),
			keyLocation:       booking.keyLocation ?
				new LocationDto(booking.keyLocation,) :
				undefined,
			uniqueSkills:      BookingUniqueSkills.getUniqueSkills(booking,),
			dateTime:          booking.date_time,
			date_time:         booking.date_time,
		},)
	}
}

export class SingleBookingResDto extends BookingMobileJobResDto {
	constructor(data?: SingleBookingResDto,) {
		super(data,)
		if (data) {
			this.propertyDetails = data.propertyDetails
			this.propertyAccess = data.propertyAccess
			this.trusteeName = data.trusteeName
			this.trusteePhone = data.trusteePhone
			this.trusteeRelationship = data.trusteeRelationship
			this.isAlarm = data.isAlarm
			this.alarmCode = data.alarmCode
			this.alarmDetails = data.alarmDetails
			this.keyLocationAddress = data.keyLocationAddress
			this.keyInstruction = data.keyInstruction
			this.keysDateTime = data.keysDateTime
			this.attachments = data.attachments
			this.preferences = data.preferences
			this.mark = data.mark
			this.BookingCGIClientPhotos = data.BookingCGIClientPhotos
			this.isEditRequest = data.isEditRequest
			this.satisfactionLevel = data.satisfactionLevel
			this.floorplanChecklist = data.floorplanChecklist
			this.sketches = data.sketches
			this.uploadedSketches = data.uploadedSketches
			this.editRequest = data.editRequest
			this.clientFullName = data.clientFullName
			this.phoneNumber = data.phoneNumber
			return
		}
		this.propertyAccess = PropertyAccessType.KEYS
		this.propertyDetails = null
		this.trusteeName = null
		this.trusteePhone = null
		this.trusteeRelationship = null
		this.isAlarm = null
		this.alarmCode = null
		this.alarmDetails = null
		this.keyLocationAddress = null
		this.keyInstruction = null
		this.keysDateTime = null
		this.attachments = []
		this.sketches = []
		this.preferences = []
		this.mark = ClientStatus.NEW
		this.BookingCGIClientPhotos = []
		this.satisfactionLevel = 0
		this.floorplanChecklist = []
		this.uploadedSketches = []
		this.editRequest = []
		this.clientFullName = ''
		this.phoneNumber = ''
	}

	@ApiProperty({
		description: 'The satisfaction level of the booking',
		example:     'number',
	},)
	@IsNumber()
	public satisfactionLevel: number

    @IsString()
    @IsOptional()
	public propertyDetails: string | null

    @IsEnum(PropertyAccessType,)
    @IsNotEmpty()
    public propertyAccess: PropertyAccessType

    @IsString()
    @IsOptional()
    public trusteeName: string | null

    @IsString()
    @IsOptional()
    public trusteePhone: string | null

    @IsString()
    @IsOptional()
    public trusteeRelationship: string | null

    @IsBoolean()
    @IsOptional()
    public isAlarm: boolean | null

    @IsString()
    @IsOptional()
    public alarmCode: string | null

    @IsString()
    @IsOptional()
    public alarmDetails: string | null

    @IsString()
    @IsOptional()
    public keyLocationAddress: string | null

    @IsString()
    @IsOptional()
    public keyInstruction: string | null

    @IsDate()
    @IsOptional()
    public keysDateTime: Date | null

    @IsArray()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return BookingAttachmentResDto
    },)
    public attachments: Array<BookingAttachmentResDto>

	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return RawMaterialDto
	},)
    public sketches: Array<RawMaterialDto>

	@IsArray()
	@IsEnum(BookingPreference, { each: true, },)
	public preferences: Array<BookingPreference>

	@IsEnum(ClientStatus,)
	public mark: ClientStatus

	@IsArray()
	public BookingCGIClientPhotos: Array<BookingCGIClientPhotos>

	@ApiProperty({
		description: 'The running late for the booking',
		example:     'number',
	},)
	@IsNumber()
	@IsOptional()
	public runningLate?: number

	@ApiProperty({
		description: 'Is edit of materials required',
	},)
	@IsBoolean()
	@IsOptional()
	public isEditRequest?: boolean

	@ApiProperty({
		description: 'The floorplan checklist of the booking',
	},)
	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return FloorplanCheckDto
	},)
	public floorplanChecklist: Array<FloorplanCheckDto>

	@ApiProperty({
		type:        Array<RawMaterialDto>,
		description: 'The uploaded sketches of the booking',
	},)
	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return UploadedSketchesDto
	},)
	public uploadedSketches: Array<UploadedSketchesDto>

	@ApiProperty({
		type:        Array<EditRequestDto>,
		description: 'The edit requests of the booking',
	},)
	@IsArray()
	@ValidateNested({ each: true, },)
	public editRequest: Array<EditRequestDto>

	@ApiProperty({
		type:        String,
		description: 'The full name of the client',
	},)
	@IsString()
	public clientFullName: string

	@ApiProperty({
		type:        String,
		description: 'The phone number of the client',
	},)
	@IsString()
	public phoneNumber: string

	private static checkMark(booking: Booking & {
		b2CClients: {
			mark: ClientStatus,
		} | null,
		b2BClients: {
			officeStatus: ClientStatus,
		} | null,
		office: {
			officeStatus: ClientStatus,
		} | null,
	},): ClientStatus {
		return booking.b2CClients?.mark ?? booking.office?.officeStatus ?? booking.b2BClients?.officeStatus ?? ClientStatus.NEW
	}

	public static getClientIdFromBookingForMap(booking: {
		b2BClientsId: string | null,
		b2CClientsId: string | null,
	},): string {
		return `${booking.b2BClientsId}-${booking.b2CClientsId}`
	}

	public static getClientIdFromBookingForSearch(booking: {
		b2BClientsId: string | null,
		b2CClientsId: string | null,
	},): string {
		return booking.b2BClientsId ?? booking.b2CClientsId ?? ''
	}

	public static castToSingleBookingResDto(booking: Booking & {
		b2CClients: {
			mark: ClientStatus,
			firstName: string,
			lastName: string,
			phoneNumber: string,
		} | null,
		b2BClients: {
			officeStatus: ClientStatus,
			firstName?: string | null,
			lastName?: string | null,
			phoneNumber: string,
		} | null,
		office: {
			officeStatus: ClientStatus,
		} | null,
    location: Location | null,
		keyLocation: KeyLocation | null,
		rawMaterial: Array<RawMaterial>,
		editedMaterial: Array<EditedMaterial>,
    Attachment: Array<Attachment>,
		BookingToProductType: Array<{
			productType: IProductTypeBooking['productType'],
		}>,
	BookingCGIClientPhotos: Array<BookingCGIClientPhotos>,
	EditRequest: Array<EditRequest>,
  }, mapClientRatings: Map<string, number>,): SingleBookingResDto {
  	const basicDetails = BookingMobileJobResDto.cast(booking,)
		const clientId = this.getClientIdFromBookingForMap(booking,)
		const clientRating = mapClientRatings.get(clientId,) ?? 0
		const client = booking.b2CClients ?? booking.b2BClients
		const clientFullName = `${client?.firstName} ${client?.lastName}`

  	return new SingleBookingResDto({
  		...booking,
  		...basicDetails,
			preferences:       booking.preferences,
			phoneNumber:       client?.phoneNumber ?? '',
			satisfactionLevel: clientRating,
			runningLate:       booking.runningLate ?? undefined,
			keyLocation:       booking.keyLocation ?
				new LocationDto(booking.keyLocation,) :
				undefined,
			clientFullName,
			mark:           this.checkMark(booking,),
			sketches:       RawMaterialsDto.cast({
				id:          booking.id,
				rawMaterial: booking.rawMaterial.filter((material,) => {
					return material.contentType === MaterialTypeContent.SKETCHES
				},)	,
			},).rawMaterials,
  		keyLocationAddress: booking.key_location_address,
			editRequest:        booking.EditRequest.map((editRequest,) => {
				return new EditRequestDto({
					id:              editRequest.id,
					requestedChange: editRequest.requestedChange,
					type:            editRequest.type,
					status:          editRequest.status,
					contentType:     editRequest.contentType ?? null,
					dateTime:        editRequest.createdAt.toISOString(),
				},)
			},),
  		keyInstruction:     booking.key_instruction,
  		duration:           booking.duration ?? 0,
			durationInMinutes:  booking.durationInMinutes ?? 0,
			uploadedSketches:   booking.editedMaterial.filter((item,) => {
				return item.contentType === MaterialTypeContent.SKETCHES
			},).map((material,) => {
				return new UploadedSketchesDto({
					id:       material.id,
					name:     material.name,
					url:      material.url,
					fileSize: material.fileSize ?? 0,
				},)
			},),
  		address:            booking.address ?? '',
			floorplanChecklist: FloorplanChecklistDto.cast(booking.id, booking.floorplanChecklist,).floorplanChecklist,
  		attachments:        booking.Attachment.map((attachment,) =>  {
  			return new BookingAttachmentResDto(attachment,)
  		}
  		,),
  	},)
	}
}

export class BookingMobileResDto {
	constructor(data?: BookingMobileResDto,) {
		if (data) {
			this.booking = data.booking
			this.mapInfo = data.mapInfo
			return
		}
		this.booking = new SingleBookingResDto()
		this.mapInfo = new MapInfoDto()
	}

	@ApiProperty({
		type:        Array<SingleBookingResDto>,
		description: 'The jobs of the booking',
	},)
	@IsArray()
	@Type(() => {
		return SingleBookingResDto
	},)
	@ValidateNested({ each: true, },)
	public booking: SingleBookingResDto

	@ApiProperty({
		type:        MapInfoDto,
		description: 'The map info of the booking',
	},)
	@ValidateNested()
	@Type(() => {
		return MapInfoDto
	},)
	public mapInfo: MapInfoDto
}

export class JobDtoQuery extends PageOptionsDto {
	@ApiProperty({
		description: 'Street address for filtering jobs',
		example:     '123 Main St',
		required:    true,
	},)
	@IsOptional()
	@IsString()
	public address?: string = ''

	@ApiProperty({
		description: 'Start date for filtering jobs',
		example:     '2024-01-01',
	},)

	@IsOptional()
	@IsDate()
	@Type(() => {
		return Date
	},)
	public startDate?: Date

	@ApiProperty({
		description: 'End date for filtering jobs',
		example:     '2024-01-01',
	},)
	@IsOptional()
	@IsDate()
	@Type(() => {
		return Date
	},)
	public endDate?: Date

	@ApiProperty({
		description: 'Only bookable jobs',
		example:     true,
	},)
	@IsOptional()
	@IsBoolean()
	@Type(() => {
		return Boolean
	},)
	public withoutCanceled?: boolean
}

export class JobDto {
	constructor(data?:JobDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.dateTime = data.dateTime
			this.status = data.status
			this.stages = data.stages ?? []
		}
	}

	@ApiProperty({
		type:        String,
		description: 'booking id',
	},)
	public id?: string

	@ApiProperty({
		type:        String,
		description: 'booking address',
	},)
	public address?: string

	@ApiProperty({
		type:        String,
		description: 'booking description',
	},)
	public	dateTime?: Date

	@ApiProperty({
		type:        String,
		description: 'booking status',
	},)
	public status?: BookingStatus

	@ApiProperty({
		type:        Array<BookingStage>,
		description: 'booking stage',
	},)
	public stages?: Array<BookingStage>

	public static cast(booking: Booking,): JobDto {
		return new JobDto({
			id:       booking.id,
			address:  booking.address ?? '',
			dateTime: booking.date_time,
			status:   booking.booking_status,
			stages:   booking.booking_stage,
		},)
	}
}
