/* eslint-disable no-mixed-spaces-and-tabs */
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, } from 'class-validator'

import { IsNotEmpty, } from 'class-validator'

import { ApiProperty, } from '@nestjs/swagger'
import type {
	Adjustments,
	Booking,
	BookingToProductType,
	EditedMaterial,
	ProductType,
	ProductTypeSkills,
	Skills,} from '@prisma/client'
import {
	EditRequestType,
} from '@prisma/client'
import type {
	EditRequest,} from '@prisma/client'
import { AdjustmentType, ContractorSkillNama, MaterialRawType, MaterialTypeContent,} from '@prisma/client'

export class BasicBookingMaterialDto {
	constructor(data?: BasicBookingMaterialDto,) {
		if (data) {
			this.id = data.id
			this.url = data.url
			this.fileSize = data.fileSize
			this.contentType = data.contentType
			this.name = data.name
		}
	}

  @ApiProperty({
  	description: 'The id of the material',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsNotEmpty()
	public id!: string

  @ApiProperty({
  	description: 'The url of the material',
  	example:     'https://example.com/material.jpg',
  },)
  @IsString()
  @IsNotEmpty()
  public url!: string

  @ApiProperty({
  	description: 'The file size of the material',
  	example:     1000,
  },)
  @IsNumber()
  @IsNotEmpty()
  public fileSize!: number

  @ApiProperty({
  	description: 'The content type of the material',
  	example:     'image/jpeg',
  },)
  @IsEnum(MaterialTypeContent,)
  @IsNotEmpty()
  public contentType!: MaterialTypeContent

  @ApiProperty({
  	description: 'The name of the material',
  	example:     'material.jpg',
  },)
  @IsString()
  @IsNotEmpty()
  public name!: string
}

export class BookingAdminRawMaterialsDto extends BasicBookingMaterialDto {
	constructor(data?: BookingAdminRawMaterialsDto,) {
		super(data,)
		if (data) {
			this.rawType = data.rawType
		}
	}

  @ApiProperty({
  	description: 'The raw type of the material',
  	example:     MaterialRawType.RAW,
  },)
  @IsEnum(MaterialRawType,)
  @IsNotEmpty()
	public rawType!: MaterialRawType
}

export class BookingAdminEditedMaterialsDto extends BasicBookingMaterialDto {
	constructor(data?: BookingAdminEditedMaterialsDto,) {
		super(data,)
		if (data) {
			this.editRequest = data.editRequest
			this.isEditRequest = data.isEditRequest
		}
	}

  @ApiProperty({
  	description: 'The edit request of the material',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsObject()
  @IsNotEmpty()
  @IsOptional()
	public editRequest!: EditRequest | null

  @ApiProperty({
  	description: 'The is edit request of the material',
  	example:     false,
  },)
  @IsBoolean()
  @IsNotEmpty()
  public isEditRequest!: boolean
}

export class BookingAdminGeneralEditRequestDto {
	constructor(data?: BookingAdminGeneralEditRequestDto,) {
		if (data) {
			this.id = data.id
			this.contentType = data.contentType
			this.requestedChange = data.requestedChange
			this.type = data.type
		}
	}

  @ApiProperty({
  	description: 'The id of the edit request',
  	example:     '123e4567-e89b-12d3-a456-426614174000',
  },)
  @IsString()
  @IsNotEmpty()
	public id!: string

  @ApiProperty({
  	description: 'The content type of the edit request',
  	example:     'PHOTOS',
  },)
  @IsEnum(MaterialTypeContent,)
  @IsNotEmpty()
  public contentType!: MaterialTypeContent

  @ApiProperty({
  	description: 'The requested change of the edit request',
  	example:     'PHOTOS',
  },)
  @IsString()
  @IsNotEmpty()
  public requestedChange!: string

  @ApiProperty({
  	description: 'The type of the edit request',
  	example:     EditRequestType.GROUP_BY_CONTENT_TYPE,
  },)
  @IsEnum(EditRequestType,)
  @IsNotEmpty()
  public type!: EditRequestType
}

export class BookingAdminEditedMaterialsDtoResponse {
	constructor(data?: BookingAdminEditedMaterialsDtoResponse,) {
		if (data) {
			this.materialsRequired = data.materialsRequired
			this.editedMaterials = data.editedMaterials
			this.materialsRequested = data.materialsRequested
		}
	}

  @ApiProperty({
  	description: 'The materials required for the booking',
  	example:     [],
  },)
  @IsArray()
  @IsNotEmpty()
	public materialsRequired!: Array<MaterialTypeContent>

  @ApiProperty({
  	description: 'The edited materials for the booking',
  	example:     [],
  },)
  @IsArray()
  @IsNotEmpty()
  public editedMaterials!: Array<BookingAdminEditedMaterialsDto>

  @ApiProperty({
  	description: 'The materials requested for the booking',
  	example:     [],
  },)
  @IsArray()
  @IsNotEmpty()
  public materialsRequested!: Array<MaterialTypeContent>

  public static castMaterialsRequested(
  	materialsRequested: Array<EditRequest>,
  	editedMaterials: Array<EditedMaterial & {editRequest?: EditRequest | null}>,
  ): Array<MaterialTypeContent> {
  	const materialsRequestedReturn: Set<MaterialTypeContent> = new Set<MaterialTypeContent>()

  	materialsRequested.forEach((material,) => {
  		if (material.contentType) {
  			materialsRequestedReturn.add(material.contentType,)
  		}
  	},)

  	editedMaterials.forEach((material,) => {
  		if (material.editRequest) {
  			materialsRequestedReturn.add(material.contentType,)
  		}
  	},)

  	return Array.from(materialsRequestedReturn,)
  }
}

export class BookingRawMaterialDtoResponse {
	constructor(data?: BookingRawMaterialDtoResponse,) {
		if (data) {
			this.materialsRequired = data.materialsRequired
			this.rawMaterials = data.rawMaterials
		}
	}

  @ApiProperty({
  	description: 'The materials required for the booking',
  	example:     [],
  },)
  @IsArray()
  @IsNotEmpty()
	public materialsRequired!: Array<MaterialTypeContent>

  @ApiProperty({
  	description: 'The raw materials for the booking',
  	example:     [],
  },)
  @IsArray()
  @IsNotEmpty()
  public rawMaterials!: Array<BookingAdminRawMaterialsDto>

  public static castBooking(
  	booking: Booking & {
      BookingToProductType: Array<
        BookingToProductType & {
          productType: ProductType & {
            adjustments?: Adjustments | null;
            productTypeSkills?: Array<ProductTypeSkills & {
              skill: Skills
            }> | null;
          };
        }
      >;
    },
  	isEdited = false,
  ): Array<MaterialTypeContent> {
  	const materialsRequired: Array<MaterialTypeContent> = []
  	booking.BookingToProductType.forEach((bookingToProductType,) => {
  		const adjustmentType = bookingToProductType.productType.adjustments?.type

  		if (adjustmentType === AdjustmentType.PHOTOS) {
  			materialsRequired.push(MaterialTypeContent.PHOTOS,)
  		}

  		if (adjustmentType === AdjustmentType.CLIPS) {
  			materialsRequired.push(MaterialTypeContent.VIDEOS,)
  			materialsRequired.push(MaterialTypeContent.AUDIOS,)
  		}

  		if (bookingToProductType.productType.productTypeSkills) {
  			bookingToProductType.productType.productTypeSkills.forEach((productTypeSkill,) => {
  				if (productTypeSkill.skill.name === ContractorSkillNama.FLOORPLAN || productTypeSkill.skill.name === ContractorSkillNama.LEASE_PLAN) {
  					materialsRequired.push(MaterialTypeContent.SKETCHES,)
  				}
  			},)
  		}
  	},)

  	if (isEdited) {
  		return [...materialsRequired,]
  	}

  	return [...materialsRequired, MaterialTypeContent.REFERENCES,]
  }
}
