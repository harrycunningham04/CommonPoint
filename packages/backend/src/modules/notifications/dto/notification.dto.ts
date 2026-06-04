import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsString, IsNotEmpty, IsNumberString, } from 'class-validator'
import { NotificationType, } from '@prisma/client'

export enum SortDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc',
}

export enum SortBy {
    ALPHABETIC = 'alphabetic',
    DATE = 'date',
}

export class FilterNotificationsDto {
    @IsOptional()
    @IsString()
	public contractors?: Array<string>

    @IsOptional()
    @IsString()
    public clients?: Array<string>

    @IsOptional()
    @IsString()
    public addresses?: Array<string>

    @IsOptional()
    @IsString()
    public startDate?: string

    @IsOptional()
    @IsString()
    public endDate?: string
}

export class GetNotificationsDto {
    @ApiProperty()
    @IsOptional()
	public type?: NotificationType

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
    public filter?: FilterNotificationsDto
}
