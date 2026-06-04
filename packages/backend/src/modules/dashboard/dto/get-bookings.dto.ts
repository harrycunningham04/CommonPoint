import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class GetBookingsDto extends PageOptionsDto {
    @ApiProperty({
    	type:        String,
    	description: 'The ids of the office',
    },)
    @IsArray()
    @IsString({ each: true, },)
    @IsOptional()
	public officeIds?: Array<string>
}