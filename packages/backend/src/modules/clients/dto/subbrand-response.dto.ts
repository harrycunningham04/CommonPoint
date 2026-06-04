import { ApiProperty, } from '@nestjs/swagger'
import type { Subbrand, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

export class SubbrandResponseDto {
	constructor(data?: SubbrandResponseDto,) {
		if (data) {
			this.id = data.id
			this.companyName = data.companyName
			this.email = data.email
			this.phoneNumber = data.phoneNumber
			this.address = data.address
			this.billingAddress = data.billingAddress
			this.parentBrandId = data.parentBrandId
			this.createdAt = data.createdAt
			this.updatedAt = data.updatedAt
			this.archived = data.archived
		}
	}

	@ApiProperty({
		description: 'The id of the subbrand',
		example:     '123',
	},)
	public id!: string

	@ApiProperty({
		description: 'The company name of the subbrand',
		example:     'Acme Corp Subbrand',
	},)
	public companyName!: string

	@ApiProperty({
		description: 'The email of the subbrand',
		example:     'contact@acme-subbrand.com',
	},)
	public email!: string | null

	@ApiProperty({
		description: 'The phone number of the subbrand',
		example:     '+1234567890',
	},)
	public phoneNumber!: string | null

	@ApiProperty({
		description: 'The address of the subbrand',
		example:     '123 Subbrand St, Anytown, USA',
	},)
	public address!: string | null

	@ApiProperty({
		description: 'The billing address of the subbrand',
		example:     '123 Billing St, Anytown, USA',
	},)
	public billingAddress!: string | null

	@ApiProperty({
		description: 'The parent brand ID',
		example:     '123',
	},)
	public parentBrandId!: string

	@ApiProperty({
		description: 'The creation date of the subbrand',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'The last update date of the subbrand',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	@ApiProperty({
		description: 'The archived status of the subbrand',
		example:     false,
	},)
	public archived!: boolean

	public static cast(subbrand: Subbrand,): SubbrandResponseDto {
		return new SubbrandResponseDto({
			id:             subbrand.id,
			companyName:    subbrand.companyName,
			email:          subbrand.email,
			phoneNumber:    subbrand.phoneNumber,
			address:        subbrand.address,
			billingAddress: subbrand.billingAddress,
			parentBrandId:  subbrand.parentBrandId,
			createdAt:      subbrand.created_at,
			updatedAt:      subbrand.updated_at,
			archived:       subbrand.archived,
		},)
	}
}

export class PagedSubbrandsResponseDto implements PagedResDto<SubbrandResponseDto> {
	@ApiProperty({
		description: 'Array of subbrands',
		type:        [SubbrandResponseDto,],
	},)
	public data!: Array<SubbrandResponseDto>

	@ApiProperty({
		description: 'Whether there are more pages',
		example:     true,
	},)
	public hasNext!: boolean
}