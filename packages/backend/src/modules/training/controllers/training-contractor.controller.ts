/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags, } from '@nestjs/swagger'
import { TrainingContractorService, } from '../services/training-contractor.service'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import type {  BasicTrainingDto, } from '../dto/contractor-training.dto'
import type { PagedCountResDto, } from 'src/shared/dto/pageg-count-res.dto'
import { CreateReviewTrainingDto, } from '../dto/create-training-review.dto'
import { ContractorTrainingRequestDto, } from '../dto/contractor-training-request.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('training-contractor',)
@ApiTags('Training Contractor',)
@ApiCookieAuth('jwt',)
@UseGuards(ContractorAuthGuard,)
export class TrainingContractorController {
	constructor(
        private readonly trainingService : TrainingContractorService,
	) {}

    @Get()
    @ApiOperation({summary: 'Get all training contractors', },)
    @ApiQuery({type: PageOptionsDto,},)
	public async getTrainings(@User() contractorId:string,@Query() query:PageOptionsDto,):Promise<PagedCountResDto<BasicTrainingDto>> {
		return this.trainingService.getTrainingContractors(contractorId,query,)
	}

	@Post('review/:trainingId',)
	@ApiOperation({summary: 'Create training review',},)
    public async createTrainingReview(
		@Param('trainingId',) trainingId : string,
		@Body() body : CreateReviewTrainingDto,
		@User() contractorId:string,
    ):Promise<void> {
    	return this.trainingService.createTrainingReview(trainingId,body,contractorId,)
    }

	@Delete('complete/:trainingId',)
	@ApiOperation({summary: 'Contractor complete training',},)
	public async completeTraining(@User() contractorId:string,@Param('trainingId',) trainingId : string,):Promise<void> {
		return this.trainingService.completeTraining(contractorId,trainingId,)
	}

	@Post('request',)
	public async createTrainingRequest(@User() contractorId:string, @Body() body :ContractorTrainingRequestDto,):Promise<void> {
		return this.trainingService.trainingRequest(contractorId,body,)
	}
}