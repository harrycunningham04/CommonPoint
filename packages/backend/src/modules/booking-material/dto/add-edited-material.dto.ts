/* eslint-disable arrow-body-style */
import { ApiProperty, } from '@nestjs/swagger'
import { MaterialTypeContent, } from '@prisma/client'
import { Type, } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator'

export class AddEditedMaterialDto {
    @ApiProperty()
    @IsString()
	public url!: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public thumbnailUrl?: string

    @ApiProperty()
    @IsEnum(MaterialTypeContent,)
    public contentType!: MaterialTypeContent

    @ApiProperty()
    @IsString()
    public name!: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsNumber()
    public fileSize?: number

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public mimetype?: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsBoolean()
    public isAdminUploaded?: boolean
}

export class AddEditedMaterialsDto {
    @ApiProperty({ type: AddEditedMaterialDto, isArray: true, },)
    @Type(() => AddEditedMaterialDto,)
    @ValidateNested({ each: true, },)
	public materials!: Array<AddEditedMaterialDto>

    @ApiProperty({ type: Boolean, },)
    @IsBoolean()
    @Type(() => Boolean,)
    @IsOptional()
    public isReplace?: boolean
}
