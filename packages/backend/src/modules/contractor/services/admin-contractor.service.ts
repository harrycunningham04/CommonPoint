import { BasicContractorService, } from './basic-contractor.service'
import type { SkillsAndCertificationsResDto, } from '../dto/skills-and-certifications.dto'
import { PrismaService, } from 'nestjs-prisma'
import { forwardRef, Inject, } from '@nestjs/common'
import { GetAdjustmentFeeDto,} from '../dto/adjustment-fee.dto'
import type { CreateAdjustmentFeeDto, GetAdjustmentFeeQuery, } from '../dto/adjustment-fee.dto'
import type { CreateEquipmentDto, } from '../dto/equipment.dto'
import { ContractorTrainingResponseDto,} from '../dto/contractor-training-response.dto'
import { AdjustmentFeeStatus, type Equipment, } from '@prisma/client'

export class AdminContractorService {
	constructor(
    private readonly prisma: PrismaService,
		@Inject(forwardRef(() => {
			return BasicContractorService
		},),)
    private readonly basicContractorService: BasicContractorService,
	) {}

	public async getContractorCertificationsAndInsurances(contractorId: string,): Promise<SkillsAndCertificationsResDto> {
		return this.basicContractorService.getSkillsAndCertifications(contractorId,)
	}

	public async deleteSpecificDocument(documentId: string,): Promise<void> {
		await this.prisma.specificDocuments.delete({ where: { id: documentId, }, },)
	}

	public async createAdjustmentFee(body: CreateAdjustmentFeeDto,): Promise<void> {
		await this.prisma.adjustmentFee.create({ data: {
			contractorId: body.contractorId,
			bookingId:    body.bookingId,
			type:         body.type,
			amount:       body.amount,
		}, },)
	}

	public async getAdjustmentFees(contractorId: string, query: GetAdjustmentFeeQuery,): Promise<Array<GetAdjustmentFeeDto>> {
		const { onlyUnpaid, } = query
		const fees = await this.prisma.adjustmentFee.findMany({
			where:   {
				contractorId,
				status: onlyUnpaid ?
					AdjustmentFeeStatus.PENDING :
					undefined,
			},
			include: { booking: {
				select: {
					id:      true,
					address: true,
				},
			}, }, },)

		return fees.map((fee,) => {
			return new GetAdjustmentFeeDto({
				id:           fee.id,
				bookingId:    fee.bookingId,
				type:         fee.type,
				amount:       fee.amount,
				dateTime:     fee.createdAt,
				jobAddress:   fee.booking.address ?? '',
			},)
		},)
	}

	public async createEquipment(contractorId: string, body: CreateEquipmentDto,): Promise<Equipment> {
		return this.prisma.equipment.create({ data: {
			contractorId,
			equipmentType: body.equipmentType,
			brand:         body.brand,
			model:         body.model,
		}, },)
	}

	public async deleteEquipment(equipmentId: string,): Promise<void> {
		await this.prisma.equipment.delete({ where: { id: equipmentId, }, },)
	}

	public async getContractorTrainings(contractorId: string,): Promise<Array<ContractorTrainingResponseDto>> {
		const trainings = await this.prisma.contractorTraining.findMany({
			where:   {  contractor_id: contractorId, },
			include: {
				training: true,
			},
		},)

		return trainings.map((training,) => {
			return ContractorTrainingResponseDto.cast(training,)
		},)
	}

	public async deleteContractorTraining(contractorId: string, trainingId: string,): Promise<void> {
		await this.prisma.contractorTraining.delete({
			where: { contractor_id_training_id: {
				contractor_id: contractorId,
				training_id:   trainingId,
			}, },
		},)
	}
}
