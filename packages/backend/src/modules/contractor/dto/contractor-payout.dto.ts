import { ApiProperty, } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, } from 'class-validator'

export class CreateContractorPayoutDto {
	@ApiProperty({
		description: 'Contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
    @IsString()
	@IsNotEmpty()
	public contractorId!: string

	@ApiProperty({
		description: 'Amount',
		example:     '100',
	},)
	@IsNumber()
	@IsNotEmpty()
	public amount!: number

	@ApiProperty({
		description: 'Transfer ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public transferId!: string
}

export class ContractorPayoutDto {
	constructor(data?: ContractorPayoutDto,) {
		if (data) {
			this.id = data.id
			this.contractorId = data.contractorId
			this.amount = data.amount
			this.transferId = data.transferId
			this.contractorStripeId = data.contractorStripeId
		}
	}

	@ApiProperty({
		description: 'Payout ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@ApiProperty({
		description: 'Contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public contractorId!: string

	@ApiProperty({
		description: 'Amount',
		example:     '100',
	},)
	@IsNumber()
	@IsNotEmpty()
	public amount!: number

	@ApiProperty({
		description: 'Transfer ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public transferId!: string

	@ApiProperty({
		description: 'Contractor Stripe ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	@IsString()
	@IsNotEmpty()
	public contractorStripeId!: string
}