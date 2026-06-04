/* eslint-disable no-mixed-spaces-and-tabs */
import { Injectable, Logger, NotFoundException, ConflictException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Package, Prisma, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { OfficePackagesQueryDto, } from '../dto/office-packages-query.dto'
import { GetListPackagesDto, } from '../dto/get-list-packages.dto'

@Injectable()
export class OfficePackagesService {
	private readonly logger = new Logger(OfficePackagesService.name,)

	constructor(private readonly prisma: PrismaService,) {}

	public async getOfficePackages(
		officeId: string,
		query: OfficePackagesQueryDto,
	): Promise<PagedResDto<GetListPackagesDto>> {
		const { search = '', skip, take, } = query

		const office = await this.prisma.office.findUnique({
			where: { id: officeId, },
		},)

		if (!office) {
			throw new NotFoundException('Office not found',)
		}

		const where: Prisma.PackageWhereInput = {
			targets: {
				some: {
					officeId,
				},
			},
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

	public async assignPackageToOffice(officeId: string, packageId: string,): Promise<void> {
		const office = await this.prisma.office.findUnique({
			where: { id: officeId, },
		},)

		if (!office) {
			throw new NotFoundException('Office not found',)
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
				officeId,
			},
		},)

		if (existingAssignment) {
			throw new ConflictException('Package is already assigned to this office',)
		}

		await this.prisma.packageTargets.create({
			data: {
				packageId,
				officeId,
			},
		},)
	}

	public async unassignPackageFromOffice(officeId: string, packageId: string,): Promise<void> {
		const assignment = await this.prisma.packageTargets.findFirst({
			where: {
				packageId,
				officeId,
			},
		},)

		if (!assignment) {
			throw new NotFoundException('Package assignment not found',)
		}

		await this.prisma.packageTargets.delete({
			where: { id: assignment.id, },
		},)
	}
}
