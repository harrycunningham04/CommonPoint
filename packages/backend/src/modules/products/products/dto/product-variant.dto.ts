/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable arrow-body-style */
import { ApiProperty, } from '@nestjs/swagger'
import {
	AdjustmentType,
	EarningRateType,
	ContractorSkillNama,
	ProductMark,
	EquipmentType,
	CancellationFeeType,
	ComparisonOperator,
	$Enums,
} from '@prisma/client'

import { Type, } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator'
import { SkillDto, } from 'src/modules/booking/dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class ProductVariantDefaultEarningDto {
    @ApiProperty()
    @IsNumber()
	public earningRate!: number

    @ApiProperty({ enum: EarningRateType, },)
    @IsEnum(EarningRateType,)
    public rateType!: EarningRateType

    @ApiProperty()
    @Type(() => Number,)
    @IsNumber()
    @IsOptional()
    public additionalPrice?: number
}

export class ProductVariantAdjustmentDto {
    @ApiProperty({ enum: AdjustmentType, },)
    @IsEnum(AdjustmentType,)
	public type!: AdjustmentType

    @ApiProperty()
    @IsNumber()
    public value!: number

    @ApiProperty({ enum: ComparisonOperator, },)
    @IsOptional()
    @IsEnum(ComparisonOperator,)
    public comparisonOperator?: ComparisonOperator
}

export class CancellationFeeDto {
    @ApiProperty()
    @IsNumber()
	public value!: number

    @ApiProperty({ enum: CancellationFeeType, },)
    @IsEnum(CancellationFeeType,)
    public feeType!: CancellationFeeType
}

export class ProductVariantExampleDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public id?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public url!: string
}

export class ProductVariantAdditionalProductDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public id?: string

    @ApiProperty({ type: ProductVariantDefaultEarningDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductVariantDefaultEarningDto,)
    public earningRate?: ProductVariantDefaultEarningDto

    @ApiProperty({ type: ProductVariantAdjustmentDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductVariantAdjustmentDto,)
    public adjustments?: ProductVariantAdjustmentDto
}

export class ContractorDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
	public id!: string
}

export class ProductVariantDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public id?: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    public requiresOnSiteContractor!: boolean

    @ApiProperty()
    @IsOptional()
    @IsString()
    public descriptionContractor!: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public descriptionClient!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    public price!: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    public duration!: number

    @ApiProperty()
    @IsArray()
    @IsEnum(ContractorSkillNama, { each: true, },)
    public skills!: [ContractorSkillNama]

    @ApiProperty({ enum: ProductMark, },)
    @IsOptional()
    @IsEnum(ProductMark,)
    public mark?: ProductMark

    @ApiProperty({ enum: EquipmentType, isArray: true, },)
    @IsOptional()
    @IsArray()
    @IsEnum(EquipmentType, { each: true, },)
    public equipment?: Array<EquipmentType>

    @ApiProperty({ type: ProductVariantDefaultEarningDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductVariantDefaultEarningDto,)
    public earningRate?: ProductVariantDefaultEarningDto

    @ApiProperty({ type: ProductVariantAdjustmentDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductVariantAdjustmentDto,)
    public adjustments?: ProductVariantAdjustmentDto

    @ApiProperty({ type: ProductVariantAdditionalProductDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductVariantAdditionalProductDto,)
    public additionalProduct?: ProductVariantAdditionalProductDto

    @ApiProperty({ type: CancellationFeeDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => CancellationFeeDto,)
    public cancellationFee?: CancellationFeeDto

    @ApiProperty({ type: ProductVariantExampleDto, isArray: true, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductVariantExampleDto,)
    public examples?: Array<ProductVariantExampleDto>

    @ApiProperty({ type: ContractorDto, },)
    @IsOptional()
    @ValidateNested()
    @Type(() => ContractorDto,)
    public contractor?: ContractorDto
}

export class GetProductVariantsQuery extends PageOptionsDto {
  @ApiProperty({
  	description: 'Search term for product variants',
  	required:    false,
  	type:        String,
  },)
  @IsString()
  @IsOptional()
	public search?: string = ''

  @ApiProperty({
  	description: 'Field by which to sort product variants',
  	required:    false,
  	default:     'name',
  },)
  @IsString()
  @IsOptional()
  public sortBy?: string = 'name'

  @ApiProperty({
  	description: 'Sort direction (asc or desc)',
  	required:    false,
  	enum:        ['asc', 'desc',],
  	default:     'asc',
  },)
  @IsString()
  @IsOptional()
  public sortDirection?: 'asc' |'desc' = 'asc'

  @ApiProperty({
  	description: 'Filter by skill type',
  	required:    false,
  	enum:        ContractorSkillNama,
  },)
  @IsOptional()
  @IsEnum(ContractorSkillNama,)
  public skill?: ContractorSkillNama
}
