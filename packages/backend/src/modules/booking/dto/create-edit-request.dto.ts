/* eslint-disable arrow-body-style */
import { ApiProperty, } from '@nestjs/swagger'
import { EditRequestType, MaterialTypeContent, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested, } from 'class-validator'

export class SingleMaterialEditRequestDto {
    @ApiProperty()
    @IsUUID()
	public editedMaterialId!: string

    @ApiProperty()
    @IsUUID()
    public bookingId!: string

    @ApiProperty()
    @IsString()
    public requestedChange!: string
}

export class GroupEditRequestDto {
    @ApiProperty()
    @IsString()
	public requestedChange!: string

    @ApiProperty()
    @IsEnum(MaterialTypeContent,)
    public contentType!: MaterialTypeContent

    @ApiProperty()
    @IsString()
    @IsOptional()
    public bookingId?: string
}

export class CreateEditRequestDto {
    @ApiProperty({ isArray: true, type: SingleMaterialEditRequestDto, },)
    @IsArray()
    @ValidateNested({ each: true,},)
    @IsOptional()
    @Type(() => SingleMaterialEditRequestDto,)
	public requestedChanges?: Array<SingleMaterialEditRequestDto>

    @ApiProperty()
    @IsEnum(EditRequestType,)
    @IsOptional()
    public type?: EditRequestType

    @ApiProperty()
    @ValidateNested()
    @Type(() => GroupEditRequestDto,)
    @IsOptional()
    public groupChanges?: GroupEditRequestDto

    @ApiProperty()
    @IsString()
    @IsOptional()
    public adminId?: string
}

export class CreateClientEditRequestDto {
    @ApiProperty({ isArray: true, type: SingleMaterialEditRequestDto, },)
    @IsArray()
    @ValidateNested({ each: true,},)
    @IsOptional()
    @Type(() => SingleMaterialEditRequestDto,)
	public requestedChanges?: Array<SingleMaterialEditRequestDto>

    @ApiProperty()
    @IsEnum(EditRequestType,)
    @IsOptional()
    public type?: EditRequestType

    @ApiProperty()
    @ValidateNested()
    @Type(() => GroupEditRequestDto,)
    @IsOptional()
    public groupChanges?: GroupEditRequestDto

    @ApiProperty()
    @IsString()
    public bookingGroupId!: string
}