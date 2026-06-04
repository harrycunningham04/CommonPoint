import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, IsEmail, IsArray, IsUUID, IsEnum, IsBoolean, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export enum ESubbrandSortBy {
	COMPANY_NAME = 'companyName',
	EMAIL = 'email',
	PHONE_NUMBER = 'phoneNumber',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

export enum ESortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class GetSubbrandsQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for subbrand company name, email, or phone number',
		example:     'company',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		description: 'Sort by field',
		enum:        ESubbrandSortBy,
		example:     ESubbrandSortBy.COMPANY_NAME,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(ESubbrandSortBy,)
	public sortBy?: ESubbrandSortBy

	@ApiProperty({
		description: 'Sort order',
		enum:        ESortOrder,
		example:     ESortOrder.ASC,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(ESortOrder,)
	public sortOrder?: ESortOrder

	@ApiProperty({
		description: 'Show archived',
		example:     false,
		required:    false,
	},)
	@IsOptional()
	@IsBoolean()
	public showArchived?: boolean
}

export class CreateSubbrandDto {
	@ApiProperty({
		description: 'Company name of the subbrand',
		example:     'Acme Corp Subbrand',
	},)
	@IsString()
	public companyName!: string

	@ApiProperty({
		description: 'Email of the subbrand',
		example:     'contact@acme-subbrand.com',
		required:    false,
	},)
	@IsOptional()
	@IsEmail()
	public email?: string

	@ApiProperty({
		description: 'Phone number of the subbrand',
		example:     '+1234567890',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public phoneNumber?: string

	@ApiProperty({
		description: 'Address of the subbrand',
		example:     '123 Subbrand St, Anytown, USA',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public address?: string

	@ApiProperty({
		description: 'Billing address of the subbrand',
		example:     '123 Billing St, Anytown, USA',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public billingAddress?: string

	@ApiProperty({
		description: 'Array of office IDs to assign to the subbrand',
		example:     ['uuid1', 'uuid2',],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true, },)
	public officeIds?: Array<string>
}

export class UpdateSubbrandDto {
	@ApiProperty({
		description: 'Company name of the subbrand',
		example:     'Acme Corp Subbrand',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public companyName?: string

	@ApiProperty({
		description: 'Email of the subbrand',
		example:     'contact@acme-subbrand.com',
		required:    false,
	},)
	@IsOptional()
	@IsEmail()
	public email?: string

	@ApiProperty({
		description: 'Phone number of the subbrand',
		example:     '+1234567890',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public phoneNumber?: string

	@ApiProperty({
		description: 'Address of the subbrand',
		example:     '123 Subbrand St, Anytown, USA',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public address?: string

	@ApiProperty({
		description: 'Billing address of the subbrand',
		example:     '123 Billing St, Anytown, USA',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public billingAddress?: string

	@ApiProperty({
		description: 'Array of office IDs to assign to the subbrand',
		example:     ['uuid1', 'uuid2',],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true, },)
	public officeIds?: Array<string>
}