import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsUUID, } from 'class-validator'

export class ReorderBookingsDto {
    @ApiProperty()
    @IsArray()
    @IsUUID('all', { each: true, },)
	public orderIds!: Array<string>
}