/* eslint-disable complexity */
/* eslint-disable no-underscore-dangle */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { DisputeStatusToName, type GetDisputeDto, } from '../dto/disputes.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { GetDisputeClientAdminDto, } from '../dto/get-dispute-client-admin.dto'
import type { Prisma,} from '@prisma/client'
import { DisputeStatus, } from '@prisma/client'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { AdminDisputeResDto, } from '../dto/disputes-res.dto'

@Injectable()
export class AdminDisputeService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getDisputesAdmin(query: GetDisputeDto,): Promise<PagedResDto<GetDisputeClientAdminDto>> {
		const { filter, search, } = query

		const where: Prisma.ContractorDisputeWhereInput = this.getDisputeContractorFilterSearch(filter, search,)

		const disputes = await this.prisma.contractorDispute.findMany({
			where,
			include: {
				contractor: true,
			},
			take: query.take + 1,
			skip: query.skip,
		},)

		const total = await this.prisma.contractorDispute.count({
			where,
		},)

		return {
			data:    disputes.map((dispute,) => {
				return GetDisputeClientAdminDto.castContractor(dispute,)
			},),
			hasNext: total > query.skip + query.take,
		}
	}

	private getDisputeContractorFilterSearch(filter: GetDisputeDto['filter'], search: GetDisputeDto['search'],): Prisma.ContractorDisputeWhereInput {
		const where: Prisma.ContractorDisputeWhereInput = {
			contractor: {
				archived: false,
			},
			report: null,
		}

		if (filter) {
			if (filter.mark && Array.isArray(filter.mark,) && filter.mark.length > 0) {
				where.status = {
					in: filter.mark,
				}
			}

			if (filter.startDate && filter.endDate) {
				where.created_at = {
					gte: new Date(filter.startDate,),
					lte: new Date(filter.endDate,),
				}
			} else if (filter.startDate) {
				where.created_at = {
					gte: new Date(filter.startDate,),
				}
			} else if (filter.endDate) {
				where.created_at = {
					lte: new Date(filter.endDate,),
				}
			}
		}

		if (!filter?.showArchive || filter.showArchive === 'false') {
			where.archived = false
		}

		if (search) {
			where.OR = [
				{ contractor: { name: { contains: search, mode: 'insensitive', }, }, },
				{ contractor: { phone: { contains: search, mode: 'insensitive', }, }, },
				{ description: { contains: search, mode: 'insensitive', }, },
				{
					status: {
						in: Object.values(DisputeStatus,).filter((status,) => {
							return DisputeStatusToName[status].toLowerCase().includes(search.toLowerCase(),)
						},
						),
					},
				},
			]
		}

		return where
	}

	public async getDisputesAdminWithReport(query: PageOptionsDto, bookingId: string,): Promise<PagedResDto<AdminDisputeResDto>> {
		const where: Prisma.ContractorDisputeWhereInput = {
			bookingId,
			contractor: {
				archived: false,
			},
			NOT: {
				report: null,
			},
		}

		const disputes = await this.prisma.contractorDispute.findMany({
			where,
			include: {
				contractor: true,
				report:     true,
			},
			take: query.take + 1,
			skip: query.skip,
		},)

		return {
			data:    AdminDisputeResDto.castSingleArray(disputes.slice(0, query.take,),),
			hasNext: disputes.length > query.take,
		}
	}
}