import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { PagedCountResDto, } from 'src/shared/dto/pageg-count-res.dto'
import type {  BasicTrainingDto,} from '../dto/contractor-training.dto'
import { TrainingResponseDto,} from '../dto/contractor-training.dto'
import { NotificationCategory, type Prisma, } from '@prisma/client'
import type { CreateReviewTrainingDto, } from '../dto/create-training-review.dto'
import type { ContractorTrainingRequestDto, } from '../dto/contractor-training-request.dto'
import { NotificationService, } from 'src/modules/notifications/services/notification.service'

@Injectable()
export class TrainingContractorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService : NotificationService,
	) {}

	public async getTrainingContractors(contractorId:string,paginator:PageOptionsDto,): Promise<PagedCountResDto<BasicTrainingDto>> {
		const commonWhere : Prisma.ContractorTrainingWhereInput = {
			completed: false,
		}
		const [trainings,count,] = await Promise.all([this.prisma.contractorTraining.findMany({
			where: {
				contractor_id: contractorId,
				...commonWhere,
			},
			skip:    paginator.skip,
			take:    paginator.take,
			include: {
				training: true,
			},
		},), this.prisma.contractorTraining.count({
			where: {
				contractor_id: contractorId,
				...commonWhere,
			},
		},),],)

		return {
			count,
			data:    TrainingResponseDto.cast(trainings,).trainings,
			hasNext: count > paginator.skip + paginator.take,
		}
	}

	public async createTrainingReview(trainingId:string, data : CreateReviewTrainingDto,contractorId:string,):Promise<void> {
		await this.prisma.review.create({
			data: {
				contractor_id: contractorId,
				training_id:   trainingId,
				text:          data.text,
			},
		},)
	}

	public async completeTraining(contractorId: string, trainingId: string,):Promise<void> {
		const training = await this.prisma.contractorTraining.findUnique({
			where: {
				contractor_id_training_id: {
					contractor_id: contractorId,
					training_id:   trainingId,
				},
			},
			select: { completed: true, },
		},)

		if (!training) {
			throw new NotFoundException('Training not found',)
		}

		if (training.completed) {
			throw new BadRequestException('Training is already completed',)
		}

		await this.prisma.contractorTraining.update({
			where: {
				contractor_id_training_id: {
					contractor_id: contractorId,
					training_id:   trainingId,
				},
			},
			data: {
				completed: true,
			},
		},)
	}

	public async trainingRequest(contractorId:string,body : ContractorTrainingRequestDto,):Promise<void> {
		await this.notificationService.addNotification({
			contractor: {
				connect: {
					id: contractorId,
				},
			},
			title:    body.category,
			message:  body.details,
			category: NotificationCategory.CONTRACTOR_TRAINING_REQUEST,
		},)
	}
}