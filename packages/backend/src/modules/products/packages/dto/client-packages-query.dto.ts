import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class ClientPackagesQueryDto extends PageOptionsDto {
	@ApiProperty({
		description: 'Search query for package title',
		example:     'premium',
		required:    false,
	},)
	@IsOptional()
	@IsString()
	public search?: string
}