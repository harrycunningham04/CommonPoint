/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, } from 'class-validator'
import { MaterialTypeUpload, } from '../types/material-type'
import type { ProductTypeSkills, RawMaterial, Skills,} from '@prisma/client'
import { AdjustmentType, MaterialTypeContent, MaterialRawType, type Adjustments, type Booking, type BookingToProductType, type ProductType, BookingStage, } from '@prisma/client'

export class BookingRequiredMaterials {
	constructor(data?: BookingRequiredMaterials,) {
		if (data) {
			this.requiredPhotos = data.requiredPhotos
			this.requiredVideos = data.requiredVideos
			this.requiredAudios = data.requiredAudios
		}
	}

  @ApiProperty({
  	type:        Number,
  	description: 'The number of required photos',
  },)
  @IsNumber()
  @IsNotEmpty()
	public requiredPhotos!: number

  @ApiProperty({
  	type:        Number,
  	description: 'The number of required videos',
  },)
  @IsNumber()
  @IsNotEmpty()
  public requiredVideos!: number

  @ApiProperty({
  	type:        Number,
  	description: 'The number of required audios',
  },)
  @IsNumber()
  @IsNotEmpty()
  public requiredAudios!: number
}

export class BookingMaterialListDto {
	constructor(data?: BookingMaterialListDto,) {
		if (data) {
			this.id = data.id
			this.address = data.address
			this.dateTime = data.dateTime
			this.requiredMaterials = data.requiredMaterials
			this.materialToUpload = data.materialToUpload
			this.uploadedPhotos = data.uploadedPhotos
			this.uploadedVideos = data.uploadedVideos
			this.uploadedAudios = data.uploadedAudios
			this.isEmpty = data.isEmpty
			this.isMarkedAsDone = data.isMarkedAsDone
		}
	}

  @ApiProperty({
  	type:        String,
  	description: 'The id of the booking',
  },)
  @IsUUID()
  @IsNotEmpty()
	public id!: string

  @ApiProperty({
  	type:        String,
  	description: 'The address of the booking',
  },)
  @IsString()
  @IsNotEmpty()
  public address!: string

  @ApiProperty({
  	type:        Date,
  	description: 'The date and time of the booking',
  },)
  @IsDate()
  @Type(() => {
  	return Date
  },)
  public dateTime!: Date

  @ApiProperty({
  	type:        Array,
  	description: 'The required materials for the booking',
  },)
  @IsNotEmpty()
  @Type(() => {
  	return BookingRequiredMaterials
  },)
  public requiredMaterials!: BookingRequiredMaterials

  @ApiProperty({
  	type:        Array,
  	description: 'The required materials for the booking',
  },)
  @IsArray(
  	{
  		each: true,
  	},
  )
  @IsEnum(MaterialTypeUpload, {
  	each: true,
  },)
  @IsNotEmpty()
  public materialToUpload!: Array<MaterialTypeUpload>

  @ApiProperty({
  	type:        Number,
  	description: 'The number of uploaded photos',
  },)
  @IsNumber()
  @IsNotEmpty()
  public uploadedPhotos!: number

  @ApiProperty({
  	type:        Number,
  	description: 'The number of uploaded videos',
  },)
  @IsNumber()
  @IsNotEmpty()
  public uploadedVideos!: number

  @ApiProperty({
  	type:        Number,
  	description: 'The number of uploaded audios',
  },)
  @IsNumber()
  @IsNotEmpty()
  public uploadedAudios!: number

  @ApiProperty({
  	type:        Boolean,
  	description: 'Whether the booking is empty',
  },)
  @IsBoolean()
  @IsNotEmpty()
  public isEmpty!: boolean

  @ApiProperty({
  	type:        Boolean,
  	description: 'Whether the booking is marked as done',
  },)
  @IsBoolean()
  @IsNotEmpty()
  public isMarkedAsDone!: boolean

  public static cast(booking: Booking & {
	rawMaterial: Array<RawMaterial>;

	BookingToProductType: Array<BookingToProductType & {
	  productType: ProductType & {
		adjustments?: Adjustments | null;
		productTypeSkills: Array<ProductTypeSkills & {
		  skill: Skills;
		}>;
	  };
	}>;
  },): BookingMaterialListDto {
  	const requiredMaterials = booking.BookingToProductType.map((bookingToProductType,) => {
  		const adjustmentType = bookingToProductType.productType.adjustments?.type
  		let requiredPhotos = 0
  		let requiredVideos = 0

  		if (adjustmentType === AdjustmentType.PHOTOS) {
  			requiredPhotos = bookingToProductType.productType.adjustments?.value ?? 0
  		}

  		if (adjustmentType === AdjustmentType.CLIPS) {
  			requiredVideos = bookingToProductType.productType.adjustments?.value ?? 0
  		}

  		return {
  			requiredPhotos,
  			requiredVideos,
  			requiredAudios: requiredVideos,
  		}
  	},)

  	const materialToUpload = Array.from(
  		new Set(
  			booking.BookingToProductType.flatMap((bookingToProductType,) => {
  				const adjustmentType = bookingToProductType.productType.adjustments?.type

  				if (adjustmentType === AdjustmentType.PHOTOS) {
  					return [MaterialTypeUpload.PHOTOS,]
  				}

  				if (adjustmentType === AdjustmentType.CLIPS) {
  					return [MaterialTypeUpload.VIDEOS, MaterialTypeUpload.AUDIOS,]
  				}

  				return []
  			},),
  		),
  	)

  	return new BookingMaterialListDto({
  		id:                booking.id,
  		address:           booking.address ?? '',
  		dateTime:          booking.date_time,
		  materialToUpload,
  	requiredMaterials: new BookingRequiredMaterials({
  		requiredPhotos: requiredMaterials.reduce((acc, curr,) => {
  				return acc + curr.requiredPhotos
  			}, 0,) * 5,
  		requiredVideos: requiredMaterials.reduce((acc, curr,) => {
  				return acc + curr.requiredVideos
  			}, 0,),
  		requiredAudios: requiredMaterials.reduce((acc, curr,) => {
  				return acc + curr.requiredAudios
  			}, 0,),
  	},),
  		uploadedPhotos: booking.rawMaterial.filter((rawMaterial,) => {
  			return   rawMaterial.contentType === MaterialTypeContent.PHOTOS && rawMaterial.rawType === MaterialRawType.RAW
  		},).length,
  		uploadedVideos: booking.rawMaterial.filter((rawMaterial,) => {
  			return rawMaterial.contentType === MaterialTypeContent.VIDEOS
  		},).length,
  		uploadedAudios: booking.rawMaterial.filter((rawMaterial,) => {
  			return rawMaterial.contentType === MaterialTypeContent.AUDIOS
  		},).length,
  		isEmpty:        materialToUpload.length === 0,
  		isMarkedAsDone: booking.booking_stage.includes(BookingStage.RAW_MATERIALS_UPLOADED,),
  	},)
  }
}
