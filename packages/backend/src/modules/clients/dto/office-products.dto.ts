/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { Package, Product, ProductType, ProductTypeSkills, ProductTypeSpecialPrice, Skills, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested, } from 'class-validator'
import { SkillDto, } from 'src/modules/booking/dto'
import { OfficePackagesDto, } from './office.dto'

export class OfficeProductVariantDto {
	constructor(data?:OfficeProductVariantDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.price = data.price
			this.description = data.description
			this.skills = data.skills
		}
	}

    @ApiProperty({
    	description: 'The id of the product variant',
    	example:     '123',
    	required:    true,
    },)
    @IsString()
    @IsNotEmpty()
    @IsUUID()
	public id!: string

    @ApiProperty({
    	description: 'The title of the product variant',
    	example:     'Product 1',
    	required:    true,
    },)
    @IsString()
    @IsNotEmpty()
    public title!: string

    @ApiProperty({
    	description: 'The price of the product variant',
    	example:     '100',
    	required:    true,
    },)
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public price!: number

    @ApiProperty({
    	description: 'The description of the product variant',
    	example:     'Product 1 description',
    	required:    true,
    },)
    @IsString()
    @IsNotEmpty()
    public description!: string

    @ApiProperty({
    	description: 'The skills of the product variant',
    	example:     'Product 1 skills',
    	required:    true,
    },)
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return SkillDto
    },)
    public skills!: Array<SkillDto>
}

export class OfficeProductsDto {
	constructor(data?:OfficeProductsDto,) {
		if (data) {
			this.id = data.id
			this.title = data.title
			this.productVariantsCount = data.productVariantsCount
			this.productSkills = data.productSkills
			this.productVariants = data.productVariants

			this.price = data.price
		}
	}

    @ApiProperty({
    	description: 'The id of the product',
    	example:     '123',
    	required:    true,
    },)
    @IsString()
    @IsNotEmpty()
    @IsUUID()
	public id!: string

    @ApiProperty({
    	description: 'The title of the product',
    	example:     'Product 1',
    	required:    true,
    },)
    @IsString()
    @IsNotEmpty()
    public title!: string

    @ApiProperty({
    	description: 'The number of product variants',
    	example:     '1',
    	required:    true,
    },)
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public productVariantsCount!: number

    @ApiProperty({
    	description: 'The product skills',
    	example:     'Product 1',
    	required:    true,
    },)
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return SkillDto
    },)
    public productSkills!: Array<SkillDto>

    @ApiProperty({
    	description: 'The product variants',
    	example:     'Product 1',
    	required:    true,
    },)
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return OfficeProductVariantDto
    },)
    public productVariants!: Array<OfficeProductVariantDto>

	@ApiProperty({
		description: 'The price of the product',
		example:     '100',
		required:    true,
	},)
	@IsNumber()
	@IsOptional()
	public price?: number

    public static cast(
    	product: Product & {
          productTypes: Array<
            ProductType & { productTypeSkills: Array<ProductTypeSkills & { skill: Skills }>, specialPrices: Array<ProductTypeSpecialPrice> }
          >
        },
    ): OfficeProductsDto {
    	const allSkills = product.productTypes.flatMap((productType,) => {
    		return productType.productTypeSkills.map((productTypeSkill,) => {
    			return productTypeSkill.skill
    		},)
    	},
    	)

    	const uniqueSkillsMap = new Map<string, Skills>()
    	for (const skill of allSkills) {
    		uniqueSkillsMap.set(skill.id, skill,)
    	}

    	const uniqueSkills = Array.from(uniqueSkillsMap.values(),).map((skill,) => {
    		return new SkillDto({
    			id:   skill.id,
    			name: skill.name,
    			icon: skill.icon,
    		},)
    	},
    	)

    	return new OfficeProductsDto({
    		id:                   product.id,
    		title:                product.name,
    		productVariantsCount: product.productTypes.length,
    		productSkills:        uniqueSkills,
    		productVariants:      product.productTypes.map((productType,) => {
    			return new OfficeProductVariantDto({
    				id:          productType.id,
    				title:       productType.name,
    				price:       productType.specialPrices[0]?.price ?? productType.price,
    				description: productType.description_client || 'Description not provided',
    				skills:      productType.productTypeSkills.map((productTypeSkill,) => {
    					return new SkillDto({
    						id:   productTypeSkill.skill.id,
    						name: productTypeSkill.skill.name,
    						icon: productTypeSkill.skill.icon,
    					},)
    				},
    				),
    			},)
    		},),
    	},)
    }

    public static castPackage(
    	pkg: Package & {
		  PackageProductType: Array<{
			productType: ProductType & {
			  productTypeSkills: Array<ProductTypeSkills & { skill: Skills }>,
			  specialPrices: Array<ProductTypeSpecialPrice>,
			}
		  }>
		},
	  ): OfficeProductsDto {
    	const allSkills = pkg.PackageProductType.flatMap(({ productType, },) => {
    		return productType.productTypeSkills.map((ptSkill,) => {
    			return ptSkill.skill
    		},)
    	},
    	)

    	const uniqueSkillsMap = new Map<string, Skills>()
    	for (const skill of allSkills) {
		  uniqueSkillsMap.set(skill.id, skill,)
    	}

    	const uniqueSkills = Array.from(uniqueSkillsMap.values(),).map((skill,) => {
    		return new SkillDto({
    		id:   skill.id,
    		name: skill.name,
    		icon: skill.icon,
		  },)
    	},
    	)

    	return new OfficeProductsDto({
		  id:                   pkg.id,
		  title:                pkg.title,
		  productVariantsCount: pkg.PackageProductType.length,
		  productSkills:        uniqueSkills,
		  price:                pkg.price,
		  productVariants:      pkg.PackageProductType.map(({ productType, },) => {
    			return new OfficeProductVariantDto({
			  id:          productType.id,
			  title:       productType.name,
			  price:       productType.specialPrices[0]?.price ?? productType.price,
			  description: productType.description_client || 'Description not provided',
			  skills:      productType.productTypeSkills.map((ptSkill,) => {
    					return new SkillDto({
				  id:   ptSkill.skill.id,
				  name: ptSkill.skill.name,
				  icon: ptSkill.skill.icon,
    					},)
    				},
			  ),
    			},)
		  },),
    	},)
	  }
}