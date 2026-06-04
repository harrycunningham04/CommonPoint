import { ApiProperty, } from '@nestjs/swagger'
import { BookingStage, BookingStatus, PropertyType, } from '@prisma/client'
import { IsBoolean, IsOptional, IsString,IsEnum, IsArray, IsNumber, } from 'class-validator'

export class ChangeBookingDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
	public archived?: boolean

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public duration?: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  public contractorId?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public date_time?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public number_of_bedrooms? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public square_footage? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public trusteeName? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public trusteePhone? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public key_location_address? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public keysDateTime? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public alarmCode? : string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public key_instruction? : string

  @ApiProperty()
  @IsOptional()
  @IsEnum(PropertyType,)
  public property_type? : PropertyType

  @ApiProperty({ enum: BookingStatus, },)
  @IsOptional()
  @IsEnum(BookingStatus,)
  public booking_status?: BookingStatus

  @ApiProperty({ enum: BookingStage, isArray: true, },)
  @IsArray()
  @IsOptional()
  @IsEnum(BookingStage, { each: true, },)
  public booking_stage?: Array<BookingStage>

  @IsString()
  @IsOptional()
  public sessionId?: string
}
