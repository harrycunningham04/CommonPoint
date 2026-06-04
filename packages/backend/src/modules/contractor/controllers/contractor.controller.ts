/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseFilters, UseGuards, } from '@nestjs/common'
import { Response, } from 'express'
import { unparse, } from 'papaparse'
import { ContractorService, } from '../services/contractor.service'
import { Roles, } from 'src/shared/roles.decorator'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { ContractorBasicResDto, GetContractorsDto, } from '../dto/get-contractors.dto'
import type { IContractorCalendarListReturn, IContractorListReturn, IContractorStatistics, } from '../contractor.types'
import { CreateContractorDto, } from '../dto/create-contractor.dto'
import type { Contractor, ContractorListColumns, ContractorSkills, ContractorStatisticsColums, Prisma, Skills, } from '@prisma/client'
import { ChangeContractorDto, } from '../dto/change-contractor.dto'
import { ChangeListColumnsDto, } from '../dto/change-list-columns.dto'
import { ChangeStatisticsColumnsDto, } from '../dto/change-statistics-columns.dto'
import { CreateSkillDto, } from '../dto/create-skill-contractor.dto'
import { DirectionsResponseData, TravelMode, } from '@googlemaps/google-maps-services-js'
import { ApiTags, ApiParam, ApiOkResponse, ApiCookieAuth, } from '@nestjs/swagger'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import { GetContractorAssignDto, } from '../dto/contractor-assign-list.dto'
import { PageSearchDto, } from 'src/shared/dto/page-options.dto'

import { AvailabilityService, } from 'src/modules/availability/availability.service'

