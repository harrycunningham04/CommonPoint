import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsString, IsNotEmpty, IsNumberString, IsArray, } from 'class-validator'
import type { ClientDisputeCategory, DisputeStatus, } from '@prisma/client'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export enum SortDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc',
}

export enum SortBy {
    ALPHABETIC = 'alphabetic',
    DATE = 'date',
}

export class FilterDisputesDto {
    @IsOptional()
    @IsArray()
	public mark?: Array<DisputeStatus>

    @IsOptional()
    @IsArray()
    public category?: Array<ClientDisputeCategory>

    @IsOptional()
    @IsArray()
    	offices?: Array<string>

    @IsOptional()
    @IsString()
    public startDate?: string

    @IsOptional()
    @IsString()
    public endDate?: string

    @IsOptional()
    @IsEnum(SortBy,)
    public sortBy?: SortBy

    @IsOptional()
    @IsEnum(SortDirection,)
    public sortDirection?: SortDirection

    @ApiProperty()
    @IsOptional()
    @IsString()
    public showArchive?: string
}

export class GetDisputeDto  extends PageOptionsDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public search?: string

    @ApiProperty()
    @IsOptional()
    public filter?: FilterDisputesDto
}

export const DisputeStatusToName: Record<DisputeStatus, string> = {
	IN_PROGRESS:   'In progress',
	UNSOLVED:    'Unsolved',
	DONE:        'Done',
}