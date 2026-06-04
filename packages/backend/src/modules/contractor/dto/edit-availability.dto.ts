/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { Exclude, Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsOptional, IsUUID, MinLength, ValidateNested, } from 'class-validator'

export class EditAvailabilityDto {
	constructor(data?: EditAvailabilityDto,) {
  	if (data) {
			this.date_time = data.date_time
			this.availability = data.availability
			return
		}
		this.date_time = new Date()
		this.availability = []
	}

	@IsOptional()
	@IsUUID()
	@ApiProperty({
		type: String,
	},)
	public id?: string

  @IsDate()
  @Type(() => {
  	return Date
  },)
  @ApiProperty({
  	type: Date,
  },)
	public	date_time: Date

  @IsArray()
  @Type(() => {
  	return Number
  },)
  @ApiProperty({
  	type: Array<[number, number]>,
  },)
  public availability: Array<[number, number]>

	@Exclude()
  public get from(): Array<number> {
  	return this.availability.map((item,) => {
  		return item[0]
  	},)
  }

	@Exclude()
	public get to(): Array<number> {
  	return this.availability.map((item,) => {
  		return item[1]
  	},)
	}
}

export class EditAvailabilityMobileDto extends EditAvailabilityDto {
	constructor(data?: EditAvailabilityMobileDto,) {
		super(data,)
		if (data) {
			this.isChecked = data.isChecked
			return
		}
		this.isChecked = false
	}

	@IsBoolean()
	@ApiProperty({
		type: Boolean,
	},)
	public isChecked: boolean
}

export class EditAvailabilityResDto extends EditAvailabilityDto {
	constructor(data?: EditAvailabilityResDto,) {
		super(data,)
		if (data) {
			this.id = data.id
			this.contractor_id = data.contractor_id
			return
		}
		this.id = ''
		this.contractor_id = ''
	}

	@IsUUID()
	@ApiProperty({
		type: String,
	},)
	public id: string

	@IsUUID()
	@ApiProperty({
		type: String,
	},)
	public contractor_id: string
}

export class EditAvailabilitiesDto {
	constructor(data?: EditAvailabilitiesDto,) {
  	if (data) {
			this.availabilities = data.availabilities
			return
		}
		this.availabilities = []
	}

  @IsArray()
  @ValidateNested()
  @Type(() => {
  	return EditAvailabilityDto
  },)
  @ApiProperty({
  	type: Array<EditAvailabilityDto>,
  },)
	public availabilities: Array<EditAvailabilityDto>
}

export class EditAvailabilitiesMobileDto {
	constructor(data?: EditAvailabilitiesMobileDto,) {
  	if (data) {
			this.availabilities = data.availabilities
			return
		}
		this.availabilities = []
	}

  @IsArray()
  @ValidateNested()
  @Type(() => {
  	return EditAvailabilityMobileDto
  },)
  @ApiProperty({
  	type: Array<EditAvailabilityMobileDto>,
  },)
	public availabilities: Array<EditAvailabilityMobileDto>
}

export class EditAvailabilitiesResDto {
	constructor(data?: EditAvailabilitiesResDto,) {
  	if (data) {
			this.availabilities = data.availabilities
			return
		}
		this.availabilities = []
	}

  @IsArray()
  @ValidateNested()
  @Type(() => {
  	return EditAvailabilityResDto
  },)
  @MinLength(1,)
  @ApiProperty({
  	isArray: true,
  	type:    EditAvailabilityResDto,
  },)
	public availabilities: Array<EditAvailabilityResDto>
}

export class AvailabilitiesReqDto {
	constructor(data?: AvailabilitiesReqDto,) {
		if (data) {
			this.start_date = data.start_date
			this.end_date = data.end_date
		}
	}

	@IsDate()
	@Type(() => {
		return Date
	},)
	@ApiProperty({
		type: Date,
	},)
	public start_date!: Date

	@IsDate()
	@Type(() => {
		return Date
	},)
	@ApiProperty({
		type: Date,
	},)
	public end_date!: Date
}