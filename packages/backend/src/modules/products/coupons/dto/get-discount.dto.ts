/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty, IsNumber, } from 'class-validator'
import { AdditionalPhotoDto } from 'src/modules/booking/dto/booking-additional.dto'

export class GetDiscountDto {
    @ApiProperty({
    	description: 'The coupon code',
    	example:     '10OFF',
    },)
    @IsNotEmpty()
    @IsString()
	public code!: string

    @ApiProperty({
    	description: 'The product variant IDs',
    	example:     ['1', '2', '3',],
    },)
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    public productVariantIds!: Array<string>
}

export class GetAdditionalDiscountDto {
    @ApiProperty({
    	description: 'The coupon code',
    	example:     '10OFF',
    },)
    @IsNotEmpty()
    @IsString()
	public code!: string

    @ApiProperty({
    	description: 'The booking group ID',
    	example:     '123',
    },)
    @IsNotEmpty()
    public bookingGroupId!: string

    @ApiProperty({
    	description: 'The ids of the additional photos',
    	example:     ['1', '2', '3',],
    },)
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    public additionalPhotoIds!: Array<AdditionalPhotoDto>
}