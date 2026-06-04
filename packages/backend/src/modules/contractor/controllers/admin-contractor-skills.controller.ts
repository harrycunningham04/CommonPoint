import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, } from '@nestjs/swagger'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { AdminContractorSkillsService, } from '../services/admin-contractor-skills.service'
import { CreateContractorSkillDto, UpdateContractorSkillDto, ContractorSkillResponseDto, GetContractorSkillsQueryDto, } from '../dto/admin-contractor-skills.dto'

@Controller('admin/contractor-skills',)
@UseGuards(RolesGuard,)
@Roles(2,)
@UseGuards(AdminAuthGuard,)
@ApiTags('Admin Contractor Skills',)
export class AdminContractorSkillsController {
	constructor(private readonly adminContractorSkillsService: AdminContractorSkillsService,) {}

	@Get()
	@ApiOperation({ summary: 'Get all contractor skills with optional filtering',},)
	@ApiResponse({ status: 200, description: 'Returns a list of contractor skills.', type: [ContractorSkillResponseDto,],},)
	@ApiQuery({ name: 'confirmed', required: false, description: 'Filter by confirmation status',},)
	@ApiQuery({ name: 'skillName', required: false, description: 'Filter by skill name',},)
	public async getContractorSkills(@Query() query: GetContractorSkillsQueryDto,): Promise<Array<ContractorSkillResponseDto>> {
		return this.adminContractorSkillsService.getContractorSkills(query,)
	}

	@Get('contractor/:contractorId',)
	@ApiOperation({ summary: 'Get contractor skills by contractor ID',},)
	@ApiResponse({ status: 200, description: 'Returns contractor skills for a specific contractor.', type: [ContractorSkillResponseDto,],},)
	@ApiParam({ name: 'contractorId', description: 'Contractor ID',},)
	public async getContractorSkillsByContractorId(@Param('contractorId',) contractorId: string,): Promise<Array<ContractorSkillResponseDto>> {
		return this.adminContractorSkillsService.getContractorSkillsByContractorId(contractorId,)
	}

	@Post()
	@ApiOperation({ summary: 'Create a new contractor skill',},)
	@ApiResponse({ status: 201, description: 'Contractor skill created successfully.', type: ContractorSkillResponseDto,},)
	@ApiBody({ type: CreateContractorSkillDto,},)
	public async createContractorSkill(@Body() data: CreateContractorSkillDto,): Promise<ContractorSkillResponseDto> {
		return this.adminContractorSkillsService.createContractorSkill(data,)
	}

	@Patch(':contractorId/:skillId',)
	@ApiOperation({ summary: 'Update a contractor skill',},)
	@ApiResponse({ status: 200, description: 'Contractor skill updated successfully.', type: ContractorSkillResponseDto,},)
	@ApiBody({ type: UpdateContractorSkillDto,},)
	@ApiParam({ name: 'contractorId', description: 'Contractor ID',},)
	@ApiParam({ name: 'skillId', description: 'Skill ID',},)
	public async updateContractorSkill(
		@Param('contractorId',) contractorId: string,
		@Param('skillId',) skillId: string,
		@Body() data: UpdateContractorSkillDto,
	): Promise<ContractorSkillResponseDto> {
		return this.adminContractorSkillsService.updateContractorSkill(contractorId, skillId, data,)
	}

	@Patch(':contractorId/:skillId/approve',)
	@ApiOperation({ summary: 'Approve a contractor skill',},)
	@ApiResponse({ status: 200, description: 'Contractor skill approved successfully.', type: ContractorSkillResponseDto,},)
	@ApiParam({ name: 'contractorId', description: 'Contractor ID',},)
	@ApiParam({ name: 'skillId', description: 'Skill ID',},)
	public async approveContractorSkill(
		@Param('contractorId',) contractorId: string,
		@Param('skillId',) skillId: string,
	): Promise<ContractorSkillResponseDto> {
		return this.adminContractorSkillsService.approveContractorSkill(contractorId, skillId,)
	}

	@Delete(':contractorId/:skillId',)
	@ApiOperation({ summary: 'Delete a contractor skill',},)
	@ApiResponse({ status: 200, description: 'Contractor skill deleted successfully.',},)
	@ApiParam({ name: 'contractorId', description: 'Contractor ID',},)
	@ApiParam({ name: 'skillId', description: 'Skill ID',},)
	public async deleteContractorSkill(
		@Param('contractorId',) contractorId: string,
		@Param('skillId',) skillId: string,
	): Promise<void> {
		return this.adminContractorSkillsService.deleteContractorSkill(contractorId, skillId,)
	}
}