import { Type, } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { BasicProductTypeDto, } from '../../products/dto/get-product-variant-booking.dto'

export class GetBookingPackageDto extends PageOptionsDto {
	@IsString()
	@IsOptional()
	public search?: string

	@IsString()
	@IsOptional()
	public officeId?: string

	@Type(() => {
		return Number
	},)
	@IsNumber()
	@IsOptional()
	public sqft?: number

	@Type(() => {
		return Number
	},)
	@IsNumber()
	@IsOptional()
	public bedrooms?: number
}

export class BasicPackageDto {
	constructor(data?: Partial<BasicPackageDto>,) {
		if (data) {
			this.id = data.id ?? ''
			this.title = data.title ?? ''
			this.price = data.price ?? 0
			this.productTypes = data.productTypes ?? []
			this.picture = data.picture ?? ''
			this.description = data.description ?? ''
		}
	}

	@IsUUID()
	@IsNotEmpty()
	public id!: string

	@IsString()
	@IsNotEmpty()
	public title!: string

	@IsNumber()
	@IsNotEmpty()
	public price!: number

	@IsArray()
	@ValidateNested({ each: true, },)
	@Type(() => {
		return BasicProductTypeDto
	},)
	public productTypes!: Array<BasicProductTypeDto>

	@IsString()
	@IsOptional()
	public picture?: string

	@IsString()
	@IsOptional()
	public description?: string
}
