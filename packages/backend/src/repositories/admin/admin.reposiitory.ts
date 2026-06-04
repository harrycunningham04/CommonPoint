import { PrismaService, } from 'nestjs-prisma'

import { Injectable, } from '@nestjs/common'
import type { Admin, Prisma,} from '@prisma/client'

@Injectable()
export class AdminRepository {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async findById(id: string,): Promise<Admin | null> {
		return this.prismaService.admin.findUnique({
			where: {
				id,
			},
		},)
	}

	public async findByEmail(email: string,): Promise<Admin | null> {
		return this.prismaService.admin.findUnique({
			where: {
				email,
			},
		},)
	}

	public async updatePasswordById(id: string, password: string,): Promise<Admin> {
		return this.prismaService.admin.update({
			where: {
				id,
			},
			data: {
				password,
			},
		},)
	}

	public async updateById(id: string, data: Prisma.AdminUpdateInput,): Promise<Admin> {
		return this.prismaService.admin.update({
			where: {
				id,
			},
			data,
		},)
	}

	public async createAdmin(data: Prisma.AdminCreateInput,): Promise<Admin> {
		return this.prismaService.$transaction(async(tx,) => {
			const newUser = await tx.admin.create({
				data,
			},)

			return newUser
		},)
	}

	public async addAdmin(data: Prisma.AdminCreateInput,): Promise<Admin> {
		return this.prismaService.admin.create({
			data,
		},)
	}

	public async getAllUsers(): Promise<Array<Admin>> {
		return this.prismaService.admin.findMany()
	}
}
