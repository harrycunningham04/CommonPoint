import { ApiProperty, } from '@nestjs/swagger'
import { Type, } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, } from 'class-validator'

export class ContractorLocationDetailsDto {
	constructor(data?: ContractorLocationDetailsDto,) {
		if (data) {
			this.placeId = data.placeId
			this.latitude = data.latitude
			this.longitude = data.longitude
			return
		}
		this.latitude = 0
		this.longitude = 0
	}

  @IsString()
	@IsOptional()
	@ApiProperty({
		type: String,
	},)
	public placeId?: string

	@IsNumber()
	@Type(() => {
		return Number
	},)
	@ApiProperty({
		type: Number,
	},)
  public latitude: number

	@IsNumber()
	@Type(() => {
		return Number
	},)
	@ApiProperty({
		type: Number,
	},)
	public longitude: number

	public static cast(data: {
		placeId: string | null,
		latitude: number,
		longitude: number,
	} | null,): ContractorLocationDetailsDto {
		if (!data) {
			return new ContractorLocationDetailsDto()
		}
		return new ContractorLocationDetailsDto({
			placeId:   data.placeId ?? '',
			latitude:  data.latitude,
			longitude: data.longitude,
		},)
	}
}

export class EditContractorLocationDto {
	constructor(data?: EditContractorLocationDto,) {
		if (data) {
			this.address = data.address
			this.radius = data.radius
			this.regionNames = data.regionNames
			this.locationDetails = data.locationDetails
			return
		}
		this.address = ''
		this.radius = 0
		this.locationDetails = new ContractorLocationDetailsDto()
	}

  @IsString()
  @IsNotEmpty()
	@ApiProperty({
		type: String,
	},)
	public address: string

	@ValidateNested()
	@Type(() => {
		return ContractorLocationDetailsDto
	},)
  public locationDetails: ContractorLocationDetailsDto

  @IsNumber()
  @Type(() => {
  	return Number
  },)
  @Min(1,)
	@ApiProperty({
		type: Number,
	},)
	public radius: number

  @IsArray()
  @IsString({ each: true, },)
  @IsOptional()
  public regionNames?: Array<string>
}