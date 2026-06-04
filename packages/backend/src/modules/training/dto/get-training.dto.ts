import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsDateString, IsNotEmpty, IsNumberString, IsOptional, IsString, } from 'class-validator'

export class FilterDto {
    @ApiProperty()
    @IsOptional()
    @IsDateString()
	public dateFrom?: string

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    public dateTo?: string

    @ApiProperty()
    @IsOptional()
    @IsArray()
    public category?: Array<string>

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortBy?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public sortDirection?: string
}

export class GetTrainingsDto {
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
