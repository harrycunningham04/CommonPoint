import { ApiProperty, } from '@nestjs/swagger'
import { BookingRoute } from '@prisma/client'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, } from 'class-validator'

export class SkillDto {
	constructor(data?: SkillDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.icon = data.icon
			return
		}
		this.id = ''
		this.name = ''
		this.icon = ''
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the skill',
	},)
	@IsString()
	@IsNotEmpty()
	public id: string

	@ApiProperty({
		type:        String,
		description: 'The name of the skill',
	},)
	@IsString()
	@IsNotEmpty()
	public name: string

	@ApiProperty({
		type:        String,
		description: 'The icon of the skill',
	},)
	@IsString()
	@IsNotEmpty()
	public icon: string
}

export class MapInfoDto {
	constructor(data?: MapInfoDto,) {
		if (data) {
			this.estimatedTime = data.estimatedTime
			this.estimatedTimeToKeyLocation = data.estimatedTimeToKeyLocation
			this.estimatedTimeToLocation = data.estimatedTimeToLocation
			this.wayStringToKeyLocation = data.wayStringToKeyLocation
			this.wayStringToLocation = data.wayStringToLocation
			return
		}
		this.estimatedTime = 0
		this.estimatedTimeToLocation = 0
		this.wayStringToLocation = ''
	}

	@ApiProperty({
		type:        Number,
		description: 'The estimated time of the booking',
	},)
	@IsNumber()
	public estimatedTime: number

	@ApiProperty({
		type:        Number,
		description: 'The estimated time to key location of the booking',
	},)
	@IsNumber()
	@IsOptional()
	public estimatedTimeToKeyLocation?: number

	@ApiProperty({
		type:        Number,
		description: 'The estimated time to location of the booking',
	},)
	@IsNumber()
	public estimatedTimeToLocation: number | null

	@ApiProperty({
		type:        String,
		description: 'The way string to key location of the booking',
	},)
	@IsString()
	@IsOptional()
	public wayStringToKeyLocation?: string

	@ApiProperty({
		type:        String,
		description: 'The way string to location of the booking',
	},)
	@IsString()
	public wayStringToLocation: string

	public static cast(mapInfo?:{
		estimatedTimeToLocation: number,
		estimatedTimeToKeyLocation?: number,
		wayStringToLocation: string,
		wayStringToKeyLocation?: string,
	},): MapInfoDto {
		return mapInfo ?
			new MapInfoDto({
				estimatedTime:              (mapInfo.estimatedTimeToKeyLocation ?? 0) + mapInfo.estimatedTimeToLocation,
				estimatedTimeToKeyLocation: mapInfo.estimatedTimeToKeyLocation ?? undefined,
				estimatedTimeToLocation:    mapInfo.estimatedTimeToLocation,
				wayStringToKeyLocation:     mapInfo.wayStringToKeyLocation ?? undefined,
				wayStringToLocation:        mapInfo.wayStringToLocation,
			},) :
			new MapInfoDto({
				estimatedTime:              0,
				estimatedTimeToKeyLocation: 0,
				estimatedTimeToLocation:    0,
				wayStringToKeyLocation:     '',
				wayStringToLocation:        '',
			},)
	}
}

export class BookingEquipmentResDto {
	constructor(data?: BookingEquipmentResDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.equipments = data.equipments
			return
		}
		this.id = ''
		this.address = ''
		this.equipments = []
	}

	@ApiProperty({
		type:        String,
		description: 'The id of the booking',
	},)
	@IsString()
	@IsNotEmpty()
	public id: string

	@ApiProperty({
		type:        String,
		description: 'The address of the booking',
	},)
	@IsString()
	@IsNotEmpty()
	public address: string

	@ApiProperty({
		type:        Array<string>,
		description: 'The equipments of the booking',
	},)
	@IsArray()
	@IsString({ each: true, },)
	public equipments: Array<string>
}