import { AdminAuthGuard, ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { BookingDetailContractorDto, } from 'src/modules/booking/dto/booking-admin-detaIls.dto'
import { GetContractorDto, } from '../dto/get-contractor.dto'
import { ContractorResponseDto, } from '../dto/contractor-response.dto'

@Controller('contractor',)
@ApiTags('Contractor',)
@UseFilters(HttpExceptionFilter,)
export class ContractorController {
	constructor(
        private readonly contractorService: ContractorService,
        private readonly availabilityService: AvailabilityService,
	) { }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Get('contractor-list',)
	public async getContractors(@Query() query: GetContractorsDto,): Promise<IContractorListReturn> {
		return this.contractorService.filteredContractors({ ...query, },)
	}

    @Post('contractor-add-skills/:contractorId',)
    public async addContractorSkill(@Param('contractorId',) contractorId: string, @Body() body: CreateSkillDto,): Promise<{ contractorSkill: ContractorSkills, skill: Skills }> {
    	return this.contractorService.createContractorSkill(contractorId, body,)
    }

    @Delete('contractor-delete-skill/:contractorId/:skillId',)
    public async deleteContractorSkill(
        @Param('contractorId',) contractorId: string,
        @Param('skillId',) skillId: string,
    ): Promise<void> {
    	return this.contractorService.removeContractorSkill(contractorId, skillId,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Get('contractor-list-calendar',)
    public async getCalendarContractors(@Query() query: GetContractorsDto,): Promise<IContractorListReturn> {
    	return this.contractorService.filteredContractors({ ...query, },)
    }

    @Get('contractor-list-routes/:contractorId',)
    public async getContractorRoutes(
        @Param('contractorId',) contractorId: string,
        @Query('transportation',) travelMode: TravelMode,
    ): Promise<DirectionsResponseData | undefined> {
    	return this.contractorService.getContractorRoutes(contractorId, travelMode,)
    }

    @Get('contractor-statistics/:id',)
    public async getContractorStatistics(@Param('id',) contractorId: string,): Promise<IContractorStatistics> {
    	return this.contractorService.contractorStatistics(contractorId,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Get('contractor-list-options',)
    public async getListColumns(): Promise<ContractorListColumns> {
    	return this.contractorService.getContractorListColumns()
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Get('contractor-statistics-options',)
    public async getStatisticsColumns(): Promise<ContractorStatisticsColums> {
    	return this.contractorService.getContractorStatisticsColumns()
    }

    @UseGuards(RolesGuard,)
    @Roles(2,)
    @UseGuards(AdminAuthGuard,)
    @Get('contractor-export',)
    public async exportContractors(@Query() query: GetContractorsDto, @Res() res: Response,): Promise<void> {
    	const listColumns = await this.contractorService.getContractorListColumns()
    	const contractors = await this.contractorService.exportContractors(query, listColumns,)
    	// eslint-disable-next-line no-unused-vars
    	const { id: _id, ...columns } = listColumns
    	const columnNames = Object.keys(columns,).filter((key,) => {
    		return columns[key as keyof typeof columns]
    	},)
    	const csvContractors = unparse(contractors, { columns: ['name', 'surname', ...columnNames,], },)
    	res.setHeader('Content-Type', 'application/octet-stream',)
    	res.setHeader('Content-Disposition', 'attachment; filename="contractors.csv"',)
    	res.send(csvContractors,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Post('add-contractor',)
    public async addContractor(@Body() body: CreateContractorDto,): Promise<ContractorResponseDto> {
    	return this.contractorService.addContractor({ ...body, },)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Patch('change-contractor/:id',)
    public async changeContractor(
        @Param('id',) contractorId: string,
        @Body() body: Prisma.ContractorUpdateInput & ChangeContractorDto,
    ): Promise<ContractorResponseDto> {
    	return this.contractorService.changeContractor(contractorId, body,)
    }

    @UseGuards(RolesGuard,)
    @Roles(2,)
    @UseGuards(AdminAuthGuard,)
    @Patch('change-list-options',)
    public async changeListColumns(@Body() body: ChangeListColumnsDto,): Promise<ContractorListColumns> {
    	return this.contractorService.changeListColumns(body,)
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Patch('change-statistics-columns',)
    public async changeStatisticsColumns(@Body() body: ChangeStatisticsColumnsDto,): Promise<ContractorStatisticsColums> {
    	return this.contractorService.changeStatisticsColumns(body,)
    }

    @Get('contractor-regions',)
    public async getContractorRegions(): Promise<Array<{ name: string; id: string }>> {
    	return this.contractorService.getContractorRegionsData()
    }

    @Get('contractor-skills/:contractorId',)
    public async getContractorSkills(@Param('contractorId',) contractorId: string,) {
    	return this.contractorService.getContractorOwnSkill(contractorId,)
    }

    @Get('contractor-basic-info-review/:contractorId',)
    @ApiParam({ name: 'contractorId', type: String, },)
    @ApiOkResponse({ type: ContractorBasicResDto, },)
    @ApiCookieAuth('jwt',)
    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    public async getContractorBasicInfo(@Param('contractorId',) contractorId: string,): Promise<ContractorBasicResDto> {
    	return this.contractorService.getContractorBasicInfo(contractorId,)
    }

    @Get('contractor-assign-list',)
    @ApiOkResponse({type: GetContractorAssignDto,},)
    @UseGuards(AdminAuthGuard,)
    public async getContractorAssignList(@Query() query:PageSearchDto,): Promise<Array<GetContractorAssignDto>> {
    	return this.contractorService.getContractorAssignList(query,)
    }

    @Get('contractor-assign-all',)
    @ApiOkResponse({type: GetContractorAssignDto,},)
    @UseGuards(AdminAuthGuard,)
    public async getContractorAssignAll(): Promise<Array<BookingDetailContractorDto>> {
    	return this.contractorService.getContractorAssignAll()
    }

    @UseGuards(RolesGuard,)
    @Roles(1,)
    @UseGuards(AdminAuthGuard,)
    @Get('contractor/:id',)
    public async getContractor(@Param() params: GetContractorDto,): Promise<ContractorResponseDto> {
    	return this.contractorService.getContractorById(params.id,)
    }
}
