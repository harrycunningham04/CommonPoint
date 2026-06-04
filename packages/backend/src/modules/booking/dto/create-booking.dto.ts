import { ApiProperty, } from '@nestjs/swagger'
import {
	IsArray,
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator'
import { BookingStatus, PropertyType, } from '../booking.types'

type ProductCreate = {
  id: string;
};
export class CreateBookingDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
	public client_b2c_id!: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public regionId!: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  public client_b2b_id!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public contractorId!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public adminId!: string

  @IsString()
  @IsOptional()
  public address?: string

  @ApiProperty({ enum: PropertyType, },)
  @IsEnum(PropertyType,)
  public property_type!: PropertyType

  @IsString()
  @IsOptional()
  public number_of_bedrooms?: string

  @IsString()
  @IsOptional()
  public square_footage?: string

  @IsString()
  @IsOptional()
  public key_instruction?: string

  @IsString()
  @IsOptional()
  public key_location_address?: string

  @IsDate()
  @IsOptional()
  public date_time?: Date

  @IsString()
  @IsOptional()
  public total_sum?: string

  @IsNumber()
  @IsOptional()
  public duration?: number

  @ApiProperty({ enum: BookingStatus, },)
  @IsEnum(BookingStatus,)
  public booking_status!: BookingStatus

  @ApiProperty()
  @IsArray()
  public products!: Array<string>
}
