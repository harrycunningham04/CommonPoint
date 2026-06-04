import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, } from 'class-validator'
import { Type, } from 'class-transformer'
import { BedroomsNumber,} from 'src/shared/types/product.types'
import { VIDEO_DURATION, } from 'src/shared/types/product.types'
import { BOOKING_PREFERENCE, } from 'src/shared/types/product.types'
import { PropertyAccessType, PropertyType, } from '@prisma/client'
import { EClientType, } from 'src/shared/types/client.type'

export class SkillsDto {
	@ApiProperty({
		description: 'The ID of the product type skill',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The name of the product type skill',
		example:     'Product Type Skill 1',
	},)
	@IsString()
	@IsNotEmpty()
	public name!: string

	@ApiProperty({
		description: 'The description of the product type skill',
		example:     'Product Type Skill 1',
	},)
	@IsString()
	public icon!: string
}

export class ProductTypeSkillsDto {
	@ApiProperty({
		description: 'The skills of the product type',
	},)
	@Type(() => {
		return SkillsDto
	},)
	@ValidateNested()
	public skill!: SkillsDto

	@ApiProperty({
		description: 'The skill ID of the product type',
	},)
	@IsString()
	@IsNotEmpty()
	public skillId!: string

	@ApiProperty({
		description: 'The skill name of the product type',
	},)
	@IsString()
	@IsNotEmpty()
	public productTypeId!: string
}

export class ProductVariantDto {
	@ApiProperty({
		description: 'The skills of the product variant',
		example:     ['skill1', 'skill2', 'skill3',],
	},)
	@IsArray()
	public skills!: Array<string>

	@ApiProperty({
		description: 'The ID of the product variant',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The name of the product variant',
		example:     'Product Variant 1',
	},)
	@IsString()
	@IsNotEmpty()
	public name!: string

  @ApiProperty({
  	description: 'The requires on site contractor of the product variant',
  	example:     true,
  },)
	@IsBoolean()
	@IsNotEmpty()
	public requiresOnSiteContractor!: boolean

	@ApiProperty({
		description: 'The description contractor of the product variant',
		example:     'Product Variant 1',
	},)
	@IsString()
	@IsOptional()
  public descriptionContractor?: string

	@ApiProperty({
		description: 'The description client of the product variant',
		example:     'Product Variant 1',
	},)
	@IsString()
	@IsOptional()
	public descriptionClient?: string

	@ApiProperty({
		description: 'The price of the product variant',
		example:     '100',
	},)
	@IsNumber()
	@IsNotEmpty()
	public price!: number

	@ApiProperty({
		description: 'The duration of the product variant',
		example:     '100',
	},)
	@IsNumber()
	@IsNotEmpty()
	public duration!: number

	@ApiProperty({
		description: 'The package ID of the product variant',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsOptional()
	public packageId?: string

  @ApiProperty({
  	description: 'The duration settings of the product variant',
  	example:     '100',
  },)
	@IsArray()
	@IsEnum(VIDEO_DURATION, {
		each: true,
	},)
	@IsNotEmpty()
	public durationSettings!: Array<VIDEO_DURATION>

  @ApiProperty({
  	description: 'The preferences of the product variant',
  	example:     '100',
  },)
	@IsArray()
	@IsEnum(BOOKING_PREFERENCE, {
		each: true,
	},)
	@IsNotEmpty()
  public preferences!: Array<BOOKING_PREFERENCE>

	@ApiProperty({
		description: 'The product type skills of the product variant',
		example:     'Product Type Skill 1',
	},)
	@IsArray()
	@IsOptional()
	@Type(() => {
		return ProductTypeSkillsDto
	},)
	@ValidateNested()
  public productTypeSkills?: Array<ProductTypeSkillsDto>

  @ApiProperty({
  	description: 'The date time of the product variant',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
	@IsString()
	@IsOptional()
	public dateTime?: string

  @ApiProperty({
  	description: 'The contractor ID of the product variant',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsOptional()
  public contractorId?: string

  @ApiProperty({
  	description: 'The time to current location of the product variant',
  	example:     '100',
  },)
	@IsNumber()
	@IsOptional()
  public timeToCurrentLocation?: number

  @ApiProperty({
  	description: 'The time to next location of the product variant',
  	example:     '100',
  },)
	@IsNumber()
	@IsOptional()
  public timeToNextLocation?: number
}

export class BookingClientCreationDto {
  @ApiProperty({
  	description: 'The selected products of the booking',
  	example:     'Product Variant 1',
  },)
	@IsArray()
	@IsNotEmpty()
	@Type(() => {
		return ProductVariantDto
	},)
	@ValidateNested()
	public selectedProducts!: Array<ProductVariantDto>

  @ApiProperty({
  	description: 'The selected products groups of the booking',
  	example:     'Product Variant 1',
  },)
	@IsArray()
	@IsNotEmpty()
	@ValidateNested({
		each: true,
	},)
	@Type(() => {
		return ProductVariantDto
	},)
  public selectedProductsGroups!: Array<Array<ProductVariantDto>>

  @ApiProperty({
  	description: 'The total of the booking',
  	example:     '100',
  },)
	@IsNumber()
	@IsNotEmpty()
  public total!: number

  @ApiProperty({
  	description: 'The office ID of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsOptional()
  public officeId?: string

  @ApiProperty({
  	description: 'The b2b client ID of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsOptional()
  public b2bClientId?: string

  @ApiProperty({
  	description: 'The property type of the booking',
  	example:     'Property Type 1',
  },)
	@IsEnum(PropertyType,)
  public propertyType!: PropertyType

  @ApiProperty({
  	description: 'The property access type of the booking',
  	example:     'Property Access Type 1',
  },)
	@IsEnum(PropertyAccessType,)
	@IsOptional()
  public propertyAccessType?: PropertyAccessType

  @ApiProperty({
  	description: 'The number of bedrooms of the booking',
  	example:     '1',
  },)
	@IsEnum(BedroomsNumber,)
  public numberOfBedrooms!: BedroomsNumber

  @ApiProperty({
  	description: 'The square footage of the booking',
  	example:     '100',
  },)
	@IsNumber()
	@IsNotEmpty()
  public squareFootage!: number

  @ApiProperty({
  	description: 'The property details of the booking',
  	example:     'Property Details 1',
  },)
	@IsString()
	@IsOptional()
  public propertyDetails?: string

  @ApiProperty({
  	description: 'The address of the booking',
  	example:     'Address 1',
  },)
	@IsString()
	@IsNotEmpty()
  public address!: string

  @ApiProperty({
  	description: 'The place ID of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsNotEmpty()
  public  placeId!: string

  @ApiProperty({
  	description: 'The trustee name of the booking',
  	example:     'Trustee Name 1',
  },)
	@IsString()
	@IsOptional()
  public trusteeName?: string

  @ApiProperty({
  	description: 'The trustee phone of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsOptional()
  public trusteePhone?: string

  @ApiProperty({
  	description: 'The trustee relationship of the booking',
  	example:     'Trustee Relationship 1',
  },)
	@IsString()
	@IsOptional()
  public trusteeRelationship?: string

  @ApiProperty({
  	description: 'The is alarm of the booking',
  	example:     true,
  },)
	@IsBoolean()
	@IsNotEmpty()
  public isAlarm!: boolean

  @ApiProperty({
  	description: 'The alarm code of the booking',
  	example:     'Alarm Code 1',
  },)
	@IsString()
	@IsOptional()
  public alarmCode?: string

  @ApiProperty({
  	description: 'The alarm details of the booking',
  	example:     'Alarm Details 1',
  },)
	@IsString()
	@IsOptional()
  public alarmDetails?: string

  @ApiProperty({
  	description: 'The keys address of the booking',
  	example:     'Keys Address 1',
  },)
	@IsString()
	@IsOptional()
  public keysAddress?: string

  @ApiProperty({
  	description: 'The keys place ID of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsOptional()
  public keysPlaceId?: string

  @ApiProperty({
  	description: 'The keys details of the booking',
  	example:     'Keys Details 1',
  },)
	@IsString()
	@IsOptional()
  public keysDetails?: string

  @ApiProperty({
  	description: 'The keys date time of the booking',
  	example:     '2021-01-01T00:00:00.000Z',
  },)
	@IsDate()
	@IsOptional()
	@Type(() => {
	 	return Date
	},)
  public keysDateTime?: Date

  @ApiProperty({
  	description: 'The coupon of the booking',
  	example:     'Coupon 1',
  },)
	@IsString()
	@IsOptional()
  public coupon?: string

  @ApiProperty({
  	description: 'The client ID of the booking',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
	@IsString()
	@IsOptional()
  public clientId?: string

  @ApiProperty({
  	description: 'The client type of the booking',
  	example:     'Client Type 1',
  },)
	@IsEnum(EClientType,)
  public clientType!: EClientType
}

export class ContactInformationDto {
	@ApiProperty({
		description: 'The name of the contact information',
		example:     'Name 1',
	},)
	@IsString()
	@IsNotEmpty()
	public name!: string

	@ApiProperty({
		description: 'The surname of the contact information',
		example:     'Surname 1',
	},)
	@IsString()
	@IsNotEmpty()
	public surname!: string

	@ApiProperty({
		description: 'The phone of the contact information',
		example:     'Phone 1',
	},)
	@IsString()
	@IsNotEmpty()
	public phone!: string

	@ApiProperty({
		description: 'The email of the contact information',
		example:     'Email 1',
	},)
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	public email!: string
}

export class DraftBookingDto extends BookingClientCreationDto {
	@ApiProperty({
		description: 'The contact information of the booking',
		example:     'Contact Information 1',
	},)
	@IsNotEmpty()
	@Type(() => {
		return ContactInformationDto
	},)
	@ValidateNested()
	public contactInformation!: ContactInformationDto
}