import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString,IsEnum, } from 'class-validator'
import { MaterialTypeContent, } from '../booking.types'

export class UploadFileBookingDto {
    @ApiProperty()
    @IsString()
	public bookingId?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    public materialType?: string

    @ApiProperty({ enum: MaterialTypeContent, },)
    @IsEnum(MaterialTypeContent,)
    public fileType!: MaterialTypeContent
}