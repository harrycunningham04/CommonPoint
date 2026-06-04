/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { BookingCGIClientPhotos, EditedMaterial, EditedMaterialVote, RawMaterial, RawMaterialVote,} from '@prisma/client'
import { MaterialTypeContent, VoteType, } from '@prisma/client'
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, } from 'class-validator'
import { IsString, } from 'class-validator'
import type { SkillDto, } from 'src/modules/booking/dto'
import { MaterialTypeContentClient, } from '../types/material-type'

export class ClientBookingInfoDto {
	constructor(data?: ClientBookingInfoDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.dateTime = data.dateTime
			this.uniqueSkills = data.uniqueSkills
		}
	}

  @ApiProperty({
  	description: 'The id of the booking',
  },)
  @IsString()
  @IsNotEmpty()
	public id!: string

  @ApiProperty({
  	description: 'The address of the booking',
  },)
  @IsString()
  @IsNotEmpty()
  public address!: string

  @ApiProperty({
  	description: 'The date and time of the booking',
  },)
  @IsString()
  @IsNotEmpty()
  public dateTime!: string

  @ApiProperty({
  	description: 'The unique skills of the booking',
  },)
  @IsArray()
  @IsNotEmpty()
  public uniqueSkills!: Array<SkillDto>
}

export class BasicClientBookingMaterialDto {
	constructor(data?: BasicClientBookingMaterialDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.fileSize = data.fileSize
			this.contentType = data.contentType
			this.url = data.url
			this.likes = data.likes
			this.dislikes = data.dislikes
			this.bookingId = data.bookingId
		}
	}

  @ApiProperty({
  	description: 'The id of the material',
  },)
  @IsString()
  @IsNotEmpty()
	public id!: string

  @ApiProperty({
  	description: 'The name of the material',
  },)
  @IsString()
  @IsNotEmpty()
  public name!: string

  @ApiProperty({
  	description: 'The file size of the material',
  },)
  @IsNumber()
  @IsNotEmpty()
  public fileSize!: number

  @ApiProperty({
  	description: 'The content type of the material',
  },)
  @IsEnum(MaterialTypeContent,)
  @IsNotEmpty()
  public contentType!: MaterialTypeContent

  @ApiProperty({
  	description: 'The url of the material',
  },)
  @IsString()
  @IsNotEmpty()
  public url!: string

  @ApiProperty({
  	description: 'The number of likes of the material',
  },)
  @IsNumber()
  @IsNotEmpty()
  public likes!: number

  @ApiProperty({
  	description: 'The number of dislikes of the material',
  },)
  @IsNumber()
  @IsNotEmpty()
  public dislikes!: number

  @ApiProperty({
  	description: 'The booking id of the material',
  },)
  @IsString()
  @IsNotEmpty()
  public bookingId!: string
}

export class CGIPhotoDto {
	constructor(data?: CGIPhotoDto,) {
		if (data) {
			this.id = data.id
			this.url = data.url
		}
	}

	@ApiProperty({
		description: 'The id of the material',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'The url of the material',
	},)
	@IsString()
	@IsNotEmpty()
	public url!: string
}

export class EditedMaterialDto extends BasicClientBookingMaterialDto {
	constructor(data?: EditedMaterialDto,) {
		super(data,)
		this.isHeroMaterial = data?.isHeroMaterial ?? false
		this.additionalCGIMaterial = data?.additionalCGIMaterial ?? null
	}

  @ApiProperty({
  	description: 'The number of likes of the material',
  },)
  @IsBoolean()
  @IsNotEmpty()
	public isHeroMaterial!: boolean

	@ApiProperty({
		description: 'The additional CGI material',
	},)
	@IsNotEmpty()
	@IsOptional()
  public additionalCGIMaterial!: CGIPhotoDto | null
}

export class ClientBookingMaterialInfoDto {
	constructor(data?: ClientBookingMaterialInfoDto,) {
		if (data) {
			this.materialName = data.materialName
			this.materialCount = data.materialCount
		}
	}

	@ApiProperty({
		description: 'The name of the material',
	},)
	@IsEnum(MaterialTypeContentClient,)
	@IsNotEmpty()
	public materialName!: MaterialTypeContentClient

	@ApiProperty({
		description: 'The count of the material',
	},)
	@IsNumber()
	@IsNotEmpty()
	public materialCount!: number
}

export class ClientBookingMaterialCountDto {
	constructor(data?: ClientBookingMaterialCountDto,) {
		if (data) {
			this.totalMaterials = data.totalMaterials
			this.uploadedMaterials = data.uploadedMaterials

			this.materialsInfo = data.materialsInfo
		}
	}

	@ApiProperty({
		description: 'The total number of materials',
	},)
	@IsNotEmpty()
	public totalMaterials!: number

	@ApiProperty({
		description: 'The number of uploaded materials',
	},)
	@IsNotEmpty()
	public uploadedMaterials!: number

	@ApiProperty({
		description: 'The materials info',
	},)
	@IsNotEmpty()
	public materialsInfo!: Array<ClientBookingMaterialInfoDto>

	public static castMaterialsInfo(materialsCount: Array<{
		type: MaterialTypeContentClient
		uploaded: number
	}>,): ClientBookingMaterialCountDto {
		return new ClientBookingMaterialCountDto({
			totalMaterials:    materialsCount.length,
			uploadedMaterials: materialsCount.filter((material,) => {
				return material.uploaded > 0
			},).length,
			materialsInfo:     materialsCount.map((material,) => {
				return new ClientBookingMaterialInfoDto({
					materialName:  material.type,
					materialCount: material.uploaded,
				},)
			},),
		},)
	}
}

export class ClientBookingMaterialDto {
	constructor(data?: ClientBookingMaterialDto,) {
		if (data) {
			this.bookingInfo = data.bookingInfo
			this.editedMaterials = data.editedMaterials
			this.additionalRawMaterials = data.additionalRawMaterials
			this.requiredMaterials = data.requiredMaterials
			this.materialsCount = data.materialsCount
		}
	}

  @ApiProperty({
  	description: 'The booking info',
  },)
  @IsNotEmpty()
	public bookingInfo!: ClientBookingInfoDto

  @ApiProperty({
  	description: 'The edited materials',
  },)
  @IsNotEmpty()
  public editedMaterials!: Array<EditedMaterialDto>

  @ApiProperty({
  	description: 'The additional raw materials',
  },)
  @IsNotEmpty()
  public additionalRawMaterials!: Array<BasicClientBookingMaterialDto>

  @ApiProperty({
  	description: 'The required materials',
  },)
  @IsNotEmpty()
  public requiredMaterials!: Array<MaterialTypeContentClient>

  @ApiProperty({
  	description: 'The materials count',
  },)
  @IsNotEmpty()
  public materialsCount!: ClientBookingMaterialCountDto

  public static castEdited(material: EditedMaterial & {
	EditedMaterialVote: Array<EditedMaterialVote>
	clientPhoto?:BookingCGIClientPhotos | null
  },): EditedMaterialDto {
  	const likesCount = material.EditedMaterialVote.reduce((acc, vote,) => {
  		return acc + (vote.voteType === VoteType.LIKE ?
  			1 :
  			0)
  	}, 0,)
  	const dislikesCount = material.EditedMaterialVote.reduce((acc, vote,) => {
  		return acc + (vote.voteType === VoteType.DISLIKE ?
  			1 :
  			0)
  	}, 0,)

  	return new EditedMaterialDto({
  		id:                    material.id,
  		name:                  material.name,
  		fileSize:              material.fileSize ?? 0,
  		contentType:           material.contentType,
  		url:                   material.url,
  		likes:                 likesCount,
  		dislikes:              dislikesCount,
  		isHeroMaterial:        material.isHeroShoot,
  		bookingId:             material.bookingId,
  		additionalCGIMaterial: material.clientPhoto ?
  			new CGIPhotoDto({
  			id:  material.clientPhoto.id,
  			url: material.clientPhoto.mainPhoto,
  		},) :
  			null,
  	},)
  }

  public static castRaw(material: RawMaterial & {
	RawMaterialVote: Array<RawMaterialVote>
  },): BasicClientBookingMaterialDto {
  	const likesCount = material.RawMaterialVote.reduce((acc, vote,) => {
  		return acc + (vote.voteType === VoteType.LIKE ?
  			1 :
  			0)
  	}, 0,)
  	const dislikesCount = material.RawMaterialVote.reduce((acc, vote,) => {
  		return acc + (vote.voteType === VoteType.DISLIKE ?
  			1 :
  			0)
  	}, 0,)

  	return new BasicClientBookingMaterialDto({
  		id:             material.id,
  		name:           material.name,
  		fileSize:       material.fileSize ?? 0,
  		contentType:    material.contentType,
  		url:            material.url,
  		likes:          likesCount,
  		dislikes:       dislikesCount,
  		bookingId:      material.bookingId,
  	},)
  }

  public static castRequiredMaterials(materials: Array<SkillDto>,): Array<MaterialTypeContentClient> {
  	return materials.map((material,) => {
  		switch (material.name) {
  		case 'VIDEO':
  			return MaterialTypeContentClient.VIDEOS
  		case 'PHOTO':
  			return MaterialTypeContentClient.PHOTOS
  		case 'FLOORPLAN':
  			return MaterialTypeContentClient.FLORPLANS
  		case 'LEASE_PLAN':
  			return MaterialTypeContentClient.LEASE_PLAN
  		case 'EPC':
  			return MaterialTypeContentClient.PHOTOS
  		case 'CGI':
  			return MaterialTypeContentClient.CGI_PHOTOS
  		default:
  			return MaterialTypeContentClient.PHOTOS
  		}
  	},)
  }
}
