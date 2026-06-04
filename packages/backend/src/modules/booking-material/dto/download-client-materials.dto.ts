import { ApiProperty, } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString, } from 'class-validator'
import { MaterialTypeContent, } from '@prisma/client'
import { MaterialTypeContentClient, } from '../types/material-type'
import { IsEnum, } from 'class-validator'

export class DownloadClientMaterialsDtoQuery {
	@ApiProperty({
		type:        MaterialTypeContent,
		description: 'The content type of the material',
	},)
	@IsEnum(MaterialTypeContentClient,)
	@IsOptional()
	public contentType?: MaterialTypeContentClient

	@ApiProperty({
		type:        Array,
		description: 'The booking group id',
	},)
	@IsArray()
	@IsNotEmpty()
	@IsOptional()
	public materialsId?: Array<string>
}