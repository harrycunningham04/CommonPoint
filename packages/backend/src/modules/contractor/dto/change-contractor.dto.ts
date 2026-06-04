import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, } from 'class-validator'

export class ChangeContractorDto {
    @ApiProperty()
    @IsArray()
	public regionNames!: Array<string>
}
