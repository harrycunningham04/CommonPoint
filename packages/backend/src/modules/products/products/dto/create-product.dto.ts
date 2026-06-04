/* eslint-disable arrow-body-style */
import { ApiProperty, } from '@nestjs/swagger'

import {
	IsArray,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from 'class-validator'
import {
	ProductVariantDto,
} from './product-variant.dto'
import { Type, } from 'class-transformer'

export class CreateProductDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public name!: string

    @ApiProperty({ isArray: true, type: ProductVariantDto, },)
    @IsArray()
    @ValidateNested({ each: true, },)
    @Type(() => ProductVariantDto,)
    public productVariants!: Array<ProductVariantDto>
}
