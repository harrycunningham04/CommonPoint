import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsOptional, } from 'class-validator'

export class ChangeStatisticsColumnsDto {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
	public photoSLA?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public sketchSLA?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public contentSLA?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public floorplanSLA?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public earning?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public avgComplRate?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public avgPhotoCapture?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public avgJobPerWeek?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public totalJobsDone?: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    public howOftenOnTime?: boolean
}
