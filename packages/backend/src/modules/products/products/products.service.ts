/* eslint-disable */

import { Injectable, Logger, BadRequestException, NotFoundException,  } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { CreateProductDto, } from './dto/create-product.dto'
import { ChangeProductDto, } from './dto/change-product.dto'
import { type Product, type ProductType, type Skills, type Prisma, ContractorSkillNama, ComparisonOperator, AdjustmentType, } from '@prisma/client'
import type { Response, } from 'express'
import { unparse, } from 'papaparse'
import { StripeService, } from 'src/modules/stripe/stripe.service'
import { v4 as uuidv4, validate as uuidValidate, } from 'uuid'
import { EarningsService } from '../../earnings/earnings.service'
import { GetProductVariantsQuery, ProductVariantAdditionalProductDto, ProductVariantAdjustmentDto, ProductVariantDefaultEarningDto, ProductVariantDto, ProductVariantExampleDto } from './dto/product-variant.dto'
import { PagedResDto } from 'src/shared/dto/paged-res.dto'
import { GetContractorBookingDto } from 'src/modules/booking/dto/get-contractor-booking.dto'
import { BasicProductTypeDto, BookingProductDto, BookingProductVariantDto, ProductTypeResponseDto, ProductWithTypesDto } from './dto/get-product-variant-booking.dto'
import { DefaultContractorsService } from '../../contractor/services/default-contractors.service'
import { UploadService } from 'src/modules/upload/upload.service'
import { AdditionalPhotoDto } from 'src/modules/booking/dto/booking-additional.dto'
import { GetAdminProductsQueryDto } from './dto/products.dto'
@Injectable()
export class ProductService {
	private readonly logger = new Logger(ProductService.name,)

	constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
		private readonly earningsService: EarningsService,
		private readonly defaultContractorsService: DefaultContractorsService,
		private readonly uploadService: UploadService,
	) { }

	async getProducts(query: any,): Promise<any> {
		const { search = '', skills = [], requiresOnSiteContractor, sortBy = 'name', sortDirection = 'asc', showArchive = false, } = query
	 
		const whereClause: any = {
			name: {
				contains: search,
				mode:     'insensitive',
			},
		}
		if (!showArchive) {
			whereClause.archived = false
		}

		if (requiresOnSiteContractor !== undefined) {
			whereClause.requiresOnSiteContractor = requiresOnSiteContractor === 'true'
		}

		if (skills.length > 0) {
			whereClause.productTypes = {
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

		const orderByClause: Record<string, 'asc' | 'desc'> = {}
		if (sortBy) {
			orderByClause[sortBy] = sortDirection
		}

		const products = await this.prisma.product.findMany({
			where:   whereClause,
			orderBy: orderByClause,
			include: this.getProductIncludeClause(),
		},)

		return {
			data: products.map((product,) => {
				return {
					...product,
					skills:          product.productSkills.map((ps,) => {
						return ps.skill
					},),
					productVariants: product.productTypes.map((productVariant,) => {
						return {
							...productVariant,
							skills:                   productVariant.productTypeSkills.map((skill,) => {
								return skill.skill.name
							},),
							descriptionClient:        productVariant.description_client,
							descriptionContractor:    productVariant.description_contractor,
							requiresOnSiteContractor: productVariant.requires_on_site_contractor,
							examples: productVariant.ProductTypeExample.map((example,) => {
								return {
									id: example.id,
									name: example.name,
									url: example.url,
								}
							},),
						}
					},),
				}
			},),
		}
	}

	public async getProductVariants(query: GetProductVariantsQuery,): Promise<PagedResDto<ProductType>> {
		const { search = '', sortBy = 'name', sortDirection = 'asc', skill,take,skip} = query
 
		const whereClause: Prisma.ProductTypeWhereInput = {
			name: {
				contains: search,
				mode:     'insensitive',
			},
		}

		const orderByClause: Record<string, 'asc' | 'desc'> = {}
		if (sortBy) {
			orderByClause[sortBy] = sortDirection
		}

		whereClause.product = { archived: false, }

		if (skill) {
			whereClause.productTypeSkills = {
				some: {
					skill: {
						name: skill,
					},
				},
			}
		}

		const allProductVariants = await this.prisma.productType.findMany({
			where:   whereClause,
			orderBy: orderByClause,
			take:take+1,
			skip,
			include: {
				productTypeSkills: {
					include: {
						skill: true,
					},
				},
				contractor: true,
			},
		},)

		return {
			data: allProductVariants.slice(0,take).map((productVariant,) => {
				return {
					...productVariant,
					skills:          productVariant.productTypeSkills.map((ps,) => {
						return ps.skill.name
					},),
					descriptionClient:        productVariant.description_client,
					descriptionContractor:    productVariant.description_contractor,
					requiresOnSiteContractor: productVariant.requires_on_site_contractor,
				}
			}),
			hasNext:  allProductVariants.length>take
		}
	}

	public async getFrequentlyOrdered(query:BookingProductDto): Promise<Array<ProductType>> {
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30,)

		const adjustmentConditions: Prisma.ProductTypeWhereInput = this.getAdjustmentConditions(query);

		const topProducts = await this.prisma.bookingToProductType.groupBy({
		  by:    ['productTypeId',],
			where: {
				productType: adjustmentConditions,
				...(query.officeId && {
					productType: {
						product: {
							officeHiddenProducts: {
								none: {
									officeId: query.officeId,
								},
							},
						},
					},
				}),
			},
		  _count: {
				productTypeId: true,
		  },
		  orderBy: {
				_count: {
			  	productTypeId: 'desc',
				},
		  },
		  take: query.take,
		},)

		const productVariants = await this.prisma.productType.findMany({
			where: {
				id: {
					in: topProducts.map((product,) => {
						return product.productTypeId
					},),
				},
				product: {
					archived: false,
				},
				...(query.officeId && {
					product: {
						officeHiddenProducts: {
							none: {
								officeId: query.officeId,
							},
						},
					},
				}),
			},
			include: {
				productTypeSkills: {
					include: {
						skill: true,
					},
				},
				contractor: true,
			},
		})
		return productVariants.filter(Boolean,).map((productVariant,) => {
			return {
				...productVariant,
				skills:          productVariant!.productTypeSkills.map((ps,) => {
					return ps.skill.name
				},),
				descriptionClient:        productVariant!.description_client,
				descriptionContractor:    productVariant!.description_contractor,
				requiresOnSiteContractor: productVariant!.requires_on_site_contractor,
			}
		},) as Array<ProductType>
	  }

	public async addProduct(data: CreateProductDto,): Promise<any> {
		try {
			const newProduct: Product = await this.prisma.product.create({
				data: {
					name:                     data.name,
				},
			},)

			for (const productVariant of data.productVariants) {
				await this.createProductVariant(newProduct.id, productVariant)
			}

			const createdProduct = await this.prisma.product.findUnique({
				where:   { id: newProduct.id, },
				include: this.getProductIncludeClause(),
			},)

			return {
				...createdProduct,
				skills:          createdProduct?.productSkills.map((ps,) => {
					return ps.skill
				},),
				productVariants: createdProduct?.productTypes.map((productVariant,) => {
					return {
						...productVariant,
						skills:                   productVariant.productTypeSkills.map((skill,) => {
							return skill.skill.name
						},),
						descriptionClient:        productVariant.description_client,
						descriptionContractor:    productVariant.description_contractor,
						requiresOnSiteContractor: productVariant.requires_on_site_contractor,
					}
				},),
			}
		} catch (error) {
			this.logger.error({ method: this.addProduct.name, error, },)
			throw error
		}
	}

	public async updateProduct(data: ChangeProductDto,): Promise<Product> {
		try {
			const changedProduct: Product = await this.prisma.product.update({
				where: {
					id: data.id,
				},
				data: {
					name: data.name,
				},
			},)

			await this.prisma.productSkills.deleteMany({
				where: {
					productId: data.id,
				},
			},)

			const productVariantIds: Array<string> = data.productVariants
				.filter((productVariant,) => {
					return productVariant.id
				},)
				.map((productVariant,) => {
					return productVariant.id!
				},)
			await this.prisma.productType.deleteMany({
				where: {
					productId: data.id,
					id:        {
						notIn: productVariantIds,
					},
				},
			},)

			for (const productVariant of data.productVariants) {
				const existingProductVariant: ProductType | null = productVariant.id ?
					await this.prisma.productType.findFirst({ where: { id: productVariant.id, }, },) :
					null
				if (existingProductVariant) {
					await this.updateProductVariant(existingProductVariant.id, productVariant)
				} else {
					await this.createProductVariant(data.id, productVariant)
				}
			}

			return changedProduct
		} catch (error) {
			this.logger.error({ method: this.updateProduct.name, error, },)
			throw error
		}
	}

	public async updateProductVariant(id: string, data: ProductVariantDto) {
		console.log(data, 'data')
		const productVariant = await this.prisma.productType.findUnique({
			where: { id, },
		})
		if (!productVariant) {
			throw new NotFoundException('Product variant not found',)
		}

		if (productVariant.price !== data.price) {
			await this.stripeService.updateProductPrice(
				productVariant.stripeId,
				data.price,
			)
		}
		await this.prisma.productType.update({
			where: {
				id,
			},
			data: {
				name:                        data.name,
				description_contractor:      data.descriptionContractor,
				description_client:          data.descriptionClient,
				price:                       parseFloat(`${data.price}`,),
				duration:                    data.duration,
				requires_on_site_contractor: data.requiresOnSiteContractor,
				mark:                        data.mark,
				...(data.contractor && {
					contractor: {
						connect: {
							id: data.contractor.id,
						},
					},
				}),
				...(data.cancellationFee && { 
					cancellationFee: { upsert: 
						{ 
							create: data.cancellationFee, 
							update: data.cancellationFee 
						}
					 } 
				}),
				equipment:                   data.equipment,
			},
		},)

		if (data.earningRate) {
			await this.updateDefaultEarningRates(id, data.earningRate)
		}

		if (data.adjustments) {
			await this.updateAdjustments(id, data.adjustments)
		}

		if (data.additionalProduct) {
			await this.updateAdditionalProduct(
				id, 
				data.additionalProduct, 
				data.skills[0],
			)
		}

		if (data.examples && data.examples.length > 0) {
			await this.updateExamples(id, data.examples)
		}

		await this.prisma.productTypeSkills.deleteMany({
			where: {
				productTypeId: id,
			},
		},)

		for (const skillId of data.skills) {
			let skill: Skills | null = await this.prisma.skills.findFirst({ where: { name: skillId, }, },)
			if (!skill) {
				skill = await this.prisma.skills.create({ data: { name: skillId, icon: '', }, },)
			}
			await this.prisma.productTypeSkills.create({ data: { productTypeId: id, skillId: skill.id, }, },)
		}
	}

	public async createProductVariant(productId: string, data: ProductVariantDto) {
		const stripeProduct = await this.stripeService.createProduct(
			data.name,
			data.price,
			data.additionalProduct?.earningRate?.additionalPrice
		)
		const newProductVariant: ProductType = await this.prisma.productType.create({
			data: {
				name:                        data.name,
				description_contractor:      data.descriptionContractor,
				description_client:          data.descriptionClient,
				price:                       parseFloat(`${data.price}`,),
				duration:                    data.duration,
				requires_on_site_contractor: data.requiresOnSiteContractor,
				productId:                   productId,
				stripeId:                    stripeProduct.id,
				mark:                        data.mark,
				...(data.cancellationFee && { cancellationFee: { create: data.cancellationFee } }),
				equipment:                   data.equipment,
				...(data.contractor && {
					contractorId:                data.contractor.id,
				}),
			},
		},)
		
		if (data.earningRate) {
			await this.updateDefaultEarningRates(newProductVariant.id, data.earningRate)
		}

		if (data.adjustments) {
			await this.updateAdjustments(newProductVariant.id, data.adjustments)
		}

		if (data.additionalProduct) {
			await this.updateAdditionalProduct(
				newProductVariant.id, 
				data.additionalProduct,
				data.skills[0],
			)
		}

		if (data.examples) {
			await this.updateExamples(newProductVariant.id, data.examples)
		}

		await this.prisma.productTypeSkills.deleteMany({
			where: {
				productTypeId: newProductVariant.id,
			},
		},)

		for (const skillId of data.skills) {
			let skill: Skills | null = await this.prisma.skills.findFirst({ where: { name: skillId, }, },)
			if (!skill) {
				skill = await this.prisma.skills.create({ data: { name: skillId, icon: '', }, },)
			}
			await this.prisma.productTypeSkills.create({ data: { productTypeId: newProductVariant.id, skillId: skill.id, }, },)
		}

		return newProductVariant
	}

	public async deleteProductVariant(id: string) {
		await this.prisma.productType.delete({ where: { id, }, })
	}


	public async getBookingProducts(data: BookingProductDto): Promise<PagedResDto<ProductWithTypesDto>> {
		const { skip, take, search, officeId } = data
		const productTypesTake = data.productTypesTake ?? 5

		const adjustmentConditions: Prisma.ProductTypeWhereInput = this.getAdjustmentConditions(data)

		const productTypeWhere: Prisma.ProductTypeWhereInput = {
			...adjustmentConditions,
			name: {
			contains: search,
			mode: 'insensitive',
			},
		}

		const products = await this.prisma.product.findMany({
			where: {
				archived: false,
				...(officeId && {
					officeHiddenProducts: {
						none: {
							officeId,
						},
					},
				}),
				productTypes: {
					some: productTypeWhere,
				},
				},
				skip,
				take,
				include: {
				productTypes: {
					where: productTypeWhere,
					take: productTypesTake + 1,
					include: {
						specialPrices : true,
					productTypeSkills: {
						include: {
							skill: true,
						},
					},
					contractor: true,
					},
				},
			},
		})

		const finalData: ProductWithTypesDto[] = products.map((product) => {
			const allTypes = ProductTypeResponseDto.cast(product.productTypes).productTypes
			const hasMoreTypes = allTypes.length > productTypesTake

			return {
				id: product.id,
				name: product.name,
				price: product.price,
				requiresOnSiteContractor: product.requiresOnSiteContractor,
				productTypes: {
					data: allTypes.slice(0, productTypesTake),
					hasNext: hasMoreTypes,
				},
			}
		})


		const totalCount = await this.prisma.product.count({
			where: {
				archived: false,
				productTypes: {
					some: productTypeWhere,
				},
			},
		})

		return {
			data: finalData,
			hasNext: totalCount > skip + take,
		}
	}


	public getAdjustmentConditions(data:{
		sqft:number,
		bedrooms:number,
	}):Prisma.ProductTypeWhereInput{
		return {
			OR: [
			{
				adjustments: {
					type: AdjustmentType.CLIPS
				},
			},
			{
				adjustments: {
					type: AdjustmentType.PHOTOS
				},
			},
			{
				adjustments: {
					type: AdjustmentType.SQFT,
					comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL,
					value: {
						gte: data.sqft
					}
				},
			},
			{
				adjustments: {
					type: AdjustmentType.SQFT,
					comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL,
					value: {
						lte: data.sqft
					}
				},
			},
			{
				adjustments: {
					type: AdjustmentType.BEDROOMS,
					comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL,
					value: {
						gte: data.bedrooms
					}
				},
			},
			{
				adjustments: {
					type: AdjustmentType.BEDROOMS,
					comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL,
					value: {
						lte: data.bedrooms
					}
				},
			},
			{
				adjustments: null
			},
			],
		}
	}

	public async getProductTypes(data:BookingProductVariantDto):Promise<PagedResDto<BasicProductTypeDto>>{
		const adjustmentConditions: Prisma.ProductTypeWhereInput = this.getAdjustmentConditions(data);

		const where: Prisma.ProductTypeWhereInput = {
			productId: data.productId,
			name: {
				contains: data.search,
				mode: 'insensitive',
			},
			...adjustmentConditions,
		}


		const productTypes = await this.prisma.productType.findMany({
			where,
			skip: data.skip,
			take: data.take,
			include: {
			  productTypeSkills: {
				include: { skill: true }
			  },
			  ...(data.officeId ? {
				specialPrices: {
				  where: { officeId: data.officeId }
				}
			  } : {}),
			  contractor: true,
			}
		  })

		const totalCount = await this.prisma.productType.count({
			where
		})

		return {
			data : ProductTypeResponseDto.cast(productTypes).productTypes,
			hasNext : totalCount > data.skip + data.take
		}
	}

	public async archiveProduct(productId: string,): Promise<Product> {
		try {
			const changedProduct: Product = await this.prisma.product.update({
				where: {
					id: productId,
				},
				data: {
					archived:   true,
					archivedAt: new Date(),
				},
			},)

			return changedProduct
		} catch (error) {
			this.logger.error({ method: this.archiveProduct.name, error, },)
			throw error
		}
	}

	public async exportProducts(query: GetAdminProductsQueryDto, res: Response,): Promise<void> {
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

		const products = await this.prisma.product.findMany({
			where:   where,
			orderBy: orderBy,
			include: this.getProductIncludeClause(),
		},)

		const csvRows: any[] = [];

		csvRows.push('Category,Skills,Product variants');

		for (const product of products.filter((item,) => {
			return item.productTypes.length > 0
		},)) {
			const skillSet = new Set<string>();
			product.productTypes?.forEach(ps => {
				ps.productTypeSkills?.forEach(ps => {
					skillSet.add(ps.skill.name);
				});
			});
			const productSkills = Array.from(skillSet).join(', ');
		
			csvRows.push([
				product.name,
				productSkills,
				product.productTypes.length,
			]);
		
			csvRows.push(['-------------------']);
			csvRows.push(['Product variant']);
		
			if (product.productTypes.length > 0) {
				csvRows.push(['Name', 'Skill', 'Presence', 'Mark', 'Price', 'Earning', 'Adjustments']);
			}
		
			for (const variant of product.productTypes) {
				const variantSkills = variant.productTypeSkills?.map(vs => vs.skill.name).join(', ') ?? '';
		
				csvRows.push([
					variant.name,
					variantSkills,
					variant.requires_on_site_contractor ? 'On site' : 'Off site',
					variant.mark,
					variant.price ? `£${variant.price}` : '',
					variant.earningRate ? `${variant.earningRate.earningRate}%` : '',
					`${variant.adjustments?.value ?? 0} ${variant.adjustments?.type}`,
				]);
			}
		
			csvRows.push(['-------------------']);
			csvRows.push([]);
		}

		res.setHeader('Content-Type', 'text/csv',)
		res.setHeader('Content-Disposition', 'attachment; filename="products.csv"',)
		res.send(csvRows.join('\n'),)
	}

	public async getAllProductTypes() {
		return this.prisma.productType.findMany({
			include: {
				specialPrices: true,
			},
		},)
	}

	public async setSpecialPrice(
		targetId: string,
		targetType: 'B2B' | 'B2C' | 'Subbrand' | 'Office',
		productTypeId: string,
		price: number,
	) {
		if (!uuidValidate(targetId,) || !uuidValidate(productTypeId,)) {
			throw new BadRequestException('Invalid targetId or productTypeId. They must be valid UUIDs.',)
		}

		let whereClause: any
		let createData: any

		if (targetType === 'B2B') {
			whereClause = { productTypeId_clientB2BId: { productTypeId, clientB2BId: targetId, }, }
			createData = { clientB2BId: targetId, productTypeId, price, }
		} else if (targetType === 'B2C') {
			whereClause = { productTypeId_clientB2CId: { productTypeId, clientB2CId: targetId, }, }
			createData = { clientB2CId: targetId, productTypeId, price, }
		} else if (targetType === 'Subbrand') {
			whereClause = { productTypeId_subbrandId: { productTypeId, subbrandId: targetId, }, }
			createData = { subbrandId: targetId, productTypeId, price, }
		} else if (targetType === 'Office') {  // handle Office
			whereClause = { productTypeId_officeId: { productTypeId, officeId: targetId, }, }
			createData = { officeId: targetId, productTypeId, price, }
		} else {
			throw new BadRequestException('Invalid targetType. It must be one of: B2B, B2C, Subbrand, Office.',)
		}

		return this.prisma.productTypeSpecialPrice.upsert({
			where:  whereClause,
			create: createData,
			update: { price, },
		},)
	}

	public async getSpecialPrices(targetId: string, targetType: 'B2B' | 'B2C' | 'Subbrand' | 'Office',) {
		if (!uuidValidate(targetId,)) {
			throw new BadRequestException('Invalid targetId. It must be a valid UUID.',)
		}

		let whereClause: any

		if (targetType === 'B2B') {
			whereClause = { clientB2BId: targetId, }
		} else if (targetType === 'B2C') {
			whereClause = { clientB2CId: targetId, }
		} else if (targetType === 'Subbrand') {
			whereClause = { subbrandId: targetId, }
		} else if (targetType === 'Office') {
			whereClause = { officeId: targetId, }
		} else {
			throw new BadRequestException('Invalid targetType. It must be one of: B2B, B2C, Subbrand, Office.',)
		}

		return this.prisma.productTypeSpecialPrice.findMany({
			where: whereClause,
		},)
	}

	private async updateDefaultEarningRates(productTypeId: string, data: ProductVariantDefaultEarningDto) {
		await this.earningsService.upsertDefaultEarningRate({
			...data,
			productTypeId,
		})
	}

	private async updateAdjustments(productTypeId: string, data: ProductVariantAdjustmentDto) {
		await this.prisma.adjustments.upsert({
			where: {
				productTypeId
			},
			create: {
				...data,
				productTypeId,
			},
			update: {
				...data,
			},
		})
	}

	private async updateExamples(productTypeId: string, data: Array<ProductVariantExampleDto>) {
		console.log(data, ' dataEXAMPLES',)
		const uploadedUrl = await Promise.all(data.map(async (example) => {
			if (example.url?.startsWith('data:')) {
				const url = await this.uploadService.uploadBase64(example.name ?? '', example.url)
				return {
					id: example.id,
					name: example.name,
					url,
				}
			}
			return example
		}))
		console.log(uploadedUrl, ' uploadedUrl',)

		await this.prisma.productTypeExample.deleteMany({
			where: {
				productTypeId,
			},
		})

		const createWithoutId = uploadedUrl.map((example) => {
			const {id, ...rest} = example
			return {
				...rest,
				productTypeId,
			}
		})

		await this.prisma.productTypeExample.createMany({
			data: createWithoutId,
		})

		// await Promise.all(updateMany.map(async (example) => {
		// 	await this.prisma.productTypeExample.upsert({
		// 		where: { id: example.id },
		// 		update: { url: example.url, name: example.name },
		// 		create: { url: example.url, name: example.name, productTypeId },
		// 	})
		// }))
	}
	

	private async updateAdditionalProduct(
		productTypeId: string,
		data: ProductVariantAdditionalProductDto,
		skill?: ContractorSkillNama,
	) {
		const contractorId = skill ? await this.defaultContractorsService.getDefaultContractorId(skill) : null
		await this.prisma.additionalProductType.upsert({
			where: {
				productTypeId,
			},
			create: {
				productTypeId,
				earningRate: { create: { ...data.earningRate } },
				adjustments: { create: { ...data.adjustments } },
				contractorId,
			},
			update: {
				earningRate: {
					upsert: {
						update: {
							...data.earningRate
						},
						create: {
							...data.earningRate
						}
					}
				},
				adjustments: {
					upsert: {
						update: {
							...data.adjustments
						},
						create: {
							...data.adjustments
						}
					}
				},
				contractorId,
			},
		})
	}

	private getProductIncludeClause() {
		return {
			productSkills: {
				include: {
					skill: true,
				},
			},
			productTypes: {
				include: {
					productTypeSkills: {
						include: {
							skill: true,
						},
					},
					contractor: {
						select: {
							id: true,
							name: true,
							surname: true,
						}
					},
					earningRate: true,
					adjustments: true,
					additionalProduct: {
						include: {
							adjustments: true,
							earningRate: true,
							contractor: true,
						}
					},
					cancellationFee: true,
					ProductTypeExample: true,
				},
			},
		}
	}

	public async getAdditionalPriceForPhotos(photos: Array<AdditionalPhotoDto>) {
		const photoCountMap = new Map<string, number>(); 
		const productTypes = [];
		const priceByPhotoCount: Record<number, number> = {}; 
	  
		for (const photo of photos) {
		  const count = photoCountMap.get(photo.bookingId) ?? 0;
		  photoCountMap.set(photo.bookingId, count + 1);
		}
	  
		let totalSum = 0;
	  
		for (const [bookingId, count] of photoCountMap.entries()) {
			console.log(bookingId, ' bookingId',)
		  const productType = await this.prisma.bookingToProductType.findFirst({
			where: {
			  bookingId,
			  productType: {
				productTypeSkills: {
				  some: {
					skill: {
					  name: ContractorSkillNama.PHOTO,
					},
				  },
				},
			  },
			},
			include: {
			  productType: {
				include: {
					additionalProduct : {
						include : {
							earningRate : {
								select : {
									additionalPrice : true,
								}
							}
						}
					},
				  earningRate: {
					select: {
					  additionalPrice: true,
					},
				  },
				},
			  },
			},
		  });
	  
		  if (!productType) {
			throw new NotFoundException(`Product type not found for bookingId ${bookingId}`);
		  }
	  
		  const price = productType.productType.earningRate?.additionalPrice ?? 0;
		  const subtotal = price * count;
		  totalSum += subtotal;
		  productTypes.push(productType);
	  
		  priceByPhotoCount[price] = (priceByPhotoCount[price] ?? 0) + count;
		}
	  
		return {
		  totalSum,
		  productTypes,
		  priceByPhotoCount, 
		};
	  }

	  public async updateStripePriceForOffice(productTypeId:string,officeId:string,price:number){
		const productType = await this.prisma.productType.findUnique({
			where: { id: productTypeId, },
			select : {
				stripeId: true,
			}
		},)

		if (!productType) {
			throw new NotFoundException('Product type not found',)
	  }

	  await this.stripeService.addPriceOfProductTypeToCheckoutSessionOffice(productType.stripeId, officeId, price,)
	  }
}
