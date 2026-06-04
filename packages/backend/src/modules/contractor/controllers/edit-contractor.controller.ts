/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Delete, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Put, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors, } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOkResponse, ApiParam, ApiQuery, ApiTags, } from '@nestjs/swagger'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import { User, } from 'src/shared/decorators/user.decorator'
import * as multer from 'multer'
import { EditContractorBasicDto, EditContractorStripeDto, } from '../dto/edit-contractor-basic.dto'
import { EditContractorService, } from '../services/edit-contractor.service'
import { ContractorBasicInfoDto, } from '../dto/contractor-basic-info.dto'
import { EditContractorLocationDto, } from '../dto/edit-contractor-location.dto'
import { ContractorLocationResDto, } from '../dto/contractor-location-res.dto'
import { FileInterceptor, } from '@nestjs/platform-express'
import { MB, } from 'src/shared/constants'
import { Express, } from 'express'
import { SkillsDto, } from '../dto/skills.dto'
import { SkillsAndCertificationsResDto, } from '../dto/skills-and-certifications.dto'
import { CertificationsReqDto, } from '../dto/certifications.dto'

import { EditContractorPasswordDto, } from '../dto/edit-contractor-password.dto'

import { AvailabilitiesReqDto, EditAvailabilitiesDto, EditAvailabilitiesMobileDto, EditAvailabilitiesResDto, } from '../dto/edit-availability.dto'
import { AvailabilityService, } from 'src/modules/availability/availability.service'
import { AdminEditAvailabilityDto, GetAvailabilityDto, } from 'src/modules/booking/dto/get-available-slots.dto'
import type { Availability, } from 'src/modules/booking/dto/get-availability-slots.dto'
import { AdminAuthGuard, ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { ContractorVacationService, } from '../services/contractor-vacation.service'
import { CreateVacationDto, UpdateVacationDto, GetVacationsQueryDto, VacationResponseDto, } from '../dto/vacation.dto'

@Controller('edit-contractor',)
@ApiTags('Edit Contractor',)
@UseFilters(HttpExceptionFilter,)
@ApiCookieAuth()
export class EditContractorController {
	constructor(
    private readonly editContractorService: EditContractorService,
		private readonly contractorAvailabilitiesService: AvailabilityService,
		private readonly contractorVacationService: ContractorVacationService,
	) { }

	@Patch('stripe',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type: 			    EditContractorStripeDto,
		description: 'Edit contractor stripe information',
	},)
	public async editContractorStripe(@User() userId: string, @Body() body: EditContractorStripeDto,): Promise<ContractorBasicInfoDto> {
		return this.editContractorService.editContractorStripe(userId, body,)
	}

  @Patch('basic',)
  @UseGuards(ContractorAuthGuard,)
	@ApiConsumes('multipart/form-data',)
  @ApiBody({
  	description: 'Edit contractor basic information',
  	type:        EditContractorBasicDto,
  },)
  @ApiOkResponse({
  	type:        ContractorBasicInfoDto,
  	description: 'Contractor basic information edited successfully',
  },)
  @UseInterceptors(FileInterceptor('avatar', { storage: multer.memoryStorage(), },),)
	public async editContractor(@User() userId: string, @Body() body: EditContractorBasicDto,
	@UploadedFile(
		new ParseFilePipe({
			fileIsRequired: false,
			validators:     [
				new MaxFileSizeValidator({
					maxSize: MB * 10,
				},),
			],
		},),
	)
		avatar?: Express.Multer.File,
	): Promise<ContractorBasicInfoDto> {
		return this.editContractorService.editContractorBasicInfo(userId, body, avatar,)
	}

	@Patch('skills',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type: 			    SkillsDto,
		description: 'Edit contractor skills',
	},)
	@ApiOkResponse({
		type: SkillsAndCertificationsResDto,
	},)
  public async editSkills(@User() userId: string, @Body() body: SkillsDto,
  ): Promise<SkillsAndCertificationsResDto> {
  	return this.editContractorService.setupContractorSkills(userId, body.skills,)
  }

	@Patch('certifications',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type: 			    CertificationsReqDto,
		description: 'Edit contractor certifications',
	},)
	@ApiOkResponse({
		type:        SkillsAndCertificationsResDto,
		description: 'Contractor certifications edited successfully',
	},)
	public async editCertifications(@User() userId: string, @Body() body: CertificationsReqDto,): Promise<SkillsAndCertificationsResDto> {
		return this.editContractorService.setupContractorSpecificDocuments(userId, body,)
	}

	@Put('location',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type:        EditContractorLocationDto,
		description: 'Edit contractor location information',
	},)
	@ApiOkResponse({
		type:        ContractorLocationResDto,
		description: 'Contractor location information edited successfully',
	},)
	public async editContractorLocation(@User() userId: string, @Body() location: EditContractorLocationDto,): Promise<ContractorLocationResDto> {
  	return this.editContractorService.editContractorLocation(userId, location,)
	}

	@Patch('availability',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type: 			    EditAvailabilitiesDto,
		description: 'Edit contractor availability',
	},)
	@ApiOkResponse({
		type:        EditAvailabilitiesResDto,
		description: 'Contractor availability edited successfully',
	},)
	public async editContractorAvailability(@User() userId: string, @Body() body: EditAvailabilitiesDto,): Promise<EditAvailabilitiesResDto> {
		return this.contractorAvailabilitiesService.editContractorAvailabilityContractor(userId, body,)
	}

	@Patch('availability/mobile',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type: 			    EditAvailabilitiesMobileDto,
		description: 'Edit contractor availability',
	},)
	@ApiOkResponse({
		type:        EditAvailabilitiesResDto,
		description: 'Contractor availability edited successfully',
	},)
	public async editContractorAvailabilityMobile(@User() userId: string, @Body() body: EditAvailabilitiesMobileDto,): Promise<void> {
		return this.contractorAvailabilitiesService.editContractorAvailabilityMobile(userId, body,)
	}

	@Get('availability',)
	@UseGuards(ContractorAuthGuard,)
	@ApiQuery({
		type:        AvailabilitiesReqDto,
		description: 'Get contractor availability',
		name:        'availability',
	},)
	@ApiOkResponse({
		type:        EditAvailabilitiesResDto,
		description: 'Get contractor availability',
	},)
	public async getContractorAvailability(@User() userId: string, @Query() param: AvailabilitiesReqDto,): Promise<EditAvailabilitiesResDto> {
		return this.contractorAvailabilitiesService.getAvailabilities(userId, param,)
	}

	@Patch('availability/admin/contractor/:contractorId',)
	@UseGuards(AdminAuthGuard,)
	@ApiBody({
		description: 'Edit contractor availability',
	},)
	@ApiOkResponse({
		type:        Array<Availability>,
		description: 'Contractor availability edited successfully',
	},)
	public async editContractorAvailabilityAdmin(@Param('contractorId',) contractorId: string, @Body() body: AdminEditAvailabilityDto,): Promise<Array<Availability>> {
		return this.contractorAvailabilitiesService.editContractorAvailabilityAdmin(contractorId, body,)
	}

	@Get('availability/admin/contractor/:contractorId',)
	@UseGuards(AdminAuthGuard,)
	@ApiParam({
		name:        'contractorId',
		description: 'Contractor ID',
		type:        'string',
	},)
	@ApiQuery({
		type: 			    GetAvailabilityDto,
		description: 'Get contractor availability',
	},)
	@ApiOkResponse({
		type:        Array<Availability>,
		description: 'Returns contractor availability',
	},)
	public async getContractorAvailabilityAdmin(@Param('contractorId',) contractorId: string, @Query() query: GetAvailabilityDto,): Promise<Array<Availability>> {
		return this.contractorAvailabilitiesService.getAvailability(contractorId, query,)
	}

	@Patch('password',)
	@UseGuards(ContractorAuthGuard,)
	@ApiOkResponse({
		type: ContractorBasicInfoDto,
	},)
	public async changePassword(@User() contractorId:string, @Body() passwordData : EditContractorPasswordDto,): Promise<ContractorBasicInfoDto> {
		return this.editContractorService.changePassword(passwordData,contractorId,)
	}

	@Delete('document/:documentId',)
	@UseGuards(ContractorAuthGuard,)
	@ApiOkResponse({
		description: 'Contractor certification deleted successfully',
	},)
	@ApiParam({
		name:        'documentId',
		description: 'Certification id',
		type:        'string',
	},)
	public async deleteDocument(@Param('documentId',) documentId: string,): Promise<void> {
		return this.editContractorService.deleteSpecificDocument(documentId,)
	}

	@Get('vacations',)
	@UseGuards(ContractorAuthGuard,)
	@ApiQuery({
		type:        GetVacationsQueryDto,
		description: 'Get contractor vacations with optional date filtering',
	},)
	@ApiOkResponse({
		type:        Array<VacationResponseDto>,
		description: 'Returns contractor vacations',
	},)
	public async getContractorVacations(
		@User() contractorId: string,
		@Query() query: GetVacationsQueryDto,
	): Promise<Array<VacationResponseDto>> {
		return this.contractorVacationService.getContractorVacations(contractorId, query,)
	}

	@Post('vacations',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type:        CreateVacationDto,
		description: 'Create new vacation(s) for contractor',
	},)
	@ApiOkResponse({
		type:        Array<VacationResponseDto>,
		description: 'Vacation(s) created successfully',
	},)
	public async createContractorVacation(
		@User() contractorId: string,
		@Body() createVacationDto: CreateVacationDto,
	): Promise<Array<VacationResponseDto>> {
		return this.contractorVacationService.createContractorVacation(contractorId, createVacationDto,)
	}

	@Patch('vacations/:vacationId',)
	@UseGuards(ContractorAuthGuard,)
	@ApiBody({
		type:        UpdateVacationDto,
		description: 'Update existing vacation',
	},)
	@ApiOkResponse({
		type:        VacationResponseDto,
		description: 'Vacation updated successfully',
	},)
	@ApiParam({
		name:        'vacationId',
		description: 'Vacation ID',
		type:        'string',
	},)
	public async updateContractorVacation(
		@User() contractorId: string,
		@Param('vacationId',) vacationId: string,
		@Body() updateVacationDto: UpdateVacationDto,
	): Promise<VacationResponseDto> {
		return this.contractorVacationService.updateContractorVacation(vacationId, contractorId, updateVacationDto,)
	}

	@Delete('vacations/:vacationId',)
	@UseGuards(ContractorAuthGuard,)
	@ApiOkResponse({
		description: 'Vacation deleted successfully',
	},)
	@ApiParam({
		name:        'vacationId',
		description: 'Vacation ID',
		type:        'string',
	},)
	public async deleteContractorVacation(
		@User() contractorId: string,
		@Param('vacationId',) vacationId: string,
	): Promise<void> {
		return this.contractorVacationService.deleteContractorVacation(vacationId, contractorId,)
	}
}