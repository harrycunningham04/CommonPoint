import { Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'

@Injectable()
export class SubbrandService {
	constructor(private readonly prisma: PrismaService,) {}

	async createSubbrand(data: { clientId: string; companyName: string },): Promise<any> {
		return this.prisma.subbrand.create({
			data: {
				companyName:   data.companyName,
				parentBrandId: data.clientId,
			},
		},)
	}

	async getSubbrandsByClientId(clientId: string,): Promise<any> {
		return this.prisma.subbrand.findMany({
			where:   { parentBrandId: clientId, },
			include: { offices: true, },
		},)
	}

	async updateSubbrand(subbrandId: string, data: Prisma.SubbrandUpdateInput,): Promise<any> {
		const { id, created_at, updated_at, offices, ...updateData } = data

		return this.prisma.subbrand.update({
			where: { id: subbrandId, },
			data:  updateData,
		},)
	}

	async deleteSubbrand(subbrandId: string,): Promise<any> {
		return this.prisma.subbrand.delete({
			where: { id: subbrandId, },
		},)
	}

	async addOfficeToSubbrand(subbrandId: string, officeData: Prisma.OfficeCreateInput,): Promise<any> {
		return this.prisma.office.create({
			data: {
				...officeData,
				Subbrand: { connect: { id: subbrandId, }, },
			},
		},)
	}

	async getOffices(subbrandId: string,): Promise<any> {
		return this.prisma.office.findMany({
			where: { subbrandId, },
		},)
	}

	async getPreferences(subbrandId: string,): Promise<Array<any>> {
		return []
	}

	async addPreference(subbrandId: string, data: Omit<Prisma.PreferenceCreateInput, 'subbrand'>,): Promise<any> {
		return null
	}

	async updatePreference(subbrandId: string, preferenceId: string, data: Partial<Prisma.PreferenceUpdateInput>,): Promise<any> {
		return this.prisma.preference.update({
			where: { id: preferenceId, },
			data,
		},)
	}

	async deletePreference(subbrandId: string, preferenceId: string,): Promise<any> {
		return this.prisma.preference.delete({
			where: { id: preferenceId, },
		},)
	}
}
