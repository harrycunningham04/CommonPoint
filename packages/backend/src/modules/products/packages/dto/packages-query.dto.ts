import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, IsArray, IsBoolean, IsEnum, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ContractorSkillNama, } from '@prisma/client'

export enum EPackageSortBy {
	TITLE = 'title',
	PRICE = 'price',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

export enum ESortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class PackagesQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for package title',
		example:     'premium',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty({
		description: 'Array of skill names to filter by',
		example:     ['PHOTO', 'VIDEO',],
		required:    false,
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(ContractorSkillNama, { each: true, },)
	public skills?: Array<ContractorSkillNama>

	@ApiProperty({
		description: 'Filter by requires on-site contractor',
		example:     'true',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public requiresOnSiteContractor?: string

	@ApiProperty({
		description: 'Sort by field',
		enum:        EPackageSortBy,
		example:     EPackageSortBy.TITLE,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(EPackageSortBy,)
	public sortBy?: EPackageSortBy

	@ApiProperty({
		description: 'Sort direction',
		enum:        ESortOrder,
		example:     ESortOrder.ASC,
		required:    false,
	},)
	@IsOptional()
	@IsEnum(ESortOrder,)
	public sortDirection?: ESortOrder
}