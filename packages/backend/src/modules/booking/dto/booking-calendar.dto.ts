import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsBooleanString, IsDate, IsDateString, IsNumber, IsObject, IsOptional, IsString, } from 'class-validator'
import type { SkillDto,} from './booking-mobile-res.dto'
import { MapInfoDto, } from './booking-mobile-res.dto'

export class GetBookingCalendarDto {
    @ApiProperty()
    @IsDateString()
    @IsOptional()
	public todayDate!: string

    @ApiProperty()
    @IsBooleanString()
    @IsOptional()
    public isThreeDays!: string

    @ApiProperty()
    @IsArray()
    @IsOptional()
    public contractorIds!: Array<string>
}

export class BookingRouteDto {
	constructor(data?:BookingRouteDto,) {
		if (data) {
			this.id = data.id
			this.estimatedTimeToLocation = data.estimatedTimeToLocation
		}
	}

    @ApiProperty()
    @IsString()
    @IsOptional()
	public id!: string

    @ApiProperty()
    @IsNumber()
    public estimatedTimeToLocation!: number
}

export class BookingCalendarDto {
	constructor(data?:BookingCalendarDto,) {
		if (data) {
			this.id = data.id
			this.dateTime = data.dateTime
			this.duration = data.duration
			this.contractorId = data.contractorId
			this.address = data.address
			this.mapInfo = data.mapInfo
			this.uniqueSkills = data.uniqueSkills
		}
	}

    @ApiProperty()
    @IsString()
    @IsOptional()
	public id!: string

    @ApiProperty()
    @IsDate()
    @IsOptional()
    public dateTime!: Date

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    public duration!: number

    @ApiProperty()
    @IsString()
    @IsOptional()
    public contractorId!: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public address!: string

    @ApiProperty()
    @IsObject()
    @IsOptional()
    public mapInfo?: BookingRouteDto

    @ApiProperty()
    @IsArray()
    public uniqueSkills!: Array<string>
}

export class BookingCalendarResponseDto {
    @ApiProperty()
    @IsArray()
    @IsOptional()
	public bookings!: Array<BookingCalendarDto>
}

export class UpdateBookingCalendarDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
	public previousBookingId?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public nextBookingId?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    public contractorId?: string

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    public dateTime?: string

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    public duration?: number
}

export class BookingCalendarAvailabilityDto {
    @ApiProperty()
    @IsArray()
    @IsOptional()
	public unavailableIntervals!: Array<{
        contractorId?: string
        dateTime?: string
        availability?: Array<Array<number>>
    }>
}

export class UpdateCalendarRouteDto {
    @ApiProperty()
    @IsNumber()
	public duration!: number
}