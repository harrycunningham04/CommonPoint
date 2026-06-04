import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'
import type { CreateSubbrandDto, UpdateSubbrandDto, GetSubbrandsQueryDto, } from '../dto/subbrand.dto'
import { SubbrandResponseDto, } from '../dto/subbrand-response.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import type { SubbrandDto, } from '../dto/subbrand-dto'

@Injectable()
export class AdminSubbrandService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getSubbrandsByClientId(clientId: string, query: GetSubbrandsQueryDto,): Promise<PagedResDto<SubbrandResponseDto>> {
		const { search, sortBy, sortOrder, take, skip, showArchived, } = query

		const archived = showArchived ?
			undefined :
			false

		const where: Prisma.SubbrandWhereInput = {
			parentBrandId: clientId,
			archived,
		}

		if (search) {
			where.OR = [
				{
					companyName: { contains: search, mode: 'insensitive', },
				},
				{
					email: { contains: search, mode: 'insensitive', },
				},
				{
					phoneNumber: { contains: search, mode: 'insensitive', },
				},
			]
		}

		const orderBy: Prisma.SubbrandOrderByWithRelationInput = {}
		if (sortBy) {
			let sortField: keyof Prisma.SubbrandOrderByWithRelationInput
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

		const [subbrands, totalCount,] = await Promise.all([
			this.prisma.subbrand.findMany({
				where,
				orderBy,
				take,
				skip,
			},),
			this.prisma.subbrand.count({ where,},),
		],)

		const subbrandDtos = subbrands.map((subbrand,) => {
			return SubbrandResponseDto.cast(subbrand,)
		},)

		return {
			data:    subbrandDtos,
			hasNext: totalCount > skip + take,
		}
	}

	public async createSubbrand(data: CreateSubbrandDto & { parentBrandId: string, },): Promise<SubbrandResponseDto> {
		const { officeIds, ...subbrandData } = data

		const subbrand = await this.prisma.subbrand.create({
			data: {
				...subbrandData,
				offices: officeIds ?
					{
						connect: officeIds.map((id,) => {
							return { id, }
						},),
					} :
					undefined,
			},
		},)

		return SubbrandResponseDto.cast(subbrand,)
	}

	public async updateSubbrand(id: string, data: UpdateSubbrandDto,): Promise<SubbrandResponseDto> {
		const { officeIds, ...subbrandData } = data

		const existingSubbrand = await this.prisma.subbrand.findUnique({
			where: { id, },
		},)

		if (!existingSubbrand) {
			throw new NotFoundException(`Subbrand with ID ${id} not found`,)
		}

		const subbrand = await this.prisma.subbrand.update({
			where: { id, },
			data:  {
				...subbrandData,
				offices: officeIds ?
					{
						set:     [],
						connect: officeIds.map((officeId,) => {
							return { id: officeId, }
						},),
					} :
					undefined,
			},
		},)

		return SubbrandResponseDto.cast(subbrand,)
	}

	public async deleteSubbrand(id: string,): Promise<SubbrandResponseDto> {
		const existingSubbrand = await this.prisma.subbrand.findUnique({
			where:   { id, },
		},)

		if (!existingSubbrand) {
			throw new NotFoundException(`Subbrand with ID ${id} not found`,)
		}

		const deletedSubbrand = await this.prisma.subbrand.update({
			where: { id, },
			data:  {
				archived: true,
			},
		},)

		return SubbrandResponseDto.cast(deletedSubbrand,)
	}

	public async getSubbrandById(id: string,): Promise<SubbrandResponseDto> {
		const subbrand = await this.prisma.subbrand.findUnique({
			where:   { id, },
		},)

		if (!subbrand) {
			throw new NotFoundException(`Subbrand with ID ${id} not found`,)
		}

		return SubbrandResponseDto.cast(subbrand,)
	}

	public async getSubbrands(query: SubbrandDto,): Promise<Array<SubbrandResponseDto>> {
		const { search = '', brandIds = [], } = query

		const whereClause: Prisma.SubbrandWhereInput = {
			companyName: {
				contains: search,
				mode:     'insensitive',
			},
		}

		if (brandIds.length > 0) {
			whereClause.offices = {
				some: {
					b2BClientsId: {
						in: brandIds,
					},
				},
			}
		}

		const subbrands = await this.prisma.subbrand.findMany({
			where: whereClause,
		},)

		return subbrands.map((subbrand,) => {
			return SubbrandResponseDto.cast(subbrand,)
		},)
	}
}
