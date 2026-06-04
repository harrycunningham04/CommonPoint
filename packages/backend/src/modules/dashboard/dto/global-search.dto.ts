import { ApiProperty, } from '@nestjs/swagger'
import { ArrayUnique, IsArray, IsEnum, IsOptional, IsString, } from 'class-validator'
import { EGlobalSearchCategory, } from '../types/ECategories'
import { PageOptionsDto } from 'src/shared/dto/page-options.dto'

export class GetGlobalSearchDto extends PageOptionsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
	public search?: string

  @ApiProperty({ isArray: true, type: String, },)
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(EGlobalSearchCategory, { each: true, message: 'Each category must be a valid value', },)
  public category?: Array<EGlobalSearchCategory>
}
