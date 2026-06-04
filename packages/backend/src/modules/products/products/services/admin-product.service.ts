/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'
import type { GetAdminProductsQueryDto,} from '../dto/products.dto'
import { ProductForOfficeDto, ProductTypeForOfficeDto, } from '../dto/products.dto'
import { ProductResponseDto, } from '../dto/product-response.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

@Injectable()
export class AdminProductService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getProducts(query: GetAdminProductsQueryDto,): Promise<PagedResDto<ProductResponseDto>> {
		const { search, sortBy, sortOrder, take, skip, showArchive = false, skills, requiresOnSiteContractor, } = query

		const where: Prisma.ProductWhereInput = {
			archived: false,
		}

		if (showArchive) {
			where.archived = undefined
		}

		if (search) {
			where.name = { contains: search, mode: 'insensitive', }
		}

		// if (requiresOnSiteContractor !== undefined) {
		// 	where.requiresOnSiteContractor = requiresOnSiteContractor
		// }

		if (skills && skills.length > 0) {
			where.productTypes = {
				some: {
					productTypeSkills: {
						some: {
							skill: {
								name: {
									in: skills,
								},
							},
						},
					},
				},
			}
		}

		const orderBy: Prisma.ProductOrderByWithRelationInput = {}
		if (sortBy) {
			let sortField: keyof Prisma.ProductOrderByWithRelationInput
			if (sortBy === 'createdAt') {
				sortField = 'created_at'
			} else if (sortBy === 'updatedAt') {
				sortField = 'updated_at'
			} else {
				sortField = sortBy
			}
			orderBy[sortField] = sortOrder ?? 'asc'
		} else {
			orderBy.created_at = 'desc'
		}

		const [products, totalCount,] = await Promise.all([
			this.prisma.product.findMany({
				where,
				orderBy,
				take,
				skip,
				include: {
					productSkills: {
						include: {
							skill: true,
						},
					},
					productTypes: {
						where: {
							requires_on_site_contractor: requiresOnSiteContractor,
						},
						include: {
							productTypeSkills: {
								include: {
									skill: true,
								},
							},
							contractor: {
								select: {
									id:       true,
									name:     true,
									surname:  true,
								},
							},
							earningRate:       true,
							adjustments:       true,
							additionalProduct: {
								include: {
									adjustments: true,
									earningRate: true,
									contractor:  true,
								},
							},
							cancellationFee:    true,
							ProductTypeExample: true,
						},
					},
				},
			},),
			this.prisma.product.count({ where,},),
		],)

		const productDtos = products.filter((item,) => {
			return item.productTypes.length > 0
		},).map((product,) => {
			return ProductResponseDto.cast({
				...product,
				productTypes: product.productTypes.map((productType,) => {
					return {
						...productType,
						earningRate:        productType.earningRate ?? undefined,
						adjustments:        productType.adjustments ?? undefined,
						additionalProduct:  productType.additionalProduct ?? undefined,
						cancellationFee:    productType.cancellationFee ?? undefined,
						ProductTypeExample: productType.ProductTypeExample,
					}
				},),
			},)
		},)

		return {
			data:    productDtos,
			hasNext: totalCount > skip + take,
		}
	}

	public async getProductsByOffice(officeId: string,): Promise<Array<ProductForOfficeDto>> {
		const products = await this.prisma.product.findMany({
			where: {
				archived:             false,
				officeHiddenProducts: {
					none: {
						officeId,
					},
				},
			},
			include: {
				productTypes: {
					include: {
						specialPrices: true,
					},
				},
			},
		},)

		return products.map((product,) => {
			return new ProductForOfficeDto({
				id:           product.id,
				title:        product.name,
				productTypes: product.productTypes.map((productType,) => {
					const price = productType.specialPrices.find((specialPrice,) => {
						return specialPrice.officeId === officeId
					},)?.price ?? productType.price

					return new ProductTypeForOfficeDto({
						id:                       productType.id,
						title:                    productType.name,
						price ,
						requiresOnSiteContractor: productType.requires_on_site_contractor,
					},)
				},),
			},)
		},)
	}
}