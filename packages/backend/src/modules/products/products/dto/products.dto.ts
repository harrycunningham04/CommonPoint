import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsUUID, IsNumber, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ContractorSkillNama, } from '@prisma/client'
import { Transform, Type, } from 'class-transformer'

export enum EProductSortBy {
	NAME = 'name',
	PRICE = 'price',
	REQUIRES_ON_SITE_CONTRACTOR = 'requiresOnSiteContractor',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

export enum ESortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class GetAdminProductsQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for product name',
		example:     'product',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		description: 'Sort by field',
		enum:        EProductSortBy,
		example:     EProductSortBy.NAME,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(EProductSortBy,)
	public sortBy?: EProductSortBy

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
		description: 'Show archived products',
		example:     false,
		required:    false,
	},)
	@IsOptional()
	@IsBoolean()
	@Transform(({ value, },) => {
		return value === 'true'
	},)
	public showArchive?: boolean

	@ApiProperty({
		description: 'Filter by skills (products that have at least one of the provided skills)',
		enum:        ContractorSkillNama,
		isArray:     true,
		example:     [ContractorSkillNama.PHOTO, ContractorSkillNama.VIDEO,],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(ContractorSkillNama, { each: true, },)
	public skills?: Array<ContractorSkillNama>

	@ApiProperty({
		description: 'Filter by requires on site contractor',
		example:     true,
		required:    false,
	},)
	@IsOptional()
	@IsBoolean()
	@Transform(({ value, },) => {
		return value === 'true'
	},)
	public requiresOnSiteContractor?: boolean
}

export class ProductTypeForOfficeDto {

	constructor(data?: ProductTypeForOfficeDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.price = data.price
			this.requiresOnSiteContractor = data.requiresOnSiteContractor
		}
	}

	@ApiProperty({
		description: 'Product type ID',
		example:     '123',
	},)
	@IsUUID()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'Product type name',
		example:     'Product 1',
	},)
	@IsString()
	@IsNotEmpty()
	public title!: string

	@ApiProperty({
		description: 'Product type price',
		example:     '123',
	},)
	@IsNumber()
	@IsNotEmpty()
	public price!: number

	@ApiProperty({
		description: 'Product type duration',
		example:     '123',
	},)
	@IsBoolean()
	@IsNotEmpty()
	public requiresOnSiteContractor!: boolean

}

export class ProductForOfficeDto {
	constructor(data?: ProductForOfficeDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.productTypes = data.productTypes
		}
	}

	@ApiProperty({
		description: 'Product ID',
		example:     '123',
	},)
	@IsUUID()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'Product name',
		example:     'Product 1',
	},)
	@IsString()
	@IsNotEmpty()
	public title!: string

	@ApiProperty({
		description: 'Product types',
		example:     'Product 1',
	},)
	@IsArray()
	@IsNotEmpty()
	public productTypes!: Array<ProductTypeForOfficeDto>
}