import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsString, } from 'class-validator'

export class GetContractsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public contractorId!: string
}
