import { ApiProperty, } from '@nestjs/swagger'
import { ClientDisputeCategory, DisputeTheme, } from '@prisma/client'
import { IsEnum, IsOptional, IsString, } from 'class-validator'

export class CreateDisputeDto {
    @ApiProperty({ enum: DisputeTheme, },)
    @IsEnum(DisputeTheme,)
	public theme?: DisputeTheme

    @ApiProperty()
    @IsOptional()
    @IsString()
    public description?:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public bookingGroupId?:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public b2CClientId?:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public b2BClientId?:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public clientInvoiceB2BId?:string

    @ApiProperty()
    @IsEnum(ClientDisputeCategory,)
    public category!:ClientDisputeCategory
}