import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { ClientType, } from '../types/client.types'
import { B2BClientResponseDto, B2bClientSelectResponseDto, } from '../dto/b2b-client-response.dto'
import { B2CClientResponseDto, } from '../dto/b2c-client-response.dto'
import type { ICheckEmailIsTakenResponse, } from '../types/client-basic.types'

@Injectable()
export class ClientBasicService {
	constructor(
        private readonly prisma: PrismaService,
	) {}

	public async getClientTypeById(id: string,): Promise<ClientType | null> {
		const isB2B = await this.prisma.b2BClients.findFirst({ where: { id, }, select: { id: true, }, },)
		if (isB2B) {
			return ClientType.B2B
		}

		const isB2C = await this.prisma.b2CClients.findFirst({ where: { id, }, select: { id: true, }, },)
		if (isB2C) {
			return ClientType.B2C
		}

		const isWorker = await this.prisma.worker.findFirst({ where: { id, }, select: { id: true, }, },)
		if (isWorker) {
			return ClientType.WORKER
		}

		return null
	}

	public async getClientById(id: string,): Promise<B2BClientResponseDto | B2CClientResponseDto | null> {
		const clientType = await this.getClientTypeById(id,)

		if (clientType === ClientType.B2B) {
			const client = await this.prisma.b2BClients.findUnique({
				where: { id, },
			},)

			if (!client) {
				return null
			}

			return B2BClientResponseDto.cast(client,)
		}

		if (clientType === ClientType.B2C) {
			const client = await this.prisma.b2CClients.findUnique({
				where: { id, },
			},)

			if (!client) {
				return null
			}

			return B2CClientResponseDto.cast(client,)
		}

		throw new NotFoundException('Client not found',)
	}

	public async checkIfEmailIsTaken(email: string,): Promise<ICheckEmailIsTakenResponse> {
		const [b2cUser, b2bUser, office, worker,] = await Promise.all([
			this.prisma.b2CClients.findFirst({ where: { email, }, },),
			this.prisma.b2BClients.findFirst({ where: { email, }, },),
			this.prisma.office.findFirst({ where: { email, }, },),
			this.prisma.worker.findFirst({ where: { email, }, },),
		],)

		const isTaken = Boolean(b2cUser ?? b2bUser ?? office ?? worker,) && email !== 'ropotyn326@gmail.com'

		return {
			isTaken,
		}
	}

	public async getB2bClientsSelect(): Promise<Array<B2bClientSelectResponseDto>> {
		const clients = await this.prisma.b2BClients.findMany({
			select: {
				id:          true,
				firstName:   true,
				lastName:    true,
				companyName: true,
			},
		},)

		return clients.map((client,) => {
			return new B2bClientSelectResponseDto({
				id:          client.id,
				fullName:    `${client.firstName} ${client.lastName}`,
				companyName: client.companyName ?? '',
			},)
		},)
	}
}
