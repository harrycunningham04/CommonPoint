import { ApiProperty, } from '@nestjs/swagger'
import { OfficeClientType, OfficeType, CategoryPreference, PaymentPreference, } from '@prisma/client'
import { IsString, IsEmail, IsEnum, IsArray, IsUUID, IsOptional, IsBoolean, } from 'class-validator'

export class WorkerInAddOfficeDto {
	@ApiProperty({
		description: 'Worker ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
		required:    true,
	},)
	@IsUUID()
	public id!: string

	@ApiProperty({
		description: 'Whether the worker already exists',
		example:     true,
		required:    true,
	},)
	@IsBoolean()
	public isExist!: boolean

	@ApiProperty({
		description: 'Worker first name',
		example:     'John',
		required:    true,
	},)
	@IsString()
	public firstName!: string

	@ApiProperty({
		description: 'Worker last name',
		example:     'Doe',
		required:    true,
	},)
	@IsString()
	public lastName!: string

	@ApiProperty({
		description: 'Worker email',
		example:     'john.doe@example.com',
		required:    true,
	},)
	@IsEmail()
	public email!: string

	@ApiProperty({
		description: 'Worker phone number',
		example:     '+1234567890',
		required:    true,
	},)
	@IsString()
	public phoneNumber!: string

	@ApiProperty({
		description: 'Worker role',
		example:     'Photographer',
		required:    true,
	},)
	@IsString()
	public role!: string

	@ApiProperty({
		description: 'Office IDs where the worker will be assigned',
		example:     ['123e4567-e89b-12d3-a456-426614174000',],
		required:    true,
	},)
	@IsArray()
	@IsString({ each: true, },)
	public officeIds!: Array<string>
}

export class PreferenceInAddOfficeDto {
	@ApiProperty({
		description: 'Preference name',
		example:     'Special Requirements',
		required:    true,
	},)
	@IsString()
	public name!: string

	@ApiProperty({
		description: 'Preference category',
		example:     'PHOTOGRAPHY',
		required:    true,
	},)
	@IsEnum(CategoryPreference,)
	public category!: CategoryPreference
}

export class OfficeCreateDto {
	@ApiProperty({
		description: 'The title of the office',
		example:     'Main Office',
		required:    true,
	},)
	@IsString()
	public title!: string

	@ApiProperty({
		description: 'The address of the office',
		example:     '123 Main St, Anytown, USA',
		required:    true,
	},)
	@IsString()
	public address!: string

	@ApiProperty({
		description: 'The billing address of the office',
		example:     '123 Billing St, Anytown, USA',
		required:    true,
	},)
	@IsString()
	public billingAddress!: string

	@ApiProperty({
		description: 'The phone number of the office',
		example:     '+1234567890',
		required:    true,
	},)
	@IsString()
	public phoneNumber!: string

	@ApiProperty({
		description: 'The email of the office',
		example:     'john.doe@example.com',
		required:    true,
	},)
	@IsEmail()
	public email!: string

	@ApiProperty({
		description: 'The B2B client id associated with the office',
		example:     '123e4567-e89b-12d3-a456-426614174000',
		required:    false,
	},)
	@IsOptional()
	@IsUUID()
	public b2BClientsId?: string

	@ApiProperty({
		description: 'The office type',
		example:     'RESIDENTIAL',
		required:    true,
	},)
	@IsEnum(OfficeType,)
	public officeType!: OfficeType

	@ApiProperty({
		description: 'The office client type',
		example:     'SALES',
		required:    true,
	},)
	@IsEnum(OfficeClientType,)
	public officeClientType!: OfficeClientType

	@ApiProperty({
		description: 'The workers to add to the office',
		type:        [WorkerInAddOfficeDto,],
		required:    false,
	},)
	@IsArray()
	@IsOptional()
	public workers?: Array<WorkerInAddOfficeDto>

	@ApiProperty({
		description: 'The preferences for the office',
		type:        [PreferenceInAddOfficeDto,],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	public preferences?: Array<PreferenceInAddOfficeDto>

	@ApiProperty({
		description: 'The payment preference of the office',
		example:     'INVOICES',
		required:    true,
	},)
	@IsEnum(PaymentPreference,)
	public paymentPreference!: PaymentPreference
}