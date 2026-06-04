import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsBooleanString, IsNotEmpty, IsNumberString, IsOptional, IsString, } from 'class-validator'
import type { BookingStatus, } from '../booking.types'
import type { BookingStage, } from '@prisma/client'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { Type, } from 'class-transformer'

export class FilterDto {
    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsBooleanString()
   
	public showArchive?: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    public priority?: Array<string>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsArray()
    public statuses?: Array<BookingStatus>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsArray()
    public stages?: Array<BookingStage>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsArray()
    public contractors?: Array<string>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsArray()
    public address?: Array<string>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsArray()
    public clients?: Array<string>

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public sortBy?: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public sortDirection?: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public startDate?: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
    public endDate?: string
}

export class GetBookingsDto extends PageOptionsDto {
    @ApiProperty({ required: false, },)
    @IsOptional()
    @IsString()
	public search?: string

    @ApiProperty({ required: false, },)
    @IsOptional()
    public filter?: FilterDto

    @ApiProperty()
    @IsBooleanString()
    public isOrder?: string

    @ApiProperty()
    @IsBooleanString()
    public isDashboard?: string
}