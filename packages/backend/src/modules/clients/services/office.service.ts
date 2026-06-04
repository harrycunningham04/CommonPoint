/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { type Office, type Prisma, type PropertyType, type OfficeType, type OfficeClientType, ClientStatus, PaymentPreference, OfficeHiddenProduct, Product, ProductTypeSpecialPrice, } from '@prisma/client'
import { OfficeResponseDto, } from '../dto/office-response.dto'
import { OfficeUpdateDto, } from '../dto/office-update-dto'
import { OfficeAvailableProductsAddDto, OfficeAvailableProductsDto, OfficeAvailableProductsResponseDto, OfficePackagesDto, OfficeProductsUpdateDto, OfficesDto, SortBy, SortDirection, type IOfficeListReturn, } from '../dto/office.dto'
import { OfficeCreateDto, } from '../dto/office-create-dto'
import { WorkerService, } from './worker.service'
import { ConfigService, } from '@nestjs/config'
import { CryptoService, } from 'src/modules/crypto/crypto.service'
import { MailService, } from 'src/modules/mail/mail.service'
import { ICreateClientOptions, } from '../types/client-service.types'
import { ClientBasicService, } from './client-basic.service'
import { PreferencesService, } from './preferences-service'
import { ClientType, } from '../types/client.types'
import { SelectSkills, } from '../constants/client.constant'
import { StripeService, } from 'src/modules/stripe/stripe.service'
import { OfficeProductsDto, } from '../dto/office-products.dto'
import { PackageService, } from 'src/modules/products/packages/packages.service'
import { EClientType, } from 'src/shared/types/client.type'

@Injectable()
export class OfficeService {
	constructor(
		private prisma: PrismaService,
		private workerService: WorkerService,
		private cryptoService: CryptoService,
		private mailService: MailService,
		private configService: ConfigService,
		private readonly clientBasicService: ClientBasicService,
		private readonly preferencesService: PreferencesService,
		private readonly stripeService: StripeService,
		private readonly packagesService: PackageService,
	) {}

	public async getOfficesByClientId(clientId: string,): Promise<Array<OfficeResponseDto>> {
		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		const where: Prisma.OfficeWhereInput = {}

		if (clientType === ClientType.B2B) {
			where.b2BClientsId = clientId
		}

		if (clientType === ClientType.WORKER) {
			where.workers = {
				some: {
					worker_id: clientId,
				},
			}
		}

		if (clientType === ClientType.B2C) {
			return []
		}

		const offices = await this.prisma.office.findMany({
			where,
			orderBy: {id: 'asc',},
		},)

		return offices.map((office,) => {
			return OfficeResponseDto.cast(office,)
		},)
	}

	public async getFilteredOffices(query: OfficesDto,): Promise<IOfficeListReturn> {
		const { filter, search, skip, take, } = query
		const where: Prisma.OfficeWhereInput = {}

		if (filter) {
			if (filter.title) {
				where.title = { contains: filter.title, mode: 'insensitive', }
			}

			if (filter.name) {
				where.name = { contains: filter.name, mode: 'insensitive', }
			}

			if (filter.surname) {
				where.surname = { contains: filter.surname, mode: 'insensitive', }
			}

			if (filter.email) {
				where.email = { contains: filter.email, mode: 'insensitive', }
			}

			if (filter.phoneNumber) {
				where.phone_number = { contains: filter.phoneNumber, mode: 'insensitive', }
			}

			if (filter.address) {
				where.address = { contains: filter.address, mode: 'insensitive', }
			}

			if (filter.officeStatus) {
				where.officeStatus = Array.isArray(filter.officeStatus,) ?
					{ in: filter.officeStatus, } :
					filter.officeStatus as ClientStatus
			}

			if (filter.officeType) {
				where.officeType = Array.isArray(filter.officeType,) ?
					{ in: filter.officeType, } :
					filter.officeType as OfficeType
			}

			if (filter.officeClientType) {
				where.officeClientType = Array.isArray(filter.officeClientType,) ?
					{ in: filter.officeClientType, } :
					filter.officeClientType as OfficeClientType
			}

			if (filter.propertyTypes) {
				where.propertyTypes = { hasSome: filter.propertyTypes, }
			}

			if (filter.status !== undefined) {
				where.status = filter.status === 'true'
			}

			if (filter.adminId) {
				where.admin_id = filter.adminId
			}

			if (filter.b2BClientsId) {
				where.b2BClientsId = filter.b2BClientsId
			}

			if (filter.subbrandId !== undefined) {
				where.subbrandId = filter.subbrandId === 'null' ?
					null :
					filter.subbrandId
			}
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive', }, },
				{ name: { contains: search, mode: 'insensitive', }, },
				{ surname: { contains: search, mode: 'insensitive', }, },
				{ email: { contains: search, mode: 'insensitive', }, },
				{ phone_number: { contains: search, mode: 'insensitive', }, },
				{ address: { contains: search, mode: 'insensitive', }, },
			]
		}

		const orderBy: Array<Prisma.OfficeOrderByWithRelationInput> = []

		if (filter?.sortBy === SortBy.ALPHABETIC) {
			orderBy.push(
				{ title: filter.sortDirection ?? SortDirection.ASC, },
				{ name: filter.sortDirection ?? SortDirection.ASC, },
			)
		} else if (filter?.sortBy === SortBy.OFFICE_STATUS) {
			orderBy.push({ officeStatus: filter.sortDirection ?? SortDirection.ASC, },)
		} else if (filter?.sortBy === SortBy.OFFICE_TYPE) {
			orderBy.push({ officeType: filter.sortDirection ?? SortDirection.ASC, },)
		} else if (filter?.sortBy === SortBy.OFFICE_CLIENT_TYPE) {
			orderBy.push({ officeClientType: filter.sortDirection ?? SortDirection.ASC, },)
		} else if (filter?.sortBy === SortBy.NUMBER_OF_WORKERS) {
			orderBy.push({ numberOfWorkers: filter.sortDirection ?? SortDirection.ASC, },)
		}

		const [offices, totalCount,] = await Promise.all([
			this.prisma.office.findMany({
				where,
				orderBy,
				skip,
				take,
			},),
			this.prisma.office.count({ where, },),
		],)

		return {
			offices: offices.map((office,) => {
				return OfficeResponseDto.cast(office,)
			},),
			maxPage: Math.max(1, Math.ceil(totalCount / take,),),
		}
	}

	public async getOfficePackages(officeId: string,): Promise<Array<OfficeProductsDto>> {
		await this.getOfficeById(officeId,)

		const where = await this.packagesService.getPackageTargetsWhere(EClientType.B2B, officeId,)

		const packages = await this.prisma.package.findMany({
			where,
			include: {
				PackageProductType: {
					include: {
						productType: {
							include: {
								specialPrices: {
									where: {
										officeId,
									},
								},
								productTypeSkills: {
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

		return packages.map((pkg,) => {
			return OfficeProductsDto.castPackage(pkg,)
		},)
	}

	public async getOfficeProducts(officeId: string,): Promise<Array<OfficeProductsDto>> {
		const hiddenProducts = await this.getHiddenOfficeProducts(officeId,)

		const products = await this.prisma.product.findMany({
			where: {
				id: { notIn: hiddenProducts.map((product,) => {
					return product.productId
				},), },
				archived: false,
			},
			include: {
				productTypes: {
					include: {
						specialPrices: {
							where: {
								officeId,
							},
						},
						productTypeSkills: {
							include: { skill: true, },
						},
					},
				},
			},
		},)

		return products.map((product,) => {
			return OfficeProductsDto.cast(product,)
		},)
	}

	public async getSingleOfficeById(officeId:string,):Promise<any> {
		const office = await this.prisma.office.findFirst({
			where: {
				id: officeId,
			},
			include: {
				workers:     true,
				Booking:     true,
			},
		},)

		return office ?
			{
				...OfficeResponseDto.cast(office,),
				workers:     office.workers,
				preferences: [],
				Booking:     office.Booking,
			} :
			null
	}

	public async getOfficesBySubbrandId(subbrandId: string,): Promise<Array<Office>> {
		return this.prisma.office.findMany({
			where: { subbrandId, },
		},)
	}

	public async createOffice(data: OfficeCreateDto, options: ICreateClientOptions = {},): Promise<OfficeResponseDto> {
		const { checkEmail = true, } = options

		if (checkEmail) {
			const isTaken = await this.clientBasicService.checkIfEmailIsTaken(data.email,)
			if (isTaken.isTaken) {
				throw new ConflictException(
					`User with email ${data.email} already exists in the system. Change email to create office`,
				)
			}
		}

		const { workers = [], preferences, } = data

		const workerIds: Array<string> = workers?.filter((worker,) => {
			return worker.isExist
		},).map((worker,) => {
			return worker.id
		},) ?? []

		const admin = await this.prisma.admin.findFirst({ select: { id: true, }, },)

		const office = await this.prisma.office.create({
			data: {
				title:               data.title,
				name:                '',
				surname:             '',
				numberOfWorkers:     workers.length,
				phone_number:        data.phoneNumber,
				email:               data.email,
				address:             data.address,
				billing_address:     data.billingAddress,
				officeStatus:        ClientStatus.NEW,
				status:              true,
				admin:               { connect: { id: admin!.id, }, },
				b2BClients:          { connect: { id: data.b2BClientsId, }, },
				officeType:          data.officeType,
				officeClientType:    data.officeClientType,
				paymentPreferences:  data.paymentPreference,
			},
		},)

		const workersToCreate = workers.filter((worker,) => {
			return !worker.isExist
		},)

		await Promise.all(workersToCreate.map(async(worker,) => {
			const createdWorker = await this.workerService.createWorker(worker, { checkEmail: false, },)
			workerIds.push(createdWorker.id,)
		},),)

		if (workerIds.length) {
			await this.prisma.workerOnOffice.createMany({
				data: workerIds.map((workerId,) => {
					return { worker_id: workerId, office_id: office.id, }
				},),
			},)
		}

		await this.preferencesService.getAndCreateForOffice(office.id,)

		return OfficeResponseDto.cast(office,)
	}

	public async deleteOffice(id: string,): Promise<Office> {
		return this.prisma.office.delete({where: { id, },},)
	}

	public async updateOfficePartial(id: string, data: OfficeUpdateDto,): Promise<OfficeResponseDto> {
		const updateData: Prisma.OfficeUpdateInput = {
			title:               data.title,
			name:                data.name,
			surname:             data.surname,
			phone_number:        data.phoneNumber,
			email:               data.email,
			address_coordinates: data.addressCoordinates,
			address:             data.address,
			billing_address:     data.billingAddress,
			officeStatus:        data.officeStatus,
			status:              data.status,
			propertyTypes:       data.propertyTypes,
			officeType:          data.officeType,
			officeClientType:    data.officeClientType,
			paymentPreferences:  data.paymentPreferences,
		}

		if (data.adminId) {
			updateData.admin = { connect: { id: data.adminId, }, }
		}
		if (data.b2BClientsId) {
			updateData.b2BClients = { connect: { id: data.b2BClientsId, }, }
		}
		if (data.subbrandId) {
			updateData.Subbrand = { connect: { id: data.subbrandId, }, }
		}

		const updatedOffice = await this.prisma.office.update({
			where:   { id, },
			data:    updateData,
		},)

		return OfficeResponseDto.cast(updatedOffice,)
	}

	public async getPreferences(officeId: string,): Promise<Array<any>> {
		return this.prisma.preference.findMany({
			where: { offices: { some: { id: officeId, }, }, },
		},)
	}

	public async addPreference(officeId: string, data: any,): Promise<any> {
		const { b2bClientId,b2cClientId,subbrandId, ...rest } = data
		return null
	}

	public async updatePreference(officeId: string, preferenceId: string, data: Partial<Prisma.PreferenceUpdateInput>,): Promise<any> {
		return this.prisma.preference.update({
			where: { id: preferenceId, },
			data,
		},)
	}

	public async deletePreference(officeId: string, preferenceId: string,): Promise<any> {
		return this.prisma.preference.delete({
			where: { id: preferenceId, },
		},)
	}

	public async getPaymentPreferences(officeId: string,): Promise<PaymentPreference> {
		const office = await this.prisma.office.findUnique({
			where:  { id: officeId, },
			select: { paymentPreferences: true, },
		},)
		return office?.paymentPreferences ?? PaymentPreference.INVOICES
	}

	public async checkOfficeById(officeId: string,): Promise<boolean> {
		const office = await this.prisma.office.findUnique({
			where:  { id: officeId, },
			select: { id: true, },
		},)
		return Boolean(office,)
	}

	public async getIsPriorityOffice(officeId?: string,): Promise<boolean> {
		if (!officeId) {
			return false
		}

		const office = await this.prisma.office.findUnique({
			where:  { id: officeId, },
			select: { officeStatus: true, },
		},)

		return Boolean(office?.officeStatus === ClientStatus.PRIORITIZED,)
	}

	public async getFilteredOfficesAdmin(query: OfficesDto,): Promise<IOfficeListReturn> {
		return this.getFilteredOffices(query,)
	}

	public async getSingleOfficeByIdAdmin(officeId:string,):Promise<OfficeResponseDto | null> {
		const office = await this.prisma.office.findFirst({
			where: {
				id: officeId,
			},
			include: {
				workers:          true,
				officePreference: true,
				Booking:          true,
			},
		},)

		return office ?
			OfficeResponseDto.cast(office,) :
			null
	}

	public async updateOfficePartialAdmin(id: string, data: OfficeUpdateDto,): Promise<OfficeResponseDto> {
		return this.updateOfficePartial(id, data,)
	}

	public async deleteOfficeAdmin(id: string,): Promise<OfficeResponseDto> {
		const office = await this.prisma.office.delete({where: { id, },},)
		return OfficeResponseDto.cast(office,)
	}

	public async getOfficePackagesForm(query: OfficePackagesDto,): Promise<Array<OfficeResponseDto>> {
		const { brandIds = [], subbrandIds = [], search = '', } = query

		const where: Prisma.OfficeWhereInput = {}

		if (brandIds.length > 0) {
			where.b2BClientsId = { in: brandIds, }
		}

		if (subbrandIds.length > 0) {
			where.subbrandId = { in: subbrandIds, }
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive', }, },
				{ name: { contains: search, mode: 'insensitive', }, },
				{ surname: { contains: search, mode: 'insensitive', }, },
			]
		}

		const offices = await this.prisma.office.findMany({ where, },)

		return offices.map((office,) => {
			return OfficeResponseDto.cast(office,)
		},)
	}

	public async getPaymentPreferencesByOfficeId(officeId: string,): Promise<PaymentPreference | null> {
		const office = await this.prisma.office.findUnique({
			where:  { id: officeId, },
			select: { paymentPreferences: true, },
		},)
		return office?.paymentPreferences ?? null
	}

	public async getOfficesByB2BClient(clientId: string,): Promise<Array<{ id: string, title: string, }>> {
		const offices = await this.prisma.office.findMany({
			where:  { b2BClientsId: clientId, },
			select: {
				id:    true,
				title: true,
			},
		},)
		return offices.map((office,) => {
			return {
				id:    office.id,
				title: office.title,
			}
		},)
	}

	public async getOfficeById(officeId: string,): Promise<Office> {
		const office = await this.prisma.office.findUnique({
			where: { id: officeId, },
		},)

		if (!office) {
			throw new NotFoundException('Office not found',)
		}

		return office
	}

	public async getHiddenOfficeProducts(officeId:string,): Promise<Array<OfficeHiddenProduct & { product: Product }>> {
		const hiddenProducts = await this.prisma.officeHiddenProduct.findMany({
			where:   { officeId, product: { archived: false, }, },
			include: {
				product: true,
			},
		},)

		return hiddenProducts
	}

	public async getAvailableProducts(officeId: string,): Promise<OfficeAvailableProductsResponseDto> {
		await this.getOfficeById(officeId,)

		const hiddenProducts = await this.getHiddenOfficeProducts(officeId,)

		const availableProducts = await this.prisma.product.findMany({
			where: {
				id: { notIn: hiddenProducts.map((product,) => {
					return product.productId
				},), },
				archived: false,
			},
		},)

		return {
			productsAvailable: availableProducts.map((product,) => {
				return new OfficeAvailableProductsDto({
					id:    product.id,
					title: product.name,
				},)
			},),
			productsHidden: hiddenProducts.map((product,) => {
				return new OfficeAvailableProductsDto({
					id:    product.productId,
					title: product.product.name,
				},)
			},),
		}
	}

	public async addAvailableProduct(officeId: string, data: OfficeAvailableProductsAddDto,): Promise<void> {
		await this.getOfficeById(officeId,)

		await this.prisma.officeHiddenProduct.delete({
			where: {
				officeId_productId: {
					officeId,
					productId: data.productId,
				},
			},
		},)
	}

	public async removeAvailableProduct(officeId: string, productId: string,): Promise<void> {
		await this.getOfficeById(officeId,)

		await this.prisma.officeHiddenProduct.create({
			data: {
				officeId,
				productId,
			},
		},)
	}

	public async updateOfficeProductsPrices(officeId: string, data: OfficeProductsUpdateDto,): Promise<void> {
		const { productTypes, } = data
		await this.getOfficeById(officeId,)

		if (productTypes.length === 0) {
			return
		}

		await Promise.all(productTypes.map(async(productType,) => {
			await this.prisma.productTypeSpecialPrice.upsert({
				where:  { productTypeId_officeId: { productTypeId: productType.id, officeId, }, },
				update: { price: productType.price, },
				create: { productTypeId: productType.id, officeId, price: productType.price, },
			},)

			const productTypeRecord = await this.prisma.productType.findUnique({
				where:  { id: productType.id, },
				select: { stripeId: true, },
			},)
			if (!productTypeRecord?.stripeId) {
				throw new NotFoundException(`Stripe product not found for productTypeId ${productType.id}`,)
			}

			await this.stripeService.addPriceOfProductTypeToCheckoutSessionOffice(
				productTypeRecord.stripeId,
				officeId,
				productType.price,
			)
		},),)
	}

	public async getOfficeProductsPrices(
		officeId: string,
		productVariantIds: Array<string>,
	): Promise<number> {
		await this.getOfficeById(officeId,)

		const uniqueIds = [...new Set(productVariantIds,),]
		const productTypes = await this.prisma.productType.findMany({
			where:   { id: { in: uniqueIds, }, },
			include: {
				specialPrices: {
					where: { officeId, },
					take:  1,
				},
			},
		},)

		return productTypes.reduce((sum, pt,) => {
			const price = pt.specialPrices[0]?.price ?? pt.price ?? 0
			return sum + price
		}, 0,)
	}
}
