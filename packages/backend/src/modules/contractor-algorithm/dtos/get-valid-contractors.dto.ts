import { ApiProperty, } from '@nestjs/swagger'
import { ContractorSkillNama, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsDate, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, } from 'class-validator'

export class BookedSlotsDto {
	constructor(data?: BookedSlotsDto,) {
		if (data) {
			this.contractorId = data.contractorId
			this.startTime = data.startTime
			this.endTime = data.endTime
			return
		}
		this.contractorId = ''
		this.startTime = new Date().toISOString()
		this.endTime = new Date().toISOString()
	}

	@IsUUID()
	@ApiProperty({
		description: 'The contractor id of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
		required:    true,
	},)
	public contractorId: string

	@IsDateString()
	@ApiProperty({
		description: 'The start time of the booking',
		example:     '12:00',
		required:    true,
	},)
	@Type(() => {
		return Date
	},)
	public startTime: string

	@IsDateString()
	@ApiProperty({
		description: 'The end time of the booking',
		example:     '12:00',
		required:    true,
	},)
	public endTime: string
}

export class GetValidContractorsReqDto {
	constructor(data?: GetValidContractorsReqDto,) {
		if (data) {
			this.skillName = data.skillName
			this.orderSum = data.orderSum
			this.startDate = data.startDate
			this.endDate = data.endDate
			this.durationInMinutes = data.durationInMinutes
			this.bookedSlots = data.bookedSlots
			this.address = data.address
			this.productTypeIds = data.productTypeIds
			return
		}
		this.skillName = [ContractorSkillNama.FLOORPLAN,]
		this.orderSum = 0
		this.startDate = new Date()
		this.endDate = new Date()
		this.durationInMinutes = 0
		this.address = ''
		this.productTypeIds = []
	}

	@IsArray()
	@IsEnum(ContractorSkillNama, {
		each: true,
	},)
	@ApiProperty({
		description: 'The skill name of the booking',
		required:    true,
		isArray:     true,
	},)
	public skillName: Array<ContractorSkillNama>

	@IsNumber()
	@Type(() => {
		return Number
	},)
	@ApiProperty({
		description: 'The order sum of the booking',
		example:     '1000',
		required:    true,
	},)
	public orderSum: number

	@IsDate()
	@Type(() => {
		return Date
	},)
	@ApiProperty({
		description: 'The start date of the booking',
		example:     '2025-01-01',
		required:    true,
	},)
	public startDate: Date

	@IsDate()
	@Type(() => {
		return Date
	},)
	@ApiProperty({
		description: 'The end date of the booking',
		example:     '2025-01-01',
		required:    true,
	},)
	public endDate: Date

	@Type(() => {
		return Number
	},)
	@IsNumber()
	@ApiProperty({
		description: 'The duration of the booking',
		example:     '1',
		required:    true,
	},)
	public durationInMinutes: number

	@IsString()
	@ApiProperty({
		description: 'The address of the booking',
		example:     '123 Main St, Anytown, USA',
		required:    true,
	},)
	public address: string

	@IsArray()
	@IsOptional()
	@Type(() => {
		return Array
	},)
	@ValidateNested({
		each: true,
	},)
	@Type(() => {
		return BookedSlotsDto
	},)
	public bookedSlots?: Array<BookedSlotsDto>

	@IsArray()
	@IsOptional()
	@IsString({
		each: true,
	},)
	public productTypeIds?: Array<string>
}

export class GetValidContractorsDto extends GetValidContractorsReqDto {
	constructor(data?: GetValidContractorsDto,) {
		super(data,)
		if (data) {
			this.userIdOrOfficeId = data.userIdOrOfficeId
			return
		}
		this.userIdOrOfficeId = ''
	}

	@IsUUID()
	@ApiProperty({
		description: 'The user id or office id of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
		required:    true,
	},)
	public userIdOrOfficeId: string
}

export class GetValidContractorsForNewClientDto extends GetValidContractorsReqDto {
	constructor(data?: GetValidContractorsForNewClientDto,) {
		super(data,)
		if (data) {
			this.userIdOrOfficeId = data.userIdOrOfficeId
			this.email = data.email
		}
	}

	@ApiProperty({
		description: 'The user id or office id of the booking',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsOptional()
	public userIdOrOfficeId?: string

	@IsEmail()
	@ApiProperty({
		description: 'The email of the booking',
		example:     'test@test.com',
	},)
	@IsOptional()
	public email?: string
}

export class GetValidContractorsWithCoordsDto extends GetValidContractorsForNewClientDto {
	constructor(data?: GetValidContractorsWithCoordsDto,) {
		super(data,)
		if (data) {
			this.latitude = data.latitude
			this.longitude = data.longitude
			return
		}
		this.latitude = 0
		this.longitude = 0
	}

	@IsNumber()
	@Type(() => {
		return Number
	},)
	public latitude: number

	@IsNumber()
	@Type(() => {
		return Number
	},)
	public longitude: number
}
