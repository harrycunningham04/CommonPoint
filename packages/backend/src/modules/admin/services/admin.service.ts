import { BadRequestException, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { MailService, } from '../../mail/mail.service'
import { ConfigService, } from '@nestjs/config'
import type { Admin, Prisma, } from '@prisma/client'
import { CryptoService, } from '../../crypto/crypto.service'
import { text, } from '../../../shared/text/en'
import type { ChangePasswordDto, FilterDto, GetAdminsDto, } from '../dto'
import type { IAdminAvailableFilter, IAdminListReturn,} from '../admin.types'
import { EAccessType, } from '../admin.types'
import { adminRoleAccessMap, } from 'src/shared/utils/admin-role-access-map.util'
import type { Message, } from 'src/shared/types'
import { Template, templateDictionary, } from 'src/modules/mail/types/template.enum'

@Injectable()
export class AdminService {
	private readonly packagesCode: string

	private readonly couponsCode: string

	private readonly salesStatisticCode: string

	constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
	) {
		this.packagesCode = this.configService.get<string>('PACKAGES_CODE',)!
		this.couponsCode = this.configService.get<string>('COUPONS_CODE',)!
		this.salesStatisticCode = this.configService.get<string>('SALES_STATISTIC_CODE',)!
		this.initiateSuperAdminAccount()
	}

	public async initiateSuperAdminAccount(): Promise<void> {
		const email = this.configService.get('SUPER_ADMIN_EMAIL',)
		const adminPassword = this.configService.get('SUPER_ADMIN_PASSWORD',)
		const exist = await this.prisma.admin.findUnique({
			where: { email, },
		},)

		const password = await this.cryptoService.hashString(adminPassword,)

		if (!exist) {
			await this.prisma.admin.create({
				data: {
					email,
					password,
					name:    'Admin',
					surname: 'Super',
					role:    'Head of Contractors, Head of Ops',
					access:  2,
				},
			},)
		}
	}

	public async getAdminById(id: string,): Promise<Admin | null> {
		return this.prisma.admin.findUnique({ where: { id, }, },)
	}

	public async validateAdmin(email: string, password: string,): Promise<Admin> {
		const admin = await this.prisma.admin.findUnique({ where: { email, }, },)

		if (!admin?.password) {
			throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
		}

		const passwordValid = await this.cryptoService.comparePasswords(password, admin.password,)

		if (!passwordValid) {
			throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
		}

		return admin
	}

	public async changePasswordByAdminId(userId: string, newPassword: string,): Promise<Admin> {
		const password = await this.cryptoService.hashString(newPassword,)

		const admin = await this.prisma.admin.findUnique({ where: { id: userId, }, },)

		if (!admin) {
			throw new BadRequestException(text.userNotExist,)
		}

		const same = await this.cryptoService.comparePasswords(admin.password ?? '', newPassword,)

		if (same) {
			throw new BadRequestException(text.newPasswordSameAsOld,)
		}

		return this.prisma.admin.update({
			where: {
				id: userId,
			},
			data: {
				password,
			},
		},)
	}

	public async addAdmin(data: Prisma.AdminCreateInput,): Promise<Admin> {
		const isExist = await this.prisma.admin.findFirst({
			where: {
				email: data.email,
			},
		},)
		if (isExist) {
			throw new BadRequestException('Email already in use',)
		}

		const generatedPassword = this.cryptoService.generateRandomPassword(12,)

		const password = await this.cryptoService.hashString(generatedPassword,)

		const newAdmin = await this.prisma.admin.create({
			data: {
				...data,
				access: adminRoleAccessMap(data.role,),
				password,
			},
		},)

		await this.mailService.sendEmailWithTemplate(Template.BASIC, {
			clickLondonUrl:       `${this.configService.getOrThrow('FRONTEND_REDIRECT_URL',)}/login` ,
			email:                newAdmin.email,
			unsubscribeUrl:       '',
			managePreferencesUrl: '',
			message:              templateDictionary[Template.BASIC].message,
			password:             generatedPassword,
		}, {
			to:      newAdmin.email,
			subject: 'Admin Credentials',
		},)

		return newAdmin
	}

	public async avaliableAdminFilters(): Promise<IAdminAvailableFilter> {
		const roles = (await this.prisma.admin.groupBy({ by: 'role', },)).map((it,) => {
			return it.role
		},)
		const access = (await this.prisma.admin.groupBy({ by: 'access', },)).map((it,) => {
			return it.access
		},)
		return { roles, access, }
	}

	public getAdminFilterWhere(filter: FilterDto | undefined,): Prisma.AdminWhereInput {
		const filterWhere: Prisma.AdminWhereInput = {}

		if (filter) {
			const { role, access, archived, } = filter
			if (role) {
				Object.assign(filterWhere, {
					role: {
						in: role,
					},
				},)
			}
			if (access) {
				const numberedAccess = access.map((it,) => {
					return Number.parseInt(it, 10,)
				},)
				Object.assign(filterWhere, {
					access: {
						in: numberedAccess,
					},
				},)
			}
			if (archived) {
				const booleanArchived = archived === 'true'

				if (!booleanArchived) {
					Object.assign(filterWhere, {
						archived: {
							not: !booleanArchived,
						},
					},)
				}
			}
		}

		return filterWhere
	}

	public async filteredAdmins(data: GetAdminsDto,): Promise<IAdminListReturn> {
		const { page, limit, search = '', filter, } = data // default to an empty string if search is undefined
		const numberedPage = Number.parseInt(page, 10,)
		const numberedLimit = Number.parseInt(limit, 10,)
		const skip = (numberedPage - 1) * numberedLimit

		const filterWhere = this.getAdminFilterWhere(filter,)

		const searchNumber = parseInt(search, 10,)
		const where: Prisma.AdminWhereInput = {
			AND: [
				filterWhere,
				{
					OR: [
						{
							name: {
								contains: search,
								mode:     'insensitive',
							},
						},
						{
							surname: {
								contains: search,
								mode:     'insensitive',
							},
						},
						{
							email: {
								contains: search,
								mode:     'insensitive',
							},
						},
						{
							phone: {
								contains: search,
								mode:     'insensitive',
							},
						},
						{
							address: {
								contains: search,
								mode:     'insensitive',
							},
						},
						{
							role: {
								contains: search,
								mode:     'insensitive',
							},
						},
						{
							access: {
								equals: isNaN(searchNumber,) ?
									undefined :
									searchNumber,
							},
						},
					],
				},
			],
		}
		let orderBy: Prisma.AdminOrderByWithRelationInput = {}

		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = {
					name: filter.sortDirection! as Prisma.SortOrder,
				}
			} else {
				orderBy = {
					[filter.sortBy]: filter.sortDirection! as Prisma.SortOrder,
				}
			}
		}

		const admins = await this.prisma.admin.findMany({
			where,
			orderBy,
			skip,
			take: numberedLimit,
		},)

		const totalCount = await this.prisma.admin.count({
			where,
		},)

		const maxPage = Math.ceil(totalCount / numberedLimit,)

		return {
			admins,
			maxPage: maxPage === 0 ?
				1 :
				maxPage,
		}
	}

	public async changeAdmin(id: string, data: Prisma.AdminUpdateInput,): Promise<Admin> {
		if (data.archived !== undefined) {
			data.archivedAt = data.archived ?
				new Date() :
				null
		}
		const admin = await this.prisma.admin.update({
			where: {
				id,
			},
			data,
		},)

		return admin
	}

	public async changePassword(id: string, dto: ChangePasswordDto,): Promise<Message> {
		const { newPassword, oldPassword, } = dto
		const admin = await this.getAdminById(id,)

		if (!admin) {
			throw new BadRequestException(text.userNotExist,)
		}

		const same = await this.cryptoService.comparePasswords(oldPassword, admin.password ?? '',)

		if (!same) {
			throw new BadRequestException(text.wrongPassword,)
		}

		const newHashedPassword = await this.cryptoService.hashString(newPassword,)

		await this.prisma.admin.update({
			where: {
				id,
			},
			data: {
				password: newHashedPassword,
			},
		},)

		return { message: 'Password changed', }
	}

	public async checkAccess(email: string, password: string, type: EAccessType,): Promise<{ access: boolean }> {
		const admin = await this.prisma.admin.findUnique({ where: { email, }, },)

		if (!admin) {
			throw new BadRequestException(text.emailOrPasswordIsIncorrect,)
		}

		const access = (type === EAccessType.PACKAGE && password === this.packagesCode) || (type === EAccessType.COUPON && password === this.couponsCode) || (type === EAccessType.SALES_STATISTIC && password === this.salesStatisticCode)

		return { access, }
	}

	public async getFirstAdminId(): Promise<string> {
		const admin = await this.prisma.admin.findFirst({
			select: {
				id: true,
			},
		},)

		if (!admin) {
			throw new BadRequestException(text.userNotExist,)
		}

		return admin.id
	}

	public async isOldPasswordSame(adminId:string , newPassword:string,): Promise<boolean> {
		const admin = await this.prisma.admin.findUnique({ where: { id: adminId, }, },)

		if (!admin) {
			throw new BadRequestException(text.userNotExist,)
		}

		const same = await this.cryptoService.comparePasswords(admin.password ?? '', newPassword,)

		return same
	}
}
