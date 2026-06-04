/* eslint-disable complexity */
import { Injectable, BadRequestException, forwardRef, Inject, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { CryptoService, } from '../../crypto/crypto.service'
import { MailService, } from '../../mail/mail.service'
import { ProductService, } from '../../products/products/products.service'
import { ClientStatus,} from '@prisma/client'
import type { B2CClients, Prisma, Preference, } from '@prisma/client'
import type { ClientsDto, ChangeClientDto, ChangePasswordDto, IB2CClientListReturn, } from '../dto/b2c.dto'
import { SortBy, SortDirection, } from '../dto/b2c.dto'
import { text, } from 'src/shared/text/en'
import { B2CClientResponseDto, } from '../dto/b2c-client-response.dto'
import { Template, templateDictionary } from 'src/modules/mail/types/template.enum'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ClientsB2CService {
	constructor(
        private readonly prisma: PrismaService,
        private readonly cryptoService: CryptoService,
        private readonly mailService: MailService,
				@Inject(forwardRef(() => {
					return ProductService
				},),)
        private readonly productService: ProductService,
		private readonly configService: ConfigService,
	) {}

	private buildB2CSearchConditions(search: string,): Prisma.B2CClientsWhereInput['OR'] {
		const searchConditions: Prisma.B2CClientsWhereInput['OR'] = [
			{ firstName: { contains: search, mode: 'insensitive', }, },
			{ lastName: { contains: search, mode: 'insensitive', }, },
			{ address: { contains: search, mode: 'insensitive', }, },
			{ phoneNumber: { contains: search, mode: 'insensitive', }, },
			{ email: { contains: search, mode: 'insensitive', }, },
			{ postCode: { contains: search, mode: 'insensitive', }, },
		]

		const searchTerms = search.trim().split(/\s+/,)
		if (searchTerms.length >= 2) {
			const firstName = searchTerms[0]
			const lastName = searchTerms[searchTerms.length - 1]

			searchConditions.push({
				AND: [
					{ firstName: { contains: firstName, mode: 'insensitive', }, },
					{ lastName: { contains: lastName, mode: 'insensitive', }, },
				],
			},)

			searchConditions.push({
				AND: [
					{ firstName: { contains: lastName, mode: 'insensitive', }, },
					{ lastName: { contains: firstName, mode: 'insensitive', }, },
				],
			},)
		}

		return searchConditions
	}

	public async get(query: ClientsDto,): Promise<IB2CClientListReturn> {
		const { filter, search, skip, take,  } = query

		const where: Prisma.B2CClientsWhereInput = {
			archived: false,
		}

		if (filter) {
			if (filter.postCode) {
				where.postCode = filter.postCode
			}

			if (filter.mark) {
				where.mark = Array.isArray(filter.mark,) ?
					{ in: filter.mark, } :
					(filter.mark as ClientStatus)
			}

			if (filter.showArchived) {
				where.archived = undefined
			}
		}

		if (search) {
			where.OR = [
				...(where.OR ?? []),
				...this.buildB2CSearchConditions(search,)!,
			]
		}

		const orderBy: Array<Prisma.B2CClientsOrderByWithRelationInput> = []

		if (filter?.sortBy === SortBy.ALPHABETIC) {
			orderBy.push(
				{ firstName: filter.sortDirection ?? SortDirection.ASC, },
				{ lastName: filter.sortDirection ?? SortDirection.ASC, },
			)
		} else if (filter?.sortBy === SortBy.MARK) {
			orderBy.push({ mark: filter.sortDirection ?? SortDirection.ASC, },)
		}

		const [clients, totalCount,] = await Promise.all([
			this.prisma.b2CClients.findMany({
				where,
				orderBy,
				skip,
				take,
			},),
			this.prisma.b2CClients.count({ where, },),
		],)

		return {
			clients: clients.map((client,) => {
				return B2CClientResponseDto.cast(client,)
			},),
			maxPage: Math.max(1, Math.ceil(totalCount / take,),),
		}
	}

	public async getClientById(id: string,): Promise<B2CClientResponseDto | null> {
		const client = await this.prisma.b2CClients.findUnique({
			where: { id, },
		},)

		if (!client) {
			return null
		}

		return B2CClientResponseDto.cast(client,)
	}

	public async addClient(data: Prisma.B2CClientsCreateInput & { specialPrices?: Record<string, number> },): Promise<B2CClients> {
		const isExist = await this.prisma.b2CClients.findFirst({
			where: {
				email: data.email,
			},
		},)

		if (isExist) {
			throw new BadRequestException('Email already in use',)
		}

		const generatedPassword = this.cryptoService.generateRandomPassword(12,)
		const hashedPassword = await this.cryptoService.hashString(generatedPassword,)

		const { ...rest} = data
		// create the new client
		const newClient = await this.prisma.b2CClients.create({
			data: {
				...rest,
				password: hashedPassword,
			},
		},)

		// set special prices if they exist
		if (data.specialPrices) {
			for (const [productTypeId, price,] of Object.entries(data.specialPrices,)) {
				await this.productService.setSpecialPrice(newClient.id, 'B2C', productTypeId, price,)
			}
		}

		await this.mailService.sendEmailWithTemplate(Template.BASIC, {
			clickLondonUrl:       `${this.configService.getOrThrow('CLIENT_REDIRECT_URL',)}/sign-in` ,
			email:                newClient.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].message,
			password:             generatedPassword,
		}, {
			to:      newClient.email,
			subject: 'Client Account Created',
		},)

		return newClient
	}

	public async getUniquePostCodes(): Promise<Array<string>> {
		const clients = await this.prisma.b2CClients.findMany({
			select:   { postCode: true, },
			distinct: ['postCode',],
			where:    {
				postCode: {
					not: null,
				},
			},
		},)

		return clients.map((client,) => {
			return client.postCode
		},) as Array<string>
	}

	public async updateB2C(clientId: string, data: ChangeClientDto,): Promise<B2CClientResponseDto> {
		const updatedClient = await this.prisma.b2CClients.update({
			where: { id: clientId, },
			data,
		},)

		return B2CClientResponseDto.cast(updatedClient,)
	}

	public async getPreferences(clientId: string,): Promise<Array<Preference>> {
		return this.prisma.preference.findMany({
			where: { clientsB2C: { some: { clientId, }, }, },
		},)
	}

	public async updatePreferences(preferenceId: string, preferencesData: Partial<Preference>,): Promise<Preference> {
		return this.prisma.preference.update({
			where: { id: preferenceId, },
			data:  preferencesData,
		},)
	}

	public async addPreference(clientId: string, preferencesData: Omit<Preference, 'id'>,): Promise<Preference | null> {
		const clientExists = await this.prisma.b2CClients.findUnique({
			where: { id: clientId, },
		},)

		if (!clientExists) {
			throw new Error('B2C Client does not exist.',)
		}

		return null
	}

	public async deletePreference(preferenceId: string,): Promise<Preference> {
		return this.prisma.preference.delete({
			where: { id: preferenceId, },
		},)
	}

	public async changePassword(id:string,dto:ChangePasswordDto,) : Promise<void> {
		const {newPassword,oldPassword,} = dto

		const client = await this.prisma.b2CClients.findFirst({where: {id,},},)

		if (!client) {
			throw new BadRequestException(text.userNotExist,)
		}

		const same = await this.cryptoService.comparePasswords(oldPassword, client.password,)

		if (!same) {
			throw new BadRequestException(text.samePassword,)
		}

		const newHashedPassword = await this.cryptoService.hashString(newPassword,)

		await this.prisma.b2CClients.update({
			where: {
				id,
			},
			data: {
				password: newHashedPassword,
			},
		},)
	}

	public async checkClientById(clientId: string,): Promise<boolean> {
		const client = await this.prisma.b2CClients.findUnique({
			where:  { id: clientId, },
			select: {
				id: true,
			},
		},)

		return Boolean(client,)
	}

	public async getIsPriorityClient(clientId?: string,): Promise<boolean> {
		if (!clientId) {
			return false
		}

		const client = await this.prisma.b2CClients.findUnique({
			where:  { id: clientId, },
			select: { mark: true, },
		},)
		return Boolean(client?.mark === ClientStatus.PRIORITIZED,)
	}

	public async getClientByEmail(email: string,): Promise<B2CClients | null> {
		return this.prisma.b2CClients.findUnique({
			where: { email, },
		},)
	}
}
