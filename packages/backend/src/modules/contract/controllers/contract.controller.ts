/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Delete,
	Query,
	UseGuards,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common'
import { diskStorage, } from 'multer'
import { FileInterceptor, } from '@nestjs/platform-express'
import { Roles, } from 'src/shared/roles.decorator'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { GetContractsDto, } from '../dto/get-training.dto'
import { CreateContractDto, } from '../dto/create-contract.dto'
import { ChangeContractDto, } from '../dto/change-contract.dto'
import { ContractService, } from '../services/contract.service'
import type { ITrainingListReturn, } from '../contract.types'
import { ReqAdmin, } from 'src/shared/decorators/admin.decorator'
import { IRequestAdmin, } from 'src/modules/admin/admin.types'
import type { Contract, } from '@prisma/client'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('contract',)
export class ContractController {
	constructor(private readonly contractService: ContractService,) {}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@UseGuards(AdminAuthGuard,)
	@Get()
	public async getContracts(
		@Query() query: GetContractsDto,
	): Promise<Array<Contract>> {
		return this.contractService.getContracts(query.contractorId,)
	}

	@UseGuards(RolesGuard,)
	@Roles(2,)
	@UseGuards(AdminAuthGuard,)
	@Post()
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename:    (req, file, cb,) => {
					const filename = `${Date.now()}-${file.originalname}`
					cb(null, filename,)
				},
			},),
		},),
	)
	public async addContract(
		@ReqAdmin() reqAdmin: IRequestAdmin,
		@Body() body: CreateContractDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Contract> {
		return this.contractService.addContract({
			...body,
			file,
			adminId:    reqAdmin.id,
			created_at: new Date(),
			updated_at: new Date(),
		},)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@UseGuards(AdminAuthGuard,)
	@Patch(':id',)
	public async changeContract(
		@Param('id',) contractId: string,
		@Body() body: ChangeContractDto,
	): Promise<Contract> {
		return this.contractService.changeContract(contractId, body,)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@UseGuards(AdminAuthGuard,)
	@Delete(':id',)
	public async deleteContract(
		@Param('id',) trainingId: string,
	): Promise<void> {
		await this.contractService.deleteContract(trainingId,)
	}
}
