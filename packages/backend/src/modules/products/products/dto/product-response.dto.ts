import { ApiProperty, } from '@nestjs/swagger'
import type { AdditionalProductType, Product, ProductType, ProductTypeExample, ProductTypeSkills,  Skills,} from '@prisma/client'
import { ContractorSkillNama, EquipmentType, EarningRate, Adjustments, CancellationFee, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

export class ProductExampleDto {
	@ApiProperty({
		description: 'The id of the example',
		example:     '123',
	},)
	public id!: string

	@ApiProperty({
		description: 'The name of the example',
		example:     'Example Photo',
	},)
	public name!: string

	@ApiProperty({
		description: 'The URL of the example',
		example:     'https://example.com/photo.jpg',
	},)
	public url!: string
}

export class ProductVariantDto {
	@ApiProperty({
		description: 'The id of the product variant',
		example:     '123',
	},)
	public id!: string

	@ApiProperty({
		description: 'The name of the product variant',
		example:     'Professional Photo Package',
	},)
	public name!: string

	@ApiProperty({
		description: 'The description for clients',
		example:     'Professional photography service',
	},)
	public descriptionClient!: string

	@ApiProperty({
		description: 'The description for contractors',
		example:     'Professional photography service for contractors',
	},)
	public descriptionContractor!: string

	@ApiProperty({
		description: 'The price of the product variant',
		example:     150.00,
	},)
	public price!: number

	@ApiProperty({
		description: 'The duration of the service in minutes',
		example:     120,
	},)
	public duration!: number

	@ApiProperty({
		description: 'Whether the service requires on-site contractor',
		example:     true,
	},)
	public requiresOnSiteContractor!: boolean

	@ApiProperty({
		description: 'The mark/rating of the product variant',
		example:     'PROFESSIONAL',
	},)
	public mark!: string

	@ApiProperty({
		description: 'The equipment required',
		enum:        EquipmentType,
		isArray:     true,
		example:     [EquipmentType.CAMERA, EquipmentType.TRIPOD,],
	},)
	public equipment!: Array<EquipmentType>

	@ApiProperty({
		description: 'The skills required for this variant (skill names)',
		type:        [String,],
		example:     ['PHOTO', 'VIDEO',],
	},)
	public skills!: Array<string>

	@ApiProperty({
		description: 'The examples for this variant',
		type:        [ProductExampleDto,],
	},)
	public examples!: Array<ProductExampleDto>

	@ApiProperty({
		description: 'The contractor assigned to this variant',
		required:    false,
	},)
	public contractor?: {
		id:      string
		name:    string
		surname: string
	} | null

	@ApiProperty({
		description: 'The earning rate for this variant',
		required:    false,
	},)
	public earningRate?: EarningRate

	@ApiProperty({
		description: 'The adjustments for this variant',
		required:    false,
	},)
	public adjustments?: Adjustments

	@ApiProperty({
		description: 'The additional product information',
		required:    false,
	},)
	public additionalProduct?: any

	@ApiProperty({
		description: 'The cancellation fee for this variant',
		required:    false,
	},)
	public cancellationFee?: CancellationFee

	@ApiProperty({
		description: 'The creation date of the product variant',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'The last update date of the product variant',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	@ApiProperty({
		description: 'The additional earning for this variant',
		example:     10.00,
	},)
	public additionalEarning!: number
}

export class ProductResponseDto {
	constructor(data?: ProductResponseDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.price = data.price
			this.requiresOnSiteContractor = data.requiresOnSiteContractor
			this.archived = data.archived
			this.archivedAt = data.archivedAt
			this.createdAt = data.createdAt
			this.updatedAt = data.updatedAt
			this.skills = data.skills
			this.productVariants = data.productVariants
		}
	}

	@ApiProperty({
		description: 'The id of the product',
		example:     '123',
	},)
	public id!: string

	@ApiProperty({
		description: 'The name of the product',
		example:     'Professional Photography',
	},)
	public name!: string

	@ApiProperty({
		description: 'The base price of the product',
		example:     100.00,
	},)
	public price!: number

	@ApiProperty({
		description: 'Whether the product requires on-site contractor',
		example:     true,
	},)
	public requiresOnSiteContractor!: boolean

	@ApiProperty({
		description: 'Whether the product is archived',
		example:     false,
	},)
	public archived!: boolean

	@ApiProperty({
		description: 'The date when the product was archived',
		example:     '2024-01-01T00:00:00.000Z',
		required:    false,
	},)
	public archivedAt!: Date | null

	@ApiProperty({
		description: 'The creation date of the product',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public createdAt!: Date

	@ApiProperty({
		description: 'The last update date of the product',
		example:     '2024-01-01T00:00:00.000Z',
	},)
	public updatedAt!: Date

	@ApiProperty({
		description: 'The skills associated with the product (skill objects)',
		// type:        [Skills,],
	},)
	public skills!: Array<Skills>

	@ApiProperty({
		description: 'The product variants',
		type:        [ProductVariantDto,],
	},)
	public productVariants!: Array<ProductVariantDto>

	public static cast(product: Product & {
		productSkills: Array<{
			skill: Skills
		}>
		productTypes: Array<ProductType & {
			productTypeSkills: Array<{
				skill: Skills
			}>
			contractor?: {
				id:      string
				name:    string
				surname: string
			} | null
			earningRate?: EarningRate
			adjustments?: Adjustments
			additionalProduct?: AdditionalProductType & {earningRate?: EarningRate | null}
			cancellationFee?: CancellationFee
			ProductTypeExample: Array<ProductTypeExample>
		}>
	},): ProductResponseDto {
		return new ProductResponseDto({
			id:                       product.id,
			name:                     product.name,
			price:                    product.price,
			requiresOnSiteContractor: product.requiresOnSiteContractor,
			archived:                 product.archived,
			archivedAt:               product.archivedAt,
			createdAt:                product.created_at,
			updatedAt:                product.updated_at,
			skills:                   product.productSkills.map((ps,) => {
				return ps.skill
			},),
			productVariants:          product.productTypes.map((productVariant,) => {
				return {
					...productVariant,
					skills:                   productVariant.productTypeSkills.map((skill,) => {
						return skill.skill.name
					},),
					descriptionClient:        productVariant.description_client ?? '',
					descriptionContractor:    productVariant.description_contractor ?? '',
					requiresOnSiteContractor: productVariant.requires_on_site_contractor,
					examples:                 productVariant.ProductTypeExample.map((example,) => {
						return {
							id:   example.id,
							name: example.name,
							url:  example.url,
						}
					},),
					createdAt:                productVariant.created_at,
					updatedAt:                productVariant.updated_at,
					additionalEarning:        productVariant.additionalProduct?.earningRate?.additionalPrice ?? 0,
				}
			},),
		},)
	}
}

export class PagedProductsResponseDto implements PagedResDto<ProductResponseDto> {
	@ApiProperty({
		description: 'Array of products',
		type:        [ProductResponseDto,],
	},)
	public data!: Array<ProductResponseDto>

	@ApiProperty({
		description: 'Whether there are more pages',
		example:     true,
	},)
	public hasNext!: boolean
}