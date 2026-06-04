import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsBooleanString, IsOptional, IsString, } from 'class-validator'

export class FilterDto {
    @ApiProperty()
    @IsOptional()
    @IsBooleanString()
	public archived?: string

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public mark?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public active?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public skills?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public rating?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortBy?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortDirection?: string
}

export class GetContractorsDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public search?: string

    @ApiProperty()
    @IsOptional()
    public filter?: FilterDto
}
