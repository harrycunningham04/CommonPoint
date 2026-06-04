import { Injectable, Logger, NotFoundException, ConflictException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Package, Prisma, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { ClientPackagesQueryDto, } from '../dto/client-packages-query.dto'
import { GetListPackagesDto, } from '../dto/get-list-packages.dto'
import { ClientBasicService, } from 'src/modules/clients/services/client-basic.service'
import { ClientType, } from 'src/modules/clients/types/client.types'

@Injectable()
export class ClientPackagesService {
	private readonly logger = new Logger(ClientPackagesService.name,)

	constructor(private readonly prisma: PrismaService,
		private readonly basicClientService: ClientBasicService,
	) {}

	public async getB2BClientPackages(
		clientId: string,
		query: ClientPackagesQueryDto,
	): Promise<PagedResDto<GetListPackagesDto>> {
		const { search = '', skip, take, } = query

		const clientType = await this.basicClientService.getClientTypeById(clientId,)

		if (clientType === ClientType.B2B) {
			return this.getB2BClientPackagesItems(clientId, query,)
		}

		return this.getB2CClientPackagesItems(clientId, query,)
	}

	public async getB2CClientPackagesItems(clientId: string, query: ClientPackagesQueryDto,): Promise<PagedResDto<GetListPackagesDto>> {
		const { search = '', skip, take, } = query

		const packages = await this.prisma.package.findMany({
			where: {
				isForB2C: true,
			},
			include: {
				targets: {
					include: {
						b2bClient: true,
						Office:    true,
					},
				},
				PackageProductType: {
					include: {
						productType: true,
					},
				},
			},
			skip,
			take,
		},)

		return {
			data:    packages.map((pkg,) => {
				return GetListPackagesDto.cast(pkg,)
			},),
			hasNext: packages.length > skip + take,
		}
	}

	public async getB2BClientPackagesItems(clientId: string, query: ClientPackagesQueryDto,): Promise<PagedResDto<GetListPackagesDto>> {
		const { search = '', skip, take, } = query

		const b2bClient = await this.prisma.b2BClients.findUnique({
			where:   { id: clientId, },
			include: {
				offices: {
					select: { id: true, },
				},
			},
		},)

		if (!b2bClient) {
			throw new NotFoundException('B2B client not found',)
		}

		const officeIds = b2bClient.offices.map((office,) => {
			return office.id
		},)

		const where: Prisma.PackageWhereInput = {
			OR: [
				{
					targets: {
						some: {
							b2bClientId: clientId,
						},
					},
				},
				...(officeIds.length > 0 ?
					[{
						targets: {
							some: {
								officeId: {
									in: officeIds,
								},
							},
						},
					},] :
					[]),
			],
		}

		if (search) {
			where.title = {
				contains: search,
				mode:     'insensitive',
			}
		}

		const [packages, totalCount,] = await Promise.all([
			this.prisma.package.findMany({
				where,
				skip,
				take,
				include: {
					targets: {
						include: {
							b2bClient: true,
							Office:    true,
						},
					},
					PackageProductType: {
						include: {
							productType: true,
						},
					},
				},
				orderBy: {
					title: 'asc',
				},
			},),
			this.prisma.package.count({ where,},),
		],)

		return {
			data:    packages.map((pkg,) => {
				return GetListPackagesDto.cast(pkg,)
			},),
			hasNext: totalCount > skip + take,
		}
	}

	public async assignPackageToB2BClient(clientId: string, packageId: string,): Promise<void> {
		const b2bClient = await this.prisma.b2BClients.findUnique({
			where: { id: clientId, },
		},)

		if (!b2bClient) {
			throw new NotFoundException('B2B client not found',)
		}

		const packageExists = await this.prisma.package.findUnique({
			where: { id: packageId, },
		},)

		if (!packageExists) {
			throw new NotFoundException('Package not found',)
		}

		const existingAssignment = await this.prisma.packageTargets.findFirst({
			where: {
				packageId,
				b2bClientId: clientId,
			},
		},)

		if (existingAssignment) {
			throw new ConflictException('Package is already assigned to this B2B client',)
		}

		await this.prisma.packageTargets.create({
			data: {
				packageId,
				b2bClientId: clientId,
			},
		},)
	}

	public async unassignPackageFromB2BClient(clientId: string, packageId: string,): Promise<void> {
		const clientAssignment = await this.prisma.packageTargets.findFirst({
			where: {
				packageId,
				b2bClientId: clientId,
			},
		},)

		const clientOffices = await this.prisma.office.findMany({
			where: {
				b2BClientsId: clientId,
			},
			select: {
				id: true,
			},
		},)

		const officeAssignments = await this.prisma.packageTargets.findMany({
			where: {
				packageId,
				officeId: {
					in: clientOffices.map((office,) => {
						return office.id
					},),
				},
			},
		},)

		if (!clientAssignment && officeAssignments.length === 0) {
			throw new NotFoundException('Package is not assigned to this client or any of its offices',)
		}

		if (clientAssignment) {
			await this.prisma.packageTargets.delete({
				where: { id: clientAssignment.id, },
			},)
		}

		if (officeAssignments.length > 0) {
			await this.prisma.packageTargets.deleteMany({
				where: {
					id: {
						in: officeAssignments.map((assignment,) => {
							return assignment.id
						},),
					},
				},
			},)
		}
	}
}
