import { MaterialRawType, MaterialTypeContent, } from '@prisma/client'
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, } from 'class-validator'
import { IsEnum, } from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import type { BookingBasicMaterial, } from './booking-get-materials.dto'
import { Type, } from 'class-transformer'

export class UploadMaterialDetailDto {
	@IsString()
	@IsNotEmpty()
	public url!: string

	@IsString()
	@IsNotEmpty()
	public name!: string

	@IsNumber()
	@IsNotEmpty()
	public fileSize!: number

	@IsNumberString()
	@Type(() => {
		return Number
	},)
	@IsOptional()
	public groupId?: number

	@IsDateString()
	@Type(() => {
		return Date
	},)
	@IsOptional()
	public takenAt?: Date
}

export class UploadMaterialDto {
	@IsEnum(MaterialTypeContent,)
	@IsNotEmpty()
	public contentType!: MaterialTypeContent

	@IsEnum(MaterialRawType,)
	@IsNotEmpty()
	public rawType!: MaterialRawType

	@IsArray()
	@IsNotEmpty()
	public rawMaterials!: Array<UploadMaterialDetailDto>
}

export class UploadMaterialDtoForService  {
	@ApiProperty({
		type:        Array,
		description: 'The list of uploaded raw materials',
	},)
	@IsArray()
	@IsOptional()
	public rawMaterials?: Array<BookingBasicMaterial>

	@ApiProperty({
		type:        Array,
		description: 'The list of uploaded raw additional materials',
	},)
	@IsArray()
	@IsOptional()
	public rawAdditionalMaterials?: Array<BookingBasicMaterial>
}
