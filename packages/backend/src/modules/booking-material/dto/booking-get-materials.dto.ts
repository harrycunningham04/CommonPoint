/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { EditedMaterial, RawMaterial,} from '@prisma/client'
import { MaterialTypeContent,  MaterialRawType,} from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, } from 'class-validator'
import { IsNotEmpty, } from 'class-validator'
import { BookingMaterialListDto, } from './booking-material-list.dto'
import { MaterialTypeContentClient } from '../types/material-type'

export class BookingGetMaterialsResDto {
	@ApiProperty({
	  type:        Object,
	  description: 'Grouped raw materials by content type',
	},)
	public rawMaterials!: Array<BookingBasicMaterial>

	@ApiProperty({
	  type:        Object,
	  description: 'Grouped raw additional materials by content type',
	},)
	public rawAdditionalMaterials!: Array<BookingBasicMaterial>

@ApiProperty({
	  type:        BookingMaterialListDto,
	  description: 'Basic booking information',
},)
	public bookingInfo!: BookingMaterialListDto

constructor(data: {
	  rawMaterials: Array<BookingBasicMaterial>;
	  rawAdditionalMaterials: Array<BookingBasicMaterial>;
	  bookingInfo: BookingMaterialListDto;
	},) {
	  this.rawMaterials = data.rawMaterials
	  this.bookingInfo = data.bookingInfo
	  this.rawAdditionalMaterials = data.rawAdditionalMaterials
}
}

export class BookingBasicMaterial {
	constructor(data?: BookingBasicMaterial,) {
	  if (data) {
			this.id = data.id
			this.url = data.url
			this.thumbnailUrl = data.thumbnailUrl
			this.contentType = data.contentType
			this.name = data.name
			this.fileSize = data.fileSize
			this.takenAt = data.takenAt
			this.groupId = data.groupId
			this.isMainPhoto = data.isMainPhoto
	  }
	}

	@ApiProperty({
	  type:        String,
	  description: 'The id of the material',
	},)
	@IsUUID()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
	  type:        String,
	  description: 'The url of the material',
	},)
	@IsString()
	@IsNotEmpty()
	public url!: string

	@ApiProperty({
	  type:        String,
	  description: 'The thumbnail url of the material',
	},)
	@IsString()
	@IsOptional()
	public thumbnailUrl!: string

	@ApiProperty({
	  type:        Number,
	  description: 'The file size of the material',
	},)
	@IsNumber()
	@IsOptional()
	public fileSize!: number

	@ApiProperty({
	  type:        MaterialTypeContent,
	  description: 'The content type of the material',
	},)
	@IsEnum(MaterialTypeContent,)
	@IsNotEmpty()
	public contentType!: MaterialTypeContent

	@ApiProperty({
	  type:        String,
	  description: 'The name of the material',
	},)
	@IsString()
	@IsNotEmpty()
	public name!: string

	@ApiProperty({
	  type:        Number,
	  description: 'The group id of the material',
	},)
	@IsNumber()
	@IsOptional()
	public groupId?: number | null

	@ApiProperty({
	  type:        Date,
	  description: 'The taken at of the material',
	},)
	@IsDate()
	@IsOptional()
	public takenAt?: Date | null

	@ApiProperty({
	  type:        Boolean,
	  description: 'The is main photo of the material',
	},)
	@IsBoolean()
	@IsOptional()
	public isMainPhoto?: boolean | null

	public static cast(materials: Array<RawMaterial>,): Array<BookingBasicMaterial> {
		const result: Array<BookingBasicMaterial> = []

		const groups = materials.reduce<Record<string, { sorted:Array<RawMaterial | EditedMaterial>, middleIndex: number }>>((acc, material,) => {
		  const groupId = 'groupId' in material && material.groupId ?
				material.groupId :
				`single-${material.id}`

		  if (!acc[groupId]) {
				acc[groupId] = { sorted: [], middleIndex: 0, }
		  }

		  acc[groupId]?.sorted.push(material,)

		  return acc
		}, {},)

		for (const { sorted, } of Object.values(groups,)) {
		  sorted.sort((a, b,) => {
				const aDate = 'takenAt' in a && a.takenAt ?
					new Date(a.takenAt,).getTime() :
					0
				const bDate = 'takenAt' in b && b.takenAt ?
					new Date(b.takenAt,).getTime() :
					0
				return aDate - bDate
		  },)

		  const middleIndex = Math.floor((sorted.length - 1) / 2,)

		  for (const material of sorted) {
				result.push(new BookingBasicMaterial({
			  id:           material.id,
			  url:          material.url,
			  thumbnailUrl: material.thumbnailUrl ?? '',
			  contentType:  material.contentType,
			  name:         material.name,
			  fileSize:     material.fileSize ?? 0,
			  groupId:      'groupId' in material ?
						material.groupId ?? null :
						null,
			  takenAt:      'takenAt' in material ?
						material.takenAt ?? null :
						null,
			  isMainPhoto:  material.id === sorted[middleIndex]?.id,
				},),)
		  }
		}

		return result
	  }
}

export class BookingMaterialsQueryDto {
	@ApiProperty({
		type:        MaterialTypeContent,
		description: 'The content type of the material',
	},)
	@IsEnum(MaterialTypeContent,)
	@IsNotEmpty()
	public contentType!: MaterialTypeContent
}

export class BookingMaterialsQueryDtoClient {
	@ApiProperty({
		type:        MaterialTypeContent,
		description: 'The content type of the material',
	},)
	@IsEnum(MaterialTypeContentClient,)
	@IsNotEmpty()
	public contentType!: MaterialTypeContentClient
}

