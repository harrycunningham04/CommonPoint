import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, } from '@nestjs/swagger'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { AdminSubbrandService, } from '../../services/admin-subbrand.service'
import { CreateSubbrandDto, GetSubbrandsQueryDto, UpdateSubbrandDto, } from '../../dto/subbrand.dto'
import { SubbrandResponseDto, PagedSubbrandsResponseDto, } from '../../dto/subbrand-response.dto'
import { SubbrandDto } from '../../dto/subbrand-dto'

@Controller('admin/subbrands',)
@UseGuards(AdminAuthGuard,)
@ApiTags('Admin Subbrands',)
export class AdminSubbrandsController {
	constructor(private readonly adminSubbrandService: AdminSubbrandService,) {}

	@Get('packages',)
	@ApiOperation({ summary: 'Get packages for a subbrand',},)
	@ApiResponse({ status: 200, description: 'Returns packages for a subbrand.', type: PagedSubbrandsResponseDto,},)
	public async getPackages(@Query() query: SubbrandDto,): Promise<Array<SubbrandResponseDto>> {
		return this.adminSubbrandService.getSubbrands(query,)
	}

	@Get('client/:clientId',)
	@ApiOperation({ summary: 'Get subbrands by client ID with pagination, filtering, and sorting',},)
	@ApiResponse({ status: 200, description: 'Returns a paginated list of subbrands for a specific client.', type: PagedSubbrandsResponseDto,},)
	@ApiParam({ name: 'clientId', description: 'Client ID',},)
	public async getSubbrandsByClientId(
		@Param('clientId',) clientId: string,
		@Query() query: GetSubbrandsQueryDto,
	): Promise<PagedResDto<SubbrandResponseDto>> {
		return this.adminSubbrandService.getSubbrandsByClientId(clientId, query,)
	}

	@Post('client/:clientId',)
	@ApiOperation({ summary: 'Create a new subbrand for a specific client',},)
	@ApiResponse({ status: 201, description: 'Subbrand created successfully.', type: SubbrandResponseDto,},)
	@ApiBody({ type: CreateSubbrandDto,},)
	@ApiParam({ name: 'clientId', description: 'Client ID',},)
	public async createSubbrand(
		@Param('clientId',) clientId: string,
		@Body() data: CreateSubbrandDto,
	): Promise<SubbrandResponseDto> {
		return this.adminSubbrandService.createSubbrand({ ...data, parentBrandId: clientId, },)
	}

	@Get(':id',)
	@ApiOperation({ summary: 'Get a subbrand by ID',},)
	@ApiResponse({ status: 200, description: 'Returns a subbrand by ID.', type: SubbrandResponseDto,},)
	@ApiParam({ name: 'id', description: 'Subbrand ID',},)
	public async getSubbrandById(@Param('id',) id: string,): Promise<SubbrandResponseDto> {
		return this.adminSubbrandService.getSubbrandById(id,)
	}

	@Put(':id',)
	@ApiOperation({ summary: 'Update a subbrand',},)
	@ApiResponse({ status: 200, description: 'Subbrand updated successfully.', type: SubbrandResponseDto,},)
	@ApiBody({ type: UpdateSubbrandDto,},)
	@ApiParam({ name: 'id', description: 'Subbrand ID',},)
	public async updateSubbrand(
		@Param('id',) id: string,
		@Body() data: UpdateSubbrandDto,
	): Promise<SubbrandResponseDto> {
		return this.adminSubbrandService.updateSubbrand(id, data,)
	}

	@Delete(':id',)
	@ApiOperation({ summary: 'Delete a subbrand',},)
	@ApiResponse({ status: 200, description: 'Subbrand deleted successfully.', type: SubbrandResponseDto,},)
	@ApiParam({ name: 'id', description: 'Subbrand ID',},)
	public async deleteSubbrand(@Param('id',) id: string,): Promise<SubbrandResponseDto> {
		return this.adminSubbrandService.deleteSubbrand(id,)
	}


}
