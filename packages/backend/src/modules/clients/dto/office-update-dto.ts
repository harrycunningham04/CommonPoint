import { ApiProperty, } from '@nestjs/swagger'
import { ClientStatus, OfficeClientType, OfficeType, PaymentPreference, PropertyType, } from '@prisma/client'
import { IsString, IsOptional, IsEmail, IsEnum, IsArray, IsNumber, IsBoolean, IsUUID, } from 'class-validator'

export class OfficeUpdateDto {
	@ApiProperty({
		description: 'The title of the office',
		example:     'Main Office',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public title?: string

	@ApiProperty({
		description: 'The name of the office',
		example:     'John',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public name?: string

	@ApiProperty({
		description: 'The surname of the office',
		example:     'Doe',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public surname?: string

	@ApiProperty({
		description: 'The number of workers in the office',
		example:     10,
		required:    false,
	},)
	@IsOptional()
	@IsNumber()
	public numberOfWorkers?: number

	@ApiProperty({
		description: 'The phone number of the office',
		example:     '+1234567890',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public phoneNumber?: string

	@ApiProperty({
		description: 'The email of the office',
		example:     'john.doe@example.com',
		required:    false,
	},)
	@IsOptional()
	@IsEmail()
	public email?: string

	@ApiProperty({
		description: 'The coordinates of the office',
		example:     '40.7128,-74.0060',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public addressCoordinates?: string

	@ApiProperty({
		description: 'The address of the office',
		example:     '123 Main St, Anytown, USA',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public address?: string

	@ApiProperty({
		description: 'The billing address of the office',
		example:     '123 Billing St, Anytown, USA',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public billingAddress?: string

	@ApiProperty({
		description: 'The office status',
		example:     'NEW',
		required:    false,
	},)
	@IsOptional()
	@IsEnum(ClientStatus,)
	public officeStatus?: ClientStatus

	@ApiProperty({
		description: 'The status of the office',
		example:     false,
		required:    false,
	},)
	@IsOptional()
	@IsBoolean()
	public status?: boolean

	@ApiProperty({
		description: 'The admin id of the office',
		example:     '123',
		required:    false,
	},)
	@IsOptional()
	@IsUUID()
	public adminId?: string

	@ApiProperty({
		description: 'The B2B client id associated with the office',
		example:     '123',
		required:    false,
	},)
	@IsOptional()
	@IsUUID()
	public b2BClientsId?: string



	@ApiProperty({
		description: 'The subbrand id of the office',
		example:     '123',
		required:    false,
	},)
	@IsOptional()
	@IsUUID()
	public subbrandId?: string

	@ApiProperty({
		description: 'The property types of the office',
		example:     ['RESIDENTIAL', 'COMMERCIAL',],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(PropertyType, { each: true, },)
	public propertyTypes?: Array<PropertyType>

	@ApiProperty({
		description: 'The office type',
		example:     'RESIDENTIAL',
		required:    false,
	},)
	@IsOptional()
	@IsEnum(OfficeType,)
	public officeType?: OfficeType

	@ApiProperty({
		description: 'The office client type',
		example:     'SALES',
		required:    false,
	},)
	@IsOptional()
	@IsEnum(OfficeClientType,)
	public officeClientType?: OfficeClientType

	@ApiProperty({
		description: 'The payment preferences of the office',
		example:     ['BANK_TRANSFER', 'CARD',],
		required:    false,
	},)
	@IsOptional()
	@IsEnum(PaymentPreference,)
	public paymentPreferences?: PaymentPreference
}