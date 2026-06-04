/* eslint-disable no-mixed-spaces-and-tabs */
import { AdminContractorService, } from '../services/admin-contractor.service'
import type { SkillsAndCertificationsResDto, } from '../dto/skills-and-certifications.dto'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import type { GetAdjustmentFeeDto, } from '../dto/adjustment-fee.dto'
import { CreateAdjustmentFeeDto,  GetAdjustmentFeeQuery,} from '../dto/adjustment-fee.dto'
import { CreateEquipmentDto, } from '../dto/equipment.dto'
import type { Equipment, } from '@prisma/client'
import type { ContractorTrainingResponseDto, } from '../dto/contractor-training-response.dto'

@Controller('admin/contractor',)
@UseGuards(RolesGuard,)
@Roles(2,)
@UseGuards(AdminAuthGuard,)
export class AdminContractorController {
	constructor(private readonly adminContractorService: AdminContractorService,) {}

  @Get(':contractorId/certifications-and-insurances',)
	public async getContractorCertificationsAndInsurances(@Param('contractorId',) contractorId: string,): Promise<SkillsAndCertificationsResDto> {
		return this.adminContractorService.getContractorCertificationsAndInsurances(contractorId,)
	}

  @Get('contractor-trainings/:contractorId',)
  public async getContractorTrainings(@Param('contractorId',) contractorId: string,): Promise<Array<ContractorTrainingResponseDto>> {
  	return this.adminContractorService.getContractorTrainings(contractorId,)
  }

  @Delete('contractor-trainings/:trainingId/contractor/:contractorId',)
  public async deleteContractorTraining(@Param('trainingId',) trainingId: string, @Param('contractorId',) contractorId: string,): Promise<void> {
  	return this.adminContractorService.deleteContractorTraining(contractorId, trainingId,)
  }

  @Delete('certifications-and-insurances/:documentId',)
  public async deleteSpecificDocument(@Param('documentId',) documentId: string,): Promise<void> {
  	return this.adminContractorService.deleteSpecificDocument(documentId,)
  }

  @Get('adjustment-fee/:contractorId',)
  public async getAdjustmentFees(@Param('contractorId',) contractorId: string, @Query() query: GetAdjustmentFeeQuery,): Promise<Array<GetAdjustmentFeeDto>> {
  	return this.adminContractorService.getAdjustmentFees(contractorId, query,)
  }

  @Post('adjustment-fee',)
  public async createAdjustmentFee(@Body() body: CreateAdjustmentFeeDto,): Promise<void> {
  	return this.adminContractorService.createAdjustmentFee(body,)
  }

  @Post('equipment/:contractorId',)
  public async createEquipment(@Param('contractorId',) contractorId: string, @Body() body: CreateEquipmentDto,): Promise<Equipment> {
  	return this.adminContractorService.createEquipment(contractorId, body,)
  }

  @Delete('equipment/:equipmentId',)
  public async deleteEquipment(@Param('equipmentId',) equipmentId: string,): Promise<void> {
  	return this.adminContractorService.deleteEquipment(equipmentId,)
  }
}
