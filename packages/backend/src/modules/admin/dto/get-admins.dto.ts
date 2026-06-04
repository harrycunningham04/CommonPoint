import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsBooleanString, IsNotEmpty, IsNumberString, IsOptional, IsString, } from 'class-validator'

export class FilterDto {
    @ApiProperty()
    @IsOptional()
    @IsArray()
	public role?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public access?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsBooleanString()
    public archived?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortBy?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortDirection?: string
}

export class GetAdminsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
	public page: string = '1'

    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    public limit: string = '10'

    @ApiProperty()
    @IsOptional()
    @IsString()
    public search?: string

    @ApiProperty()
    @IsOptional()
    public filter?: FilterDto
}
