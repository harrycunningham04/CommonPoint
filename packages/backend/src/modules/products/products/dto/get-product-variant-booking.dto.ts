/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
/* eslint-disable indent */
import { ApiProperty, } from '@nestjs/swagger'
import type {
  ContractorSkillNama,
  ProductType,
  ProductTypeSkills,
  ProductTypeSpecialPrice,
  Skills,
} from '@prisma/client'
import { Type, } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'

export class BookingProductDto extends PageOptionsDto {
  @ApiProperty({ type: Number, },)
  @Type(() => {
    return Number
  },)
  @IsInt()
  public sqft!: number

  @ApiProperty({ type: Number, },)
  @Type(() => {
    return Number
  },)
  @IsInt()
  public bedrooms!: number

  @ApiProperty({ type: Number, },)
  @Type(() => {
    return Number
  },)
  @IsInt()
  @IsOptional()
  public productTypesTake?: number

  @ApiProperty({ type: String, },)
  @IsOptional()
  @IsString()
  public search?: string

  @ApiProperty({ type: String, },)
  @IsOptional()
  @IsString()
  public officeId?: string
}

export class BookingProductVariantDto extends PageOptionsDto {
  @ApiProperty({ type: Number, },)
  @Type(() => {
    return Number
  },)
  @IsInt()
  public sqft!: number

  @ApiProperty({ type: Number, },)
  @Type(() => {
    return Number
  },)
  @IsInt()
  public bedrooms!: number

  @ApiProperty({ type: String, },)
  @IsOptional()
  @IsString()
  public search?: string

  @ApiProperty({ type: String, },)
  @IsString()
  public productId!: string

  @ApiProperty({ type: String, },)
  @IsOptional()
  @IsString()
  public officeId?: string
}

export class BasicProductTypeDto {
  constructor(data?: BasicProductTypeDto,) {
    if (data) {
      this.id = data.id
      this.name = data.name
      this.descriptionClient = data.descriptionClient
      this.descriptionContractor = data.descriptionContractor
      this.requiresOnSiteContractor = data.requiresOnSiteContractor
      this.price = data.price
      this.skills = data.skills
      this.duration = data.duration
    }
  }

  @IsUUID()
  @IsNotEmpty()
  public id!: string

  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsBoolean()
  public requiresOnSiteContractor!: boolean

  @IsString()
  @IsOptional()
  public descriptionContractor?: string

  @IsString()
  @IsOptional()
  public descriptionClient?: string

  @IsNumber()
  @IsNotEmpty()
  public price!: number

  @IsNumber()
  @IsNotEmpty()
  public duration!: number

  @IsArray()
  public skills!: Array<ContractorSkillNama>
}

export class ProductTypeResponseDto {
  @IsArray()
  @ValidateNested({ each: true, },)
  @Type(() => {
    return BasicProductTypeDto
  },)
  public productTypes: Array<BasicProductTypeDto>

  constructor(
    productTypes: Array<
      ProductType & {
        productTypeSkills: Array<ProductTypeSkills & { skill: Skills }>;
        specialPrices: Array<ProductTypeSpecialPrice>;
      }
    >,
  ) {
    this.productTypes = productTypes.map((productType,) => {
      return new BasicProductTypeDto({
        id:                       productType.id,
        name:                     productType.name,
        descriptionClient:        productType.description_client ?? undefined,
        descriptionContractor:    productType.description_contractor ?? undefined,
        requiresOnSiteContractor: productType.requires_on_site_contractor,
        price:                    productType.price,
        duration:                 productType.duration,
        skills:                   productType.productTypeSkills.map((skill,) => {
          return skill.skill.name
        },),
      },)
    },)
  }

  public static cast(
    productTypes: Array<
      ProductType & {
        productTypeSkills: Array<ProductTypeSkills & { skill: Skills }>;
        specialPrices?: Array<ProductTypeSpecialPrice>;
      }
    >,
  ): ProductTypeResponseDto {
    return {
      productTypes: productTypes.map((productType,) => {
        const price = productType.specialPrices?.find((sp,) => {
          return sp.price !== undefined
        },)?.price ?? productType.price
        return new BasicProductTypeDto({
          id:                productType.id,
          name:              productType.name,
          descriptionClient: productType.description_client ?? undefined,
          descriptionContractor:
            productType.description_contractor ?? undefined,
          requiresOnSiteContractor: productType.requires_on_site_contractor,
          price,
          duration:                 productType.duration,
          skills:                   productType.productTypeSkills.map((skill,) => {
            return skill.skill.name
          },),
        },)
      },),
    }
  }
}

export class ProductWithTypesDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  public id!: string

  @IsString()
  @ApiProperty()
  public name!: string

  @IsBoolean()
  @ApiProperty()
  public requiresOnSiteContractor!: boolean

  @IsNumber()
  @ApiProperty()
  public price!: number

  @ValidateNested()
  @Type(() => {
    return PagedResDto
  },)
  @ApiProperty({
    type: () => {
      return PagedResDto<BasicProductTypeDto>
    },
  },)
  public productTypes!: PagedResDto<BasicProductTypeDto>
}
