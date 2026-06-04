/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable complexity */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { DisputeStatus, type B2CClients, type ClientDispute, type ClientStatus, type Prisma, } from '@prisma/client'
import type { GetDisputeDto,} from '../dto/disputes.dto'
import { DisputeStatusToName, SortBy, SortDirection, } from '../dto/disputes.dto'
import type { CreateDisputeDto, } from '../dto/create-dispute.dto'
import { EClientType, } from 'src/shared/types/client.type'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { GetDisputeClientAdminDto, GetDisputeClientDetailDto, } from '../dto/get-dispute-client-admin.dto'

@Injectable()
export class ClientDisputeService {
	constructor(private readonly prisma: PrismaService,) {}

	private async checkClientType(clientId:string,) {
		const b2bClient =  await this.prisma.b2BClients.findUnique({
			where: {id: clientId,},
		},)

		if (b2bClient) {
			return EClientType.B2B
		}

		const b2cUser = await this.prisma.b2CClients.findUnique({
			where: {id: clientId,},
		},)

		if (b2cUser) {
			return EClientType.B2C
		}

		return EClientType.WORKER
	}

	private getDisputesFilterSearch(filter: GetDisputeDto['filter'], search: string,) : Prisma.ClientDisputeWhereInput {
		const where: Prisma.ClientDisputeWhereInput = {}

		if (search) {
			where.OR = [
				{ description: { contains: search, mode: 'insensitive', }, },
			]
		}

		if (filter) {
			if (filter.mark && Array.isArray(filter.mark,) && filter.mark.length > 0) {
				where.status = {
					in: filter.mark,
				}
			}

			if (filter.category && Array.isArray(filter.category,) && filter.category.length > 0) {
				where.category = {
					in: filter.category,
				}
			}

			if (filter.offices && Array.isArray(filter.offices,) && filter.offices.length > 0) {
				where.bookingGroup = {
					office: {
						is: {
							name: {
								in: filter.offices,
							},
						},
					},
				}
			}

			if (filter.startDate && filter.endDate) {
				where.created_at = {
					gte: new Date(filter.startDate,),
					lte: new Date(filter.endDate,),
				}
			}

			if (!filter.showArchive || filter.showArchive === 'false') {
				where.archived = false
			}
		}

		return where
	}

	public async getDisputes(query: GetDisputeDto,clientId:string,): Promise<{ disputes: Array<GetDisputeClientAdminDto>, total: number }> {
		const { filter, search, skip, take, } = query
		const userType = await this.checkClientType(clientId,)
		const startWhere : Prisma.ClientDisputeWhereInput = {
			...(userType === EClientType.B2B && { b2BClient: { id: clientId, }, }),
			...(userType === EClientType.B2C && { b2CClient: { id: clientId, }, }),
		}
		const where: Prisma.ClientDisputeWhereInput = {
			...startWhere,
		  }

		if (filter) {
			if (filter.mark && Array.isArray(filter.mark,) && filter.mark.length > 0) {
				where.status = {
					in: filter.mark,
				}
			}

			if (filter.category && Array.isArray(filter.category,) && filter.category.length > 0) {
				where.category = {
					in: filter.category,
				}
			}

			if (filter.offices && Array.isArray(filter.offices,) && filter.offices.length > 0) {
				where.bookingGroup = {
					office: {
						is: {
							name: {
								in: filter.offices,
							},
						},
					},
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

		// apply search
		if (search) {
			where.OR = [
				// {bookingGroup:  {address: {contains: search, mode: 'insensitive',},},},
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

		const orderBy: Array<Prisma.ClientDisputeOrderByWithRelationInput> = []

		if (filter?.sortBy === SortBy.ALPHABETIC) {
			orderBy.push(
				{ b2CClient: { firstName: filter.sortDirection || SortDirection.ASCENDING, }, },
				{ b2BClient: { firstName: filter.sortDirection || SortDirection.ASCENDING, }, },
			)
		} else if (filter?.sortBy === SortBy.DATE) {
			orderBy.push({ created_at: filter.sortDirection || SortDirection.ASCENDING, },)
		}

		const disputes = await this.prisma.clientDispute.findMany({
			where,
			orderBy,
			include: {
				bookingGroup: {
					include: {
						office: true,
					},
				},
				b2CClient:        true,
				b2BClient:        true,
				clientInvoiceB2B: true,
			},
			skip,
			take,
		},)

		const total = await this.prisma.clientDispute.count({
			where: startWhere,
		},)

		return {
			disputes: disputes.map((dispute,) => {
				return GetDisputeClientAdminDto.castClientPortal(dispute,)
			},),
			total,
		}
	}

	public async getAdminClientDisputes(
		query: GetDisputeDto,
	  ): Promise<PagedResDto<GetDisputeClientAdminDto>> {
		const { search, filter, skip, take, } = query

		const filterSortWhere: Prisma.ClientDisputeWhereInput = this.getDisputesFilterSearch(
		  filter,
		  search ?? '',
		)

		const where: Prisma.ClientDisputeWhereInput = {
			...filterSortWhere,
			OR: [
				{ b2BClientId: {not: null,}, },
				{ b2CClientId: {not: null,}, },
			],
		}

		const disputes = await this.prisma.clientDispute.findMany({
		  where,
		  include: {
				b2CClient:          true,
				b2BClient:          true,
				editRequests:       true,
				editRequestSession: true,
		  },
		  skip,
		  take,
		},)

		const total = await this.prisma.clientDispute.count({where,},)

		return {
		  data:    disputes.map((dispute,) => {
				return GetDisputeClientAdminDto.cast(dispute,)
			},),
		  hasNext: total > query.skip + query.take,
		}
	  }

	public async getClientDisputeDetail(id: string,):Promise<GetDisputeClientDetailDto> {
		const dispute = await this.prisma.clientDispute.findUnique({
			where:   { id, },
			include: {
				bookingGroup: {
					include: {
						bookings: true,
						office:   true,
					},
				},
				b2CClient:          true,
				b2BClient:          true,
				editRequests:       true,
				editRequestSession: true,
			},
		},)

		if (!dispute) {
			throw new NotFoundException('Dispute not found',)
		}

		return GetDisputeClientDetailDto.cast(dispute,)
	}

	public async updateDispute(disputeId: string, data: Prisma.ClientDisputeUpdateInput,):Promise<ClientDispute> {
		const dispute = await this.prisma.clientDispute.update({
			where: {
				id: disputeId,
			},
			data,
		},)

		return dispute
	}

	public async createClientDispute(data: CreateDisputeDto,) {
		const { b2BClientId, b2CClientId, clientInvoiceB2BId, bookingGroupId, ...rest } = data

		const connections: Prisma.ClientDisputeCreateInput = {}

		if (b2BClientId) {
		  connections.b2BClient = {
				connect: { id: b2BClientId,  },
		  }
		}

		if (b2CClientId) {
		  connections.b2CClient = {
				connect: { id: b2CClientId,  },
		  }
		}

		if (clientInvoiceB2BId) {
		  connections.clientInvoiceB2B = {
				connect: { id: clientInvoiceB2BId,  },
		  }
		}

		if (bookingGroupId) {
		  connections.bookingGroup = {
				connect: { id: bookingGroupId,  },
		  }
		}

		const newDispute = await this.prisma.clientDispute.create({
		  data: {
				...rest,
				...connections,
		  },
		},)

		return newDispute
	  }
}