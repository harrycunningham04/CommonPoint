import { ApiProperty, } from '@nestjs/swagger'
import type { RawMaterial, } from '@prisma/client'
import type { JsonValue, } from '@prisma/client/runtime/library'
import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, } from 'class-validator'
import { EFloorplanChecklist, MaterialTypeContent, } from 'src/modules/booking/booking.types'

export class RawMaterialDto {
	constructor(data?: RawMaterialDto,) {
		if (data) {
			this.url = data.url
			this.name = data.name
			this.id = data.id
			return
		}
		this.url = ''
		this.name = ''
		this.id = null
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the floorplan',
	},)
	@IsString()
	@IsOptional()
	public id: string | null

	@ApiProperty({
		type:        String,
		description: 'The url of the floorplan',
	},)
	@IsString()
	@IsNotEmpty()
	public url: string

	@ApiProperty({
		type:        String,
		description: 'The name of the floorplan',
	},)
	@IsString()
	@IsNotEmpty()
	public name: string
}

export class RawMaterialsDto {
	constructor(params?: RawMaterialsDto,) {
		if (params) {
			this.rawMaterials = params.rawMaterials
			this.id = params.id
			return
		}
		this.rawMaterials = []
		this.id = ''
	}

	@ApiProperty({
		type:        Array<RawMaterialDto>,
		description: 'The raw materials of the booking',
	},)
	@IsArray()
	@IsNotEmpty()
	@Type(() => {
		return RawMaterialDto
	},)
	@ValidateNested({ each: true, },)
	public rawMaterials: Array<RawMaterialDto>

	@ApiProperty({
		type:        String,
		description: 'The id of the booking',
	},)
	@IsString()
	@IsNotEmpty()
	public id: string

	public static cast(data: {
    id: string
    rawMaterial: Array<RawMaterial>
  },): RawMaterialsDto {
		return new RawMaterialsDto({
			id:           data.id,
			rawMaterials: data.rawMaterial.map((rawMaterial,) => {
				return new RawMaterialDto({
					id:   rawMaterial.id,
					url:  rawMaterial.url,
					name: rawMaterial.name,
				},)
			},),
		},)
	}
}


export class FloorplanCheckDto {
	constructor(params?: FloorplanCheckDto,) {
		if (params) {
			this.elementType = params.elementType
			this.isChecked = params.isChecked
			return
		}
		this.elementType = EFloorplanChecklist.ELEMENT_1
		this.isChecked = false
	}

	@ApiProperty({
		type:        String,
		description: 'The element type of the floorplan',
	},)
	@IsEnum(EFloorplanChecklist,)
	public elementType: EFloorplanChecklist

	@ApiProperty({
		type:        Boolean,
		description: 'The is checked of the floorplan',
	},)
	@IsBoolean()
	public isChecked: boolean
}

export class FloorplanChecklistDto {
	constructor(params?: FloorplanChecklistDto,) {
		if (params) {
			this.floorplanChecklist = params.floorplanChecklist
			this.bookingId = params.bookingId
			return
		}
		this.floorplanChecklist = []
		this.bookingId = ''
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the booking',
	},)
	@IsString()
	@IsNotEmpty()
	public bookingId: string

	@ApiProperty({
		type:        Array<FloorplanCheckDto>,
		description: 'The floorplan checklist of the booking',
	},)
	@IsArray()
	@IsNotEmpty()
	@Type(() => {
		return FloorplanCheckDto
	},)
	@ValidateNested({ each: true, },)
	public floorplanChecklist: Array<FloorplanCheckDto>

	public static cast(id: string,data: JsonValue | null,): FloorplanChecklistDto {
		if (!data) {
			return new FloorplanChecklistDto({
				bookingId:          id,
				floorplanChecklist: [],
			},)
		}
		return new FloorplanChecklistDto({
			bookingId:          id,
			floorplanChecklist: Object.entries(data,).map(([key, value,],) => {
				return new FloorplanCheckDto({
					elementType: key as EFloorplanChecklist,
					isChecked:   value,
				},)
			},),
		},)
	}

	public static castToRecord(data: FloorplanChecklistDto,): Record<string, boolean> {
		const acc: Record<string, boolean> = {}
		data.floorplanChecklist.forEach((floorplanChecklist,) => {
			acc[floorplanChecklist.elementType] = floorplanChecklist.isChecked
		},)
		return acc
	}
}