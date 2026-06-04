import { ApiProperty, } from '@nestjs/swagger'
import { ContractorTransportation, } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsBoolean, } from 'class-validator'

export class ContractorBasicInfoDto {
	constructor(data?: ContractorBasicInfoDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.surname = data.surname
			this.phone = data.phone
			this.transportation = data.transportation
			this.avatar = data.avatar
			this.isStipeSelected = data.isStipeSelected
			this.stripeId = data.stripeId
			return
		}
		this.id = ''
		this.name = ''
		this.surname = ''
		this.phone = ''
		this.avatar = null
		this.transportation = ContractorTransportation.PUBLIC_TRANSPORTATION
		this.isStipeSelected = null
		this.stripeId = null
	}

  @IsUUID()
  @IsNotEmpty()
	@ApiProperty()
	public id: string

	@IsString()
	@IsOptional()
	@ApiProperty()
  public avatar: string | null

  @IsString()
  @IsNotEmpty()
	@ApiProperty()
	public name: string

  @IsString()
  @IsNotEmpty()
	@ApiProperty()
  public surname: string

  @IsString()
  @IsOptional()
	@ApiProperty()
  public phone: string | null

  @IsEnum(ContractorTransportation,)
  @IsNotEmpty()
	@ApiProperty()
  public transportation: ContractorTransportation

	@IsBoolean()
	@IsOptional()
	@ApiProperty()
  public isStipeSelected: boolean | null

	@IsString()
	@IsOptional()
	@ApiProperty()
	public stripeId: string | null
}