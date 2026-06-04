/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, } from 'class-validator'
import { Type, } from 'class-transformer'
import { ContractorMark } from '@prisma/client'

export class CreateContractorDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public email!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public surname!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public phone!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    public onSite!: boolean

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(ContractorMark,)
    public mark!: ContractorMark
}
