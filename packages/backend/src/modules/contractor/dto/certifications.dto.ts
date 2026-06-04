import { ApiProperty, } from '@nestjs/swagger'
import { SpecificDocumentType, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, ValidateNested, } from 'class-validator'

export class CertificationDto {
	constructor(data?: CertificationDto,) {
		if (data) {
			this.url = data.url
			this.name = data.name
			this.expiredAt = data.expiredAt
			this.type = data.type
			return
		}
		this.expiredAt = new Date()
		this.name = ''
		this.url = ''
		this.type = undefined
	}

	@IsUUID()
	@IsOptional()
	public id?: string

  @IsUrl()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
	public url: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsDate()
  @Type(() => {
  	return Date
  },)
  @ApiProperty({
  	type: Date,
  },)
  public expiredAt: Date

	@IsOptional()
	@IsEnum(SpecificDocumentType,)
  public type?: SpecificDocumentType
}

export class CertificationsReqDto {
	constructor(data?: CertificationsReqDto,) {
		if (data) {
			this.certifications = data.certifications
			this.insurances = data.insurances
		}
	}

  @IsArray()
	@IsOptional()
  @ValidateNested({ each: true, },)
  @Type(() => {
  	return CertificationDto
  },)
	public certifications?: Array<CertificationDto>

  @IsArray()
	@IsOptional()
  @ValidateNested({ each: true, },)
  @Type(() => {
  	return CertificationDto
  },)
  public insurances?: Array<CertificationDto>
}