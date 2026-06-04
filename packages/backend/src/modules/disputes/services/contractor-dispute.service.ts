/* eslint-disable complexity */
/* eslint-disable no-underscore-dangle */
import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { DisputeStatus, type Prisma, } from '@prisma/client'
import { type GetDisputeDto, DisputeStatusToName, } from '../dto/disputes.dto'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { DisputeResDto, } from '../dto/disputes-res.dto'
import type { PagedDisputesByAddressDto, } from '../dto/paged-by-address.dto'
import type { CreateContractorDisputeDto, } from '../dto/create-contractor-dispute.dto'
import type { CreateReportDto, } from '../dto/report.dto'
import type { IDisputeRes, } from '../disputes.type'
import { GetDisputeClientDetailDto, } from '../dto/get-dispute-client-admin.dto'

@Injectable()
export class ContractorDisputeService {
	constructor(private readonly prisma: PrismaService,) { }

	public async getDisputes(query: GetDisputeDto, contractorId: string,) {
		const { filter, search, } = query
		const where: Prisma.ContractorDisputeWhereInput = {
			contractor: { id: contractorId, },
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

		const disputes = await this.prisma.contractorDispute.findMany({
			where,
			include: {
				Booking: {
					include: {
						b2CClients: true,
						b2BClients: {
							include: {
								offices: true,
							},
						},
						contractor: true,
					},
				},
				contractor:        true,
				contractorInvoice: true,
				report:            true,
			},
		},)

		const total = await this.prisma.contractorDispute.count({
			where,
		},)

		return {
			data:    disputes,
			hasNext: total > query.skip + query.take,
		}
	}

	public async getDisputeDetails(id: string,): Promise<GetDisputeClientDetailDto> {
		const dispute = await this.prisma.contractorDispute.findUnique({
			where:   { id, },
			include: {
				Booking:    true,
				contractor: true,
			},
		},)

		if (!dispute) {
			throw new NotFoundException('Dispute not found',)
		}

		return GetDisputeClientDetailDto.castContractor(dispute,)
	}

	public async updateDispute(disputeId: string, data: Prisma.ContractorDisputeUpdateInput,): Promise<IDisputeRes> {
		const dispute = await this.prisma.contractorDispute.update({
			where: {
				id: disputeId,
			},
			data,
			include: {
				report: true,
			},
		},)

		return dispute
	}

	public async getManyByAddress(userId: string,data: PagedDisputesByAddressDto,): Promise<PagedResDto<DisputeResDto>> {
		const fetchedDisputes = await this.prisma.contractorDispute.findMany({
			where: {
				contractor_id: userId,
				address:       data.address,
			},
			take:    data.take + 1,
			skip:    data.skip,
			include: {
				report: true,
			},
			orderBy: {
				created_at: 'desc',
			},
		},)

		const disputes = fetchedDisputes.slice(0, data.take,)

		return {
			hasNext: fetchedDisputes.length > data.take,
			data:    DisputeResDto.castSingleArray(disputes,),
		}
	}

	private async getManyByAddresses(userId: string,addresses: Array<string>,): Promise<Array<IDisputeRes>> {
		const disputes = await this.prisma.contractorDispute.findMany({
			where: {
				contractor_id: userId,
				address:       {
					in: addresses,
				},
			},
			include: {
				report: true,
			},
		},)

		return disputes
	}

	public async getGroupedDisputes(userId: string, paginator: PageOptionsDto,): Promise<PagedResDto<DisputeResDto>> {
		const where: Prisma.ContractorDisputeWhereInput =  {
			contractor_id: userId,
		}
		const allDisputes = await this.prisma.contractorDispute.groupBy({
			where,
			by:     ['address',],
			_count: {
				id: true,
			},
			_max:   {
				created_at: true,
			},
			orderBy: {
				_max: {
					created_at: 'desc',
				},
			},
			take: paginator.take + 1,
			skip: paginator.skip,
		},
		)

		const disputes = allDisputes.slice(0, paginator.take,)

		const addressesWithManyResult = disputes.filter((dispute,) => {
			return dispute._count.id === 1
		},).map((dispute,) => {
			return dispute.address
		},)

		const disputesWithManyResult = await this.getManyByAddresses(userId, addressesWithManyResult,)

		return {
			hasNext: allDisputes.length > paginator.take,
			data: 	  DisputeResDto.castGroupedArray(disputesWithManyResult, disputes,),
		}
	}

	public async createDispute(userId: string, data: CreateContractorDisputeDto,): Promise<IDisputeRes> {
		const booking = await this.prisma.booking.findUnique({
			where: {
				id: data.bookingId,
			},
			select: {
				id:      true,
				address: true,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const dispute = await this.prisma.contractorDispute.create({
			data: {
				contractor:    {
					connect: {
						id: userId,
					},
				},
				Booking: {
					connect: {
						id: booking.id,
					},
				},
				address: booking.address ?? '',
				...(data.contractorInvoiceId && {
					contractorInvoice: {
						connect: {
							id: data.contractorInvoiceId,
						},
					},
				}),
				description: data.description,
				theme:       data.theme,
				category:    data.category,
				status:      data.status,
			},
			include: {
				report: true,
			},
		},)

		return dispute
	}

	public async createReport(userId: string, data: CreateReportDto,): Promise<IDisputeRes | null> {
		const dispute = await this.createDispute(userId, data,)

		await this.prisma.report.create({
			data: {
				contractorDispute: {
					connect: {
						id: dispute.id,
					},
				},
				type:           data.type,
				location:       data.location,
				problem:        data.problem,
				solution:       data.solution,
				attachments:    data.attachments,
				isCancellation: data.isCancellation,
			},
		},)

		return this.prisma.contractorDispute.findUnique({
			where: {
				id: dispute.id,
			},
			include: {
				report: true,
			},
		},)
	}
}
