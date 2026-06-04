/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { Package, ProductType, PackageProductType, PackageTargets, Office, B2BClients, } from '@prisma/client'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, } from 'class-validator'

class ProductTypeDto {
	constructor(data?:ProductTypeDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.price = data.price
		}
	}

    @ApiProperty({
    	type:        String,
    	description: 'The id of the product type',
    },)
    @IsString()
	public id!: string

    @ApiProperty({
    	type:        String,
    	description: 'The name of the product type',
    },)
    @IsString()
    public name!: string

	@ApiProperty({
		type:        Number,
		description: 'The price of the product type',
	},)
	@IsNumber()
    public price!: number
}

enum TargetType {
	BRAND = 'Brand',
	OFFICES = 'OFFICES',
}

export class TargetDto {
	constructor(data?:TargetDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.additionalTitle = data.additionalTitle
			this.type = data.type
		}
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the target',
	},)
	@IsString()
	public id!: string

	@ApiProperty({
		type:        String,
		description: 'The title of the target',
	},)
	@IsString()
	public title!: string

	@ApiProperty({
		type:        String,
		description: 'The additional title of the target',
	},)
	@IsString()
	@IsOptional()
	public additionalTitle?: string

	@ApiProperty({
		type:        TargetType,
		description: 'The type of the target',
	},)
	@IsEnum(TargetType,)
	public type!: TargetType
}
export class GetListPackagesDto {
	constructor(data?:GetListPackagesDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.price = data.price
			this.productTypes = data.productTypes
			this.targets = data.targets
			this.picture = data.picture
			this.description = data.description
		}
	}

    @ApiProperty({
    	type:        String,
    	description: 'The id of the package',
    },)
    @IsString()
	public id!: string

    @ApiProperty({
    	type:        String,
    	description: 'The title of the package',
    },)
    @IsString()
    public title!: string

    @ApiProperty({
    	type:        Number,
    	description: 'The price of the package',
    },)
    @IsNumber()
    public price!: number

	@ApiProperty({
		type:        String,
		description: 'The picture of the package',
	},)
	@IsString()
	public picture!: string

	@ApiProperty({
		type:        String,
		description: 'The description of the package',
	},)
	@IsString()
	public description!: string

    @ApiProperty({
    	type:        Array,
    	description: 'The products of the package',
    },)
    @IsArray()
    public productTypes!: Array<ProductTypeDto>

	@ApiProperty({
		type:        Array,
		description: 'The targets of the package',
	},)
	@IsArray()
    public targets!: Array<TargetDto>

	public static cast(
    	data: Package & { PackageProductType: Array<PackageProductType & { productType: ProductType }>, targets: Array<PackageTargets & { b2bClient?: B2BClients | null, Office?: Office | null }> },
	): GetListPackagesDto {
    	return new GetListPackagesDto({
    		id:           data.id,
    		title:        data.title,
    		price:        data.price,
			picture:      data.picture ?? '',
			description:  data.description ?? '',
    		productTypes: data.PackageProductType.map((p,) => {
    			return new ProductTypeDto({
    				id:    p.productType.id,
    				name:  p.productType.name,
    				price: p.productType.price,
    			},)
    		},),
			targets: data.targets.map((t,) => {
				const type = t.b2bClient ?
					TargetType.BRAND :
					TargetType.OFFICES
				return new TargetDto({
					id:              t.b2bClient?.id ?? t.Office?.id ?? '',
					title:           t.b2bClient?.companyName ?? t.Office?.name ?? '',
					additionalTitle:  t.Office?.address ?? '',
					type,
				},)
			},),
    	},)
	}
}
