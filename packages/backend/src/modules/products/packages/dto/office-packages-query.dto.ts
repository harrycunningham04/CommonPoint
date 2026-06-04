import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class OfficePackagesQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for package title',
		example:     'basic',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string
}