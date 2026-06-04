/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { ContractorTransportation, PaymentType, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsString, } from 'class-validator'

export class EditContractorBasicDto {
  @IsString()
  @IsOptional()
	@ApiProperty({
		type: String,
	},)
	public	name?: string

  @IsString()
  @IsOptional()
	@ApiProperty({
		type: String,
	},)
  public surname?: string

  @IsString()
  @IsOptional()
	@ApiProperty({
		type: String,
	},)
  public password?: string

  @IsOptional()
  @IsString()
  @ApiProperty({
  	type:        String,
  	description: 'Flag to indicate if avatar should be deleted',
  	enum:        ['true', 'false',],
  	example:     'false',
  },)
  public isAvatarDelete?: string

  @IsBoolean()
  @IsOptional()
  @Type(() => {
  	return Boolean
  },)
	@ApiProperty({
		type: Boolean,
	},)
  public isProfileCreated?: boolean

  @IsString()
  @IsOptional()
	@ApiProperty({
		type: String,
	},)
  public phone?: string

  @IsEnum(ContractorTransportation,)
  @IsOptional()
	@ApiProperty()
  public transportation?: ContractorTransportation

	@Type(() => {
		return Boolean
	},)
	@IsBoolean()
	@IsOptional()
	@ApiProperty()
  public isStipeSelected?: boolean

	@IsString()
	@IsOptional()
	@ApiProperty()
	public stripeId?: string

	@IsEnum(PaymentType,)
	@IsOptional()
	@ApiProperty()
	public paymentType?: PaymentType
}
export class EditContractorStripeDto {
  @IsString()
	@ApiProperty({
		type:        String,
		description: 'Stripe token',
	},)
	public token!: string
}
