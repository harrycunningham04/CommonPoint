import { MaterialRawType, MaterialTypeContent } from '@prisma/client'
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, } from 'class-validator'

export class UploadRawAdminDto {
	@IsString()
	@IsNotEmpty()
	public url!: string

	@IsString()
	@IsNotEmpty()
	public name!: string

	@IsNumber()
	@IsNotEmpty()
	public fileSize!: number

	@IsEnum(MaterialRawType,)
	@IsNotEmpty()
	public rawType!: MaterialRawType

	@IsEnum(MaterialTypeContent,)
	@IsNotEmpty()
	public contentType!: MaterialTypeContent
}

export class UploadRawAdminDtoForService {
	@IsArray()
	@IsNotEmpty()
	public rawMaterials!: Array<UploadRawAdminDto>
}


