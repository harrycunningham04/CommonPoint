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
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { GetTrainingsDto, } from '../dto/get-training.dto'
import { AssignContractorDto, CreateTrainingDto, } from '../dto/create-training.dto'
import { ChangeTrainingDto, } from '../dto/change-training.dto'
import { TrainingService, } from '../services/training.service'
import type { ITrainingListReturn, } from '../training.types'
import { ReqAdmin, } from 'src/shared/decorators/admin.decorator'
import { IRequestAdmin, } from 'src/modules/admin/admin.types'
import type { Review, Training, } from '@prisma/client'
import { AddReviewDto, } from '../dto/add-review.dto'

import { Express, } from 'express'
import { ApiOperation, ApiParam, ApiResponse, } from '@nestjs/swagger'
import type { TrainingContractorDto, } from '../dto/training-contractor.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

@Controller('training',)
@UseGuards(AdminAuthGuard,)
export class TrainingController {
	constructor(private readonly trainingService: TrainingService,) {}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Get('list',)
	public async getContractors(
		@Query() query: GetTrainingsDto,
	): Promise<ITrainingListReturn> {
		return this.trainingService.filteredTrainings({ ...query, },)
	}

	@UseGuards(RolesGuard,)
	@Roles(2,)
	@Post('add',)
	public async addTraining(
		@ReqAdmin() reqAdmin: IRequestAdmin,
		@Body() body: CreateTrainingDto,
	): Promise<Training> {
		return this.trainingService.addTraining({adminId: reqAdmin.id, body,},)
	}

	@Post('upload-material/:trainingId',)
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

	public async uploadMaterial(
		@UploadedFile() file: Express.Multer.File,
		@Param('trainingId',) trainingId: string,
	): Promise<Training> {
		return this.trainingService.uploadTrainingMaterial(file,trainingId,)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Patch('change/:id',)
	public async changeTraining(
		@Param('id',) trainingId: string,
		@Body() body: ChangeTrainingDto,
	): Promise<Training> {
		return this.trainingService.changeTraining(trainingId, body,)
	}

	@Post('add-review',)
	public async addReview(
		@Param('id',) trainingId: string,
		@Body() body: AddReviewDto,
	): Promise<Review> {
		const { contractorId, text, } = body
		return this.trainingService.addReview(trainingId, contractorId, text,)
	}

	@ApiOperation({ summary: 'Assign training to a contractor', },)
	@ApiParam({ name: 'trainingId', type: String, description: 'ID of the training', },)
	@ApiResponse({ status: 200, description: 'Training successfully assigned', },)
	@Post('assign-training/:trainingId',)
	public async assignTraining(@Param('trainingId',) trainingId: string, @Body() data : AssignContractorDto,): Promise<void> {
		await this.trainingService.assignTraining(trainingId, data,)
	}

	@UseGuards(RolesGuard,)
	@Roles(1,)
	@Delete('delete/:id',)
	public async deleteTraining(
		@Param('id',) trainingId: string,
	): Promise<void> {
		await this.trainingService.deleteTraining(trainingId,)
	}

	@Get('training-contractors/:trainingId',)
	public async getTrainingContractors(@Param('trainingId',) trainingId: string,): Promise<Array<TrainingContractorDto>> {
		return this.trainingService.getTrainingContractors(trainingId,)
	}

	@Get('training-reviews/:trainingId',)
	public async getTrainingReviews(@Param('trainingId',) trainingId: string, @Query() data:PageOptionsDto,): Promise<PagedResDto<Review>> {
		return this.trainingService.getTrainingReviews(trainingId,data,)
	}
}
