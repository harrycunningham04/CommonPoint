/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable no-await-in-loop */
import { BadRequestException, Injectable, Logger, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Package, Prisma, } from '@prisma/client'
import type { Response, } from 'express'
import { unparse, } from 'papaparse'
import type { CreatePackageDto, TargetDtoCreate, UpdatePackageDto, } from './dto/create-package.dto'
import { BasicPackageDto, type GetBookingPackageDto, } from './dto/get-booking-package.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { PACKAGE_INCLUDE_TYPE, } from './packgae.const'
import { BasicProductTypeDto, } from '../products/dto/get-product-variant-booking.dto'
import type { TargetDto,} from './dto/get-list-packages.dto'
import { GetListPackagesDto, } from './dto/get-list-packages.dto'
import { StripeService, } from 'src/modules/stripe/stripe.service'
import { WorkerService, } from 'src/modules/clients/services/worker.service'
import { EClientType, } from 'src/shared/types/client.type'
import type { PackagesQueryDto, } from './dto/packages-query.dto'
import { ProductService, } from '../products/products.service'

@Injectable()
export class PackageService {
	private readonly logger = new Logger(PackageService.name,)

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService,
	private readonly workerService: WorkerService,
	private readonly productService: ProductService,

	) {}

	public async getPackages(query: any,): Promise<{ data: Array<GetListPackagesDto> }> {
		const {
			search = '',
			skills = [],
			sortBy = 'title',
			sortDirection = 'asc',
		} = query

		const whereClause: Prisma.PackageWhereInput = {
			title: {
				contains: search,
				mode:     'insensitive',
			},
		}
		console.log(skills,)
		if (skills.length > 0) {
			whereClause.PackageProductType = {
				some: {
					productType: {
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
				},
			}
		}

		const orderByClause: Record<string, 'asc' | 'desc'> = {}
		if (sortBy) {
			orderByClause[sortBy] = sortDirection
		}

		const packages = await this.prisma.package.findMany({
			where:   whereClause,
			orderBy: orderByClause,
			include: {
				PackageProductType: {
					include: {
						productType: true,
					},
				},
				targets: {
					include: {
						b2bClient: true,
						Office:    true,
					},
				},
				products: {
					include: {
						product: {
							include: {
								productSkills: {
									include: {
										skill: true,
									},
								},
							},
						},
					},
				},
			},
		},)

		return {
			data: packages.map((pkg,) => {
				return GetListPackagesDto.cast(pkg,)
			},),
		}
	}

	public async getPackagesPaginated(query: PackagesQueryDto,): Promise<PagedResDto<GetListPackagesDto>> {
		const { search = '', skills = [], sortBy = 'title', sortDirection = 'asc', skip, take, } = query

		const whereClause: Prisma.PackageWhereInput = {
			title: {
				contains: search,
				mode:     'insensitive',
			},
		}
		if (skills && skills.length > 0) {
			whereClause.PackageProductType = {
				some: {
					productType: {
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
				},
			}
		}

		const orderByClause: Record<string, 'asc' | 'desc'> = {}
		if (sortBy) {
			orderByClause[sortBy as keyof Package] = sortDirection as 'asc' | 'desc'
		}

		const [packages, total,] = await Promise.all([
			this.prisma.package.findMany({
				where:   whereClause,
				orderBy: orderByClause,
				skip,
				take,
				include: {
					PackageProductType: {
						include: {
							productType: true,
						},
					},
					targets: {
						include: {
							b2bClient: true,
							Office:    true,
						},
					},
					products: {
						include: {
							product: {
								include: {
									productSkills: {
										include: {
											skill: true,
										},
									},
								},
							},
						},
					},
				},
			},),
			this.prisma.package.count({
				where: whereClause,
			},),
		],)

		const hasNext = skip + take < total

		return {
			data: packages.map((pkg,) => {
				return GetListPackagesDto.cast(pkg,)
			},),
			hasNext,
		}
	}

	public async addPackage(data: CreatePackageDto,): Promise<Package> {
		try {
			const stripeProduct = await this.stripeService.createProduct(data.title, data.price,)

			const newPackage: Package = await this.prisma.package.create({
				data: {
					title:       data.title,
					price:       data.price,
					stripeId:    stripeProduct.id,
					description: data.description,
					picture:     data.picture,
					pictureName: data.pictureName,
				},
			},)

			if ((data.targets.officeId && data.targets.officeId.length > 0) ?? (data.targets.b2bClientId && data.targets.b2bClientId.length > 0)) {
				const targetsToCreate: Array<Prisma.PackageTargetsCreateManyInput> = []
				if (data.targets.officeId && data.targets.officeId.length > 0) {
					targetsToCreate.push(...data.targets.officeId.map((officeId,) => {
						return {
							packageId:   newPackage.id,
							officeId,
						}
					},),)
				}
				if (data.targets.b2bClientId && data.targets.b2bClientId.length > 0) {
					targetsToCreate.push(...data.targets.b2bClientId.map((b2bClientId,) => {
						return {
							packageId:   newPackage.id,
							b2bClientId,
						}
					},),)
				}

				if (data.targets.subbrandId && data.targets.subbrandId.length > 0) {
					targetsToCreate.push(...data.targets.subbrandId.map((subbrandId,) => {
						return {
							packageId:   newPackage.id,
							subbrandId,
						}
					},),)
				}

				await this.prisma.packageTargets.createMany({
					data: targetsToCreate,
				},)
			}

			if (data.productTypeIds.length > 0) {
				const packageProductTypeCreate = data.productTypeIds.map((productTypeId,) => {
					return {
						packageId:     newPackage.id,
						productTypeId,
					}
				},)
				await this.prisma.packageProductType.createMany({
					data: packageProductTypeCreate,
				},)
			}

			return newPackage
		} catch (error) {
			this.logger.error({ method: this.addPackage.name, error, },)
			throw error
		}
	}

	public async getPackageTargetsWhere(
		clientType: EClientType | undefined,
		officeId?: string,
	): Promise<Prisma.PackageWhereInput> {
		if (clientType === EClientType.B2C) {
			return { isForB2C: true, }
		}

		if (!officeId) {
			throw new NotFoundException('officeId is required for non-B2C clients',)
		}

		const office = await this.prisma.office.findUnique({
			where:  { id: officeId, },
			select: {
				b2BClientsId: true,
				subbrandId:   true,
			},
		},)

		if (!office) {
			throw new NotFoundException('Office not found',)
		}

		const directOfficeTargets = await this.prisma.packageTargets.findMany({
			where: {
				officeId,
			},
			select: {
				packageId: true,
			},
		},)

		const directPackageIds = new Set(directOfficeTargets.map((pt,) => {
			return pt.packageId
		},),)

		if (directPackageIds.size > 0) {
			return {
				id: {
					in: Array.from(directPackageIds,),
				},
			}
		}

		const overriddenTargets = await this.prisma.packageTargets.findMany({
			where: {
				officeId: {
					not: null,
				},
			},
			select: {
				packageId: true,
			},
		},)

		const overriddenPackageIds = new Set(overriddenTargets.map((pt,) => {
			return pt.packageId
		},),)

		const orConditions: Array<Prisma.PackageTargetsWhereInput> = []

		if (office.b2BClientsId) {
			orConditions.push({
				b2bClientId: office.b2BClientsId,
				officeId:    null,
			},)
		}

		if (office.subbrandId) {
			orConditions.push({
				subbrandId: office.subbrandId,
				officeId:   null,
			},)
		}

		return {
			AND: [
				{
					id: {
						notIn: Array.from(overriddenPackageIds,),
					},
				},
				{
					targets: {
						some: {
							OR: orConditions,
						},
					},
				},
			],
		}
	}

	public async getBookingPackages(query : GetBookingPackageDto,clientId?: string,):Promise<PagedResDto<BasicPackageDto>> {
		const clientType = clientId ?
			await this.workerService.detectClientType(clientId,) :
			undefined
		const {skip,take, search, officeId,sqft,bedrooms,} = query
		const adjustmentConditions = this.productService.getAdjustmentConditions({sqft: sqft ?? 0,bedrooms: bedrooms ?? 0,},)

		const where = await this.getPackageTargetsWhere(clientType, officeId,)

		if (search) {
			where.title = {
				contains: search,
				mode:     'insensitive',
			}
		}

		const packages = await this.prisma.package.findMany({
			where: {
				...where,
				PackageProductType: {
					some: {
						productType: adjustmentConditions,
					},
				},
			},
			skip,
			take,
			include: {
				PackageProductType: {
					include: {
						productType: {
							include: {
								productTypeSkills: {
									include: {
										skill: true,
									},
								},
							},
						},
					},
				},
			},},)

		const totalCount = await this.prisma.package.count({
			where,
		},)

		const mappedPackages = packages.map((pkg,) => {
			return new BasicPackageDto({
				id:           pkg.id,
				title:        pkg.title,
				price:        pkg.price,
				picture:      pkg.picture ?? undefined,
				description:  pkg.description ?? undefined,
				productTypes: pkg.PackageProductType.map(({ productType, },) => {
					return new BasicProductTypeDto({
						id:                    productType.id,
						name:                  productType.name,
						descriptionClient:     productType.description_client ?? undefined,
						descriptionContractor: productType.description_contractor ?? undefined,
						price:                 productType.price,
						duration: 		           productType.duration,
						skills:                productType.productTypeSkills.map((skill,) => {
							return skill.skill.name
						},),
						requiresOnSiteContractor: productType.requires_on_site_contractor,
					},)
				},
				),
			},)
		},)

		return {
			data:    mappedPackages,
			hasNext: totalCount > skip + take,
		}
	}

	public async exportPackages(query: any, res: Response,): Promise<void> {
		const { search = '', filter = '{}', sortBy = 'title', sortDirection = 'asc', } = query

		const parsedFilter = JSON.parse(filter,)

		const whereClause: any = {
			title: {
				contains: search,
				mode:     'insensitive',
			},
		}
		if (parsedFilter.products && parsedFilter.products.length > 0) {
			whereClause.products = {
				some: {
					product: {
						name: {
							in: parsedFilter.products,
						},
					},
				},
			}
		}

		const orderByClause: Record<string, 'asc' | 'desc'> = {}
		if (sortBy) {
			orderByClause[sortBy] = sortDirection
		}

		const packages = await this.prisma.package.findMany({
			where:   whereClause,
			orderBy: orderByClause,
			include: {
				products: {
					include: {
						product: {
							include: {
								productSkills: {
									include: {
										skill: true,
									},
								},
							},
						},
					},
				},
			},
		},)

		const csvData = unparse(
			packages.map((pkg,) => {
				return {
					title:    pkg.title,
					products: pkg.products.map((pkgProduct,) => {
						return pkgProduct.product.name
					},).join(', ',),
					price:    pkg.price,
				}
			},),
		)
		res.setHeader('Content-Type', 'text/csv',)
		res.setHeader('Content-Disposition', 'attachment; filename="packages.csv"',)
		res.send(csvData,)
	}

	public async getPackagesByClientId(clientId: string,) {
		return this.prisma.package.findMany({
			where: {
				targets: {
					some: {
						b2bClientId: clientId,
					},
				},
			},
			include: {
				targets:  true,
				products: {
					include: {
						product: true,
					},
				},
			},
		},)
	}

	public async getPackagesBySubbrandId(subbrandId: string,) {
		return this.prisma.package.findMany({
			where: {
				targets: {
					some: {
						officeId: subbrandId,
					},
				},
			},
			include: {
				products: {
					include: {
						product: true,
					},
				},
			},
		},)
	}

	public async deletePackageTarget(packageId: string, clientId: string,): Promise<void> {
		const packageTargets = await this.prisma.packageTargets.findMany({
			where: { packageId, },
		},)

		if (packageTargets.length <= 1) {
			await this.prisma.package.delete({ where: { id: packageId, }, },)
		} else {
			await this.prisma.packageTargets.deleteMany({
				where: {
					packageId,
					b2bClientId: clientId,
				},
			},)
		}
	}

	public async deletePackage(packageId: string,): Promise<void> {
		try {
			// check if the package exists
			const packageExists = await this.prisma.package.findUnique({
				where: { id: packageId, },
			},)

			if (!packageExists) {
				throw new Error('Package not found',)
			}

			// delete the package
			await this.prisma.package.delete({
				where: { id: packageId, },
			},)
		} catch (error) {
			this.logger.error({ method: this.deletePackage.name, error, },)
			throw error
		}
	}

	public async getPackageTargets(packageId: string,) {
		try {
			const targets = await this.prisma.packageTargets.findMany({
				where: { packageId, },
			},)

			return { data: targets, }
		} catch (error) {
			this.logger.error({ method: this.getPackageTargets.name, error, },)
			throw error
		}
	}

	public async updatePackage(packageId: string, data: UpdatePackageDto,): Promise<Package> {
		const { title, price, products, productTypeIds, targets, } = data

		const packageExists = await this.prisma.package.findUnique({
			where: { id: packageId, },
		},)

		if (!packageExists) {
			throw new Error('Package not found',)
		}

		if (productTypeIds && productTypeIds.length > 0) {
			await this.prisma.$transaction([
				this.prisma.packageProductType.deleteMany({ where: { packageId, }, },),
				this.prisma.packageProductType.createMany({
					data: productTypeIds.map((productTypeId,) => {
						return {
							packageId,
							productTypeId,
						}
					},),
				},),
			],)
		}
		if (targets && ((targets.officeId && targets.officeId.length > 0) ?? (targets.b2bClientId && targets.b2bClientId.length > 0) ?? (targets.subbrandId && targets.subbrandId.length > 0))) {
			await this.updatePackageTargets(packageId, targets,)
		}

		return this.prisma.package.update({
			where: { id: packageId, },
			data:  {
				title,
				price,
				picture:     data.picture,
				pictureName: data.pictureName,
				description: data.description ?? undefined,
			},
		},)
	}

	private async updatePackageTargets(packageId: string, targets: TargetDtoCreate,): Promise<void> {
		if (
			(targets.officeId?.length ?? 0) > 0 ||
			(targets.b2bClientId?.length ?? 0) > 0 ||
			(targets.subbrandId?.length ?? 0) > 0
		) {
			const targetsToCreate: Array<Prisma.PackageTargetsCreateManyInput> = []

			if (targets.officeId && targets.officeId.length > 0) {
				targetsToCreate.push(
					...targets.officeId.map((officeId,) => {
						return {
							packageId,
							officeId,
						}
					},),
				)
			}

			if (targets.b2bClientId && targets.b2bClientId.length > 0) {
				targetsToCreate.push(
					...targets.b2bClientId.map((b2bClientId,) => {
						return {
							packageId,
							b2bClientId,
						}
					},),
				)
			}

			if (targets.subbrandId && targets.subbrandId.length > 0) {
				targetsToCreate.push(
					...targets.subbrandId.map((subbrandId,) => {
						return {
							packageId,
							subbrandId,
						}
					},),
				)
			}

			console.log(targetsToCreate,)

			await this.prisma.$transaction([
				this.prisma.packageTargets.deleteMany({ where: { packageId, }, },),
				this.prisma.packageTargets.createMany({ data: targetsToCreate, },),
			],)
		} else if (targets.officeId && targets.b2bClientId && targets.officeId.length === 0 && targets.b2bClientId.length === 0) {
			await this.prisma.packageTargets.deleteMany({ where: { packageId, }, },)
		}
	}

	public async getPackageTotalPrice(packageId: string,): Promise<number> {
		const pkg = await this.prisma.package.findUnique({
			where:  { id: packageId, },
			select: {
				price: true,
			},
		},)

		if (!pkg) {
			throw new Error('Package not found',)
		}

		return pkg.price ?? 0
	}
}
