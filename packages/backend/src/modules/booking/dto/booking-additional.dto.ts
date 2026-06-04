/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import type { B2BClients, B2CClients, BookingGroup, RawMaterial, Worker, } from '@prisma/client'
import { Booking, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, } from 'class-validator'

export class AdditionalPhotoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
	public id!: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    public bookingId!: string
}

export class CreateAdditionalBookingDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
	public bookingGroupId!: string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    public photos!: Array<AdditionalPhotoDto>

    @ApiProperty()
    @IsString()
    public couponId?: string
}

export class GetAdditionalBookingCheckoutDto {
    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return AdditionalPhotoDto
    },)
	public photos!: Array<AdditionalPhotoDto>
}

export class AdditionalPhotosDto {
	constructor(data?: AdditionalPhotosDto,) {
		if (data) {
			this.id = data.id
			this.url = data.url
		}
	}

    @ApiProperty()
    @IsString()
	public id!: string

    @ApiProperty()
    @IsString()
    public url!: string
}

class AdditionalPhotosCountPriceDto {
	constructor(data?: AdditionalPhotosCountPriceDto,) {
		if (data) {
			this.count = data.count
			this.price = data.price
		}
	}

    @ApiProperty()
    @IsNumber()
	public count!: number

    @ApiProperty()
    @IsNumber()
    public price!: number
}

class ContactInfoDto {
	constructor(data?: ContactInfoDto,) {
		if (data) {
			this.fullName = data.fullName
			this.email = data.email
			this.phone = data.phone
			this.address = data.address
		}
	}

    @ApiProperty()
    @IsString()
	public fullName!: string

    @ApiProperty()
    @IsString()
    public email!: string

    @ApiProperty()
    @IsString()
    public phone!: string

    @ApiProperty()
    @IsString()
    public address!: string
}

export class AdditionalPhotoCheckoutDto {
	constructor(data?: AdditionalPhotoCheckoutDto,) {
		if (data) {
			this.bookingGroupId = data.bookingGroupId
			this.additionalPhotos = data.additionalPhotos
			this.totalPrice = data.totalPrice
			this.priceByPhotoCount = data.priceByPhotoCount
			this.contactInfo = data.contactInfo
		}
	}

    @ApiProperty()
    @IsString()
	public bookingGroupId!: string

    @ApiProperty()
    @IsArray()
    public additionalPhotos!: Array<AdditionalPhotosDto>

    @ApiProperty()
    @IsNumber()
    public totalPrice!: number

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true, },)
    @Type(() => {
    	return AdditionalPhotosCountPriceDto
    },)
    public priceByPhotoCount!: Array<AdditionalPhotosCountPriceDto>

    @ApiProperty()
    @ValidateNested()
    public contactInfo!: ContactInfoDto

    public static cast(bookingGroup :
        BookingGroup & {b2CClients? : B2CClients | null , b2BClients? : B2BClients | null , worker? : Worker | null},
    totalPrice : number,
    priceByPhotoCount : Record<number,number>,
    additionalPhotos : Array<RawMaterial>,
    ): AdditionalPhotoCheckoutDto {
    	const client = bookingGroup.b2BClients ?? bookingGroup.b2CClients ?? bookingGroup.worker!

    	const priceByCountArray = Object.entries(priceByPhotoCount,).map(([price, count,],) => {
    		return {
    		price: Number(price,),
    		count,
    	}
    	},)
    	return new AdditionalPhotoCheckoutDto({
    		bookingGroupId:   bookingGroup.id,
    		additionalPhotos: additionalPhotos.map((photo,) => {
    			return new AdditionalPhotosDto({
    				id:  photo.id,
    				url: photo.url,
    			},)
    		},),
    		totalPrice,
    		priceByPhotoCount: priceByCountArray,
    		contactInfo:       new ContactInfoDto({
    			fullName: `${client.firstName} ${client.lastName}`,
    			email:    client.email,
    			phone:    client.phoneNumber,
    			address:  'address' in client ?
    				client.address :
    				'',
    		},),
    	},)
    }
}