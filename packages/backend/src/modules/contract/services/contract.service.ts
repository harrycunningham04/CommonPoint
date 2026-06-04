import { Injectable, } from '@nestjs/common'
import type { Contract, Prisma, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import * as path from 'path'
import type {
	ContractCreateInput,
} from '../contract.types'
import { UploadService, } from 'src/modules/upload/upload.service'

@Injectable()
export class ContractService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
	) {}

	public async addContract(data: ContractCreateInput,): Promise<Contract> {
		const {file,} = data
		const filePath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'..',
			'..',
			'uploads',
			file.filename,
		)
		const uploadedFile = await this.uploadService.uploadLocalFileToS3(
			filePath,
			file.originalname,
		)

		const newContract = await this.prisma.contract.create({
			data: {
				name:          data.name,
				admin_id:      data.adminId,
				file:          uploadedFile.url,
				start_date:    new Date(),
				end_date:      new Date(),
				contractor_id: data.contractorId,
			},
		},)

		return newContract
	}

	public async getContracts(
		contractorId: string,
	): Promise<Array<Contract>> {
		const contracts = await this.prisma.contract.findMany({
			where: {
				contractor_id: contractorId,
			},
		},)

		return contracts
	}

	public async changeContract(
		id: string,
		data: Prisma.ContractUpdateInput,
	): Promise<Contract> {
		const { file, } = data
		if (file) {
			// if file is url just update, else upload and update
		}
		const contract = await this.prisma.contract.update({
			where: {
				id,
			},
			data,
		},)

		return contract
	}

	public async deleteContract(id: string,): Promise<void> {
		await this.prisma.contract.delete({
			where: { id, },
		},)
	}
}
