import { ApiProperty, } from '@nestjs/swagger'
import type { ContractorSkillNama, } from '@prisma/client'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, } from 'class-validator'
import type { TargetType, } from 'src/shared/types/target.types'

export class TargetDtoCreate {
    @ApiProperty()
    @IsString()
	public id!: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public officeId?: Array<string>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public b2bClientId?: Array<string>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public subbrandId?: Array<string>
}

export class CreatePackageDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public title!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    public price!: number

    @IsArray()
    public productTypeIds! : Array<string>

    @ApiProperty()
    @IsObject()
    public targets!: TargetDtoCreate

    @ApiProperty()
    @IsString()
    @IsOptional()
    public description?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public picture?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public pictureName?: string
}

export class UpdatePackageDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsOptional()
	public title?: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
	public price?: number

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @IsOptional()
	public products?: Array<{
        id: string;
        name: string;
    }>

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @IsOptional()
	public productTypeIds?: Array<string>

    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    @IsOptional()
	public targets?: TargetDtoCreate

    @ApiProperty()
    @IsString()
    @IsOptional()
    public picture?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public pictureName?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public description?: string
}
