/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, } from '@nestjs/swagger'
import { WorkerService, } from '../services/worker.service'
import { CreateWorkerDto, UpdateWorkerDto, GetWorkersQueryDto, } from '../dto/worker.dto'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { WorkerResponseDto, PagedWorkersResponseDto, } from '../dto/worker-response.dto'
import { OfficeResponseDto, } from '../dto/office-response.dto'
import { Prisma, } from '@prisma/client'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

@Controller('workers',)
@UseGuards(ClientAuthGuard,)
@ApiTags('Workers',)
export class WorkerController {
	constructor(private readonly workerService: WorkerService,) {}

    @Get('',)
    @ApiOperation({ summary: 'Get all workers with pagination, search, and filtering',},)
    @ApiResponse({ status: 200, description: 'Returns a paginated list of workers.', type: PagedWorkersResponseDto,},)
	public async getWorkers(@Query() query: GetWorkersQueryDto,): Promise<PagedResDto<WorkerResponseDto>> {
		return this.workerService.getWorkers(query,)
	}

    @Post('',)
    @ApiOperation({ summary: 'Create a new worker',},)
    @ApiResponse({ status: 201, description: 'Worker created successfully.', type: WorkerResponseDto,},)
    @ApiBody({ type: CreateWorkerDto,},)
    public async createWorker(@Body() data: CreateWorkerDto,): Promise<WorkerResponseDto> {
    	return this.workerService.createWorker(data,)
    }

    @Get('office/:officeId',)
    @ApiOperation({ summary: 'Get workers by office ID',},)
    @ApiResponse({ status: 200, description: 'Returns workers for a specific office.', type: [WorkerResponseDto,],},)
    public async getWorkersByOfficeId(@Param('officeId',) officeId: string,): Promise<Array<WorkerResponseDto>> {
    	return this.workerService.getWorkersByOfficeId(officeId,)
    }

    @Post('office/:officeId',)
    @ApiOperation({ summary: 'Add worker to office',},)
    @ApiResponse({ status: 201, description: 'Worker added to office successfully.', type: WorkerResponseDto,},)
    public async addWorker(@Param('officeId',) officeId: string, @Body() data: Prisma.WorkerCreateInput,): Promise<WorkerResponseDto> {
    	return this.workerService.addWorker(officeId, data,)
    }

    @Delete('office/:officeId/:workerId',)
    @ApiOperation({ summary: 'Remove worker from office',},)
    @ApiResponse({ status: 200, description: 'Worker removed from office successfully.',},)
    public async removeWorkerFromOffice(@Param('workerId',) workerId: string, @Param('officeId',) officeId: string,): Promise<void> {
    	return this.workerService.deleteWorkerFromOffice(workerId, officeId,)
    }

    @Post('assign/:workerId/office/:officeId',)
    @ApiOperation({ summary: 'Assign worker to office',},)
    @ApiResponse({ status: 201, description: 'Worker assigned to office successfully.', type: WorkerResponseDto,},)
    @ApiParam({ name: 'workerId', description: 'Worker ID',},)
    @ApiParam({ name: 'officeId', description: 'Office ID',},)
    public async assignWorkerToOffice(@Param('workerId',) workerId: string, @Param('officeId',) officeId: string,): Promise<WorkerResponseDto> {
    	return this.workerService.assignWorkerToOffice(workerId, officeId,)
    }

    @Get(':workerId/offices',)
    @ApiOperation({ summary: 'Get offices by worker ID',},)
    @ApiResponse({ status: 200, description: 'Returns offices for a specific worker.', type: [OfficeResponseDto,],},)
    public async getOfficesByWorkerId(@Param('workerId',) workerId: string,): Promise<Array<OfficeResponseDto>> {
    	return this.workerService.getOfficesByWorkerId(workerId,)
    }

    @Get(':id',)
    @ApiOperation({ summary: 'Get a worker by ID',},)
    @ApiResponse({ status: 200, description: 'Returns a worker by ID.', type: WorkerResponseDto,},)
    public async getWorkerById(@Param('id',) id: string,): Promise<WorkerResponseDto> {
    	return this.workerService.getWorkerById(id,)
    }

    @Put(':id',)
    @ApiOperation({ summary: 'Update a worker',},)
    @ApiResponse({ status: 200, description: 'Worker updated successfully.', type: WorkerResponseDto,},)
    @ApiBody({ type: UpdateWorkerDto,},)
    public async updateWorker(@Param('id',) id: string, @Body() data: UpdateWorkerDto,): Promise<WorkerResponseDto> {
    	return this.workerService.updateWorker(id, data,)
    }

    @Delete(':id',)
    @ApiOperation({ summary: 'Delete a worker',},)
    @ApiResponse({ status: 200, description: 'Worker deleted successfully.', type: WorkerResponseDto,},)
    public async deleteWorker(@Param('id',) id: string,): Promise<WorkerResponseDto> {
    	return this.workerService.deleteWorker(id,)
    }
}
