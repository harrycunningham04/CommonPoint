/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsString, IsArray, IsBooleanString, IsBoolean, IsNumber, ValidateNested, } from 'class-validator'
import { ClientStatus, OfficeType, OfficeClientType, PropertyType, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { PageOptionsDto, PageSearchCommonDto, } from 'src/shared/dto/page-options.dto'
import type { OfficeResponseDto, } from './office-response.dto'

export enum SortDirection {
	ASC = 'asc',
	DESC = 'desc',
}

export enum SortBy {
	ALPHABETIC = 'alphabetic',
	OFFICE_STATUS = 'officeStatus',
	OFFICE_TYPE = 'officeType',
	OFFICE_CLIENT_TYPE = 'officeClientType',
	NUMBER_OF_WORKERS = 'numberOfWorkers',
	CREATED_AT = 'createdAt',
}

export class FilterOfficesDto {
	@IsOptional()
	@IsString()
	public title?: string

	@IsOptional()
	@IsString()
	public name?: string

	@IsOptional()
	@IsString()
	public surname?: string

	@IsOptional()
	@IsString()
	public email?: string

	@IsOptional()
	@IsString()
	public phoneNumber?: string

	@IsOptional()
	@IsString()
	public address?: string

	@IsOptional()
	@IsArray()
	@IsEnum(ClientStatus, { each: true, },)
	public officeStatus?: Array<ClientStatus>

	@IsOptional()
	@IsArray()
	@IsEnum(OfficeType, { each: true, },)
	public officeType?: Array<OfficeType>

	@IsOptional()
	@IsArray()
	@IsEnum(OfficeClientType, { each: true, },)
	public officeClientType?: Array<OfficeClientType>

	@IsOptional()
	@IsArray()
	@IsEnum(PropertyType, { each: true, },)
	public propertyTypes?: Array<PropertyType>

	@IsOptional()
	@IsBooleanString()
	public status?: string

	@IsOptional()
	@IsString()
	public adminId?: string

	@IsOptional()
	@IsString()
	public b2BClientsId?: string

	@IsOptional()
	@IsString()
	public subbrandId?: string

	@IsOptional()
	@IsEnum(SortBy,)
	public sortBy?: SortBy

	@IsOptional()
	@IsEnum(SortDirection,)
	public sortDirection?: SortDirection

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	@Type(() => {
		return Boolean
	},)
	public showArchived?: boolean
}

export class OfficesDto extends PageOptionsDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	public search?: string

	@ApiProperty()
	@IsOptional()
	@Type(() => {
		return FilterOfficesDto
	},)
	public filter?: FilterOfficesDto
}

export interface IOfficeListReturn {
	offices: Array<OfficeResponseDto>
	maxPage: number
}

export class OfficePackagesDto extends PageSearchCommonDto {
	@ApiProperty()
	@IsOptional()
	@IsArray()
	public brandIds?: Array<string>

	@ApiProperty()
	@IsOptional()
	@IsArray()
	public subbrandIds?: Array<string>
}

export class OfficeAvailableProductsDto {
	constructor(data?:OfficeAvailableProductsDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
		}
	}

	@ApiProperty()
	@IsOptional()
	@IsString()
	public id!: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	public title!: string
}

export class OfficeAvailableProductsResponseDto {
	constructor(data?:OfficeAvailableProductsResponseDto,) {
		if (data) {
			this.productsAvailable = data.productsAvailable
			this.productsHidden = data.productsHidden
		}
	}

	@ApiProperty()
	@IsOptional()
	@IsArray()
	public productsAvailable!: Array<OfficeAvailableProductsDto>

	@ApiProperty()
	@IsOptional()
	@IsArray()
	public productsHidden!: Array<OfficeAvailableProductsDto>
}

export class OfficeAvailableProductsAddDto {
	@ApiProperty()
	@IsString()
	public productId!: string
}

class OfficeProductTypeUpdateDto {
	@ApiProperty()
	@IsNumber()
	public price!: number

	@ApiProperty()
	@IsString()
	public id!: string
}

export class OfficeProductsUpdateDto {
	@ApiProperty()
	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return OfficeProductTypeUpdateDto
	},)
	public productTypes!: Array<OfficeProductTypeUpdateDto>
}