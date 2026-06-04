import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, } from 'class-validator'

export class ChangeContractDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
	public name?: string
}
