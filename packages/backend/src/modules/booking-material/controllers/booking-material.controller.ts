/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors, } from '@nestjs/common'
import { BookingMaterialService, } from '../services/booking-materials.service'
import { ApiCookieAuth, ApiOkResponse, ApiTags, } from '@nestjs/swagger'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { User, } from 'src/shared/decorators/user.decorator'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { BookingMaterialListDto, } from '../dto/booking-material-list.dto'
import { BookingGetMaterialsResDto, BookingMaterialsQueryDto, } from '../dto/booking-get-materials.dto'
import { diskStorage, } from 'multer'
import { AnyFilesInterceptor, } from '@nestjs/platform-express'

import type { Express, } from 'express'
import type { UploadMaterialDtoForService,} from '../dto/upload-material.dto'
import { UploadMaterialDto, } from '../dto/upload-material.dto'
import { AddEditedMaterialsDto, } from '../dto/add-edited-material.dto'
import type { BookingAdminEditedMaterialsDto, } from '../dto/booking-admin-material.dto'
import { AdminBookingMaterialsService, } from '../services/admin-booking-materials.service'
import { BookingEditedMaterialsService, } from '../services/booking-edited-materials.service'
import { UpdateMaterialDto, } from '../dto/update-material.dto'
@Controller('booking-material',)
@ApiTags('Jobs materials',)
@ApiCookieAuth('jwt',)
@UseGuards(ContractorAuthGuard,)
export class BookingMaterialController {
	constructor(private readonly bookingControllerService : BookingMaterialService,
		private readonly editedMaterialsService : BookingEditedMaterialsService,
	) {}

    @Get('list',)
	@ApiOkResponse({
		description: 'Get list of jobs materials required',
		type:        BookingMaterialListDto,
	},)
	public async getContractorJobsMaterials(@User() userId:string, @Query() data:PageOptionsDto,):Promise<PagedResDto<BookingMaterialListDto>> {
		return this.bookingControllerService.getJobsMaterial(userId,data,)
	}

	@Get('uploaded-materials/:bookingId',)
	@ApiOkResponse({
		description: 'Get list of uploaded materials for a booking',
		type:        BookingGetMaterialsResDto,
	},)
    public async getBookingMaterials(@Param('bookingId',) bookingId : string, @Query() data:BookingMaterialsQueryDto,):Promise<BookingGetMaterialsResDto> {
    	return this.bookingControllerService.getJobMaterials(bookingId,data,)
    }

	@Delete('delete-material/:groupId',)
	@ApiOkResponse({
		description: 'Delete a material',
	},)
	public async deleteMaterial(@Param('groupId',) groupId: string,):Promise<void> {
		const groupIdNumber = parseInt(groupId,)
		return this.bookingControllerService.deleteMaterial(groupIdNumber,)
	}

	@Post('upload-materials/:bookingId',)
	public async uploadMaterials(@Param('bookingId',) bookingId: string, @Body() body: UploadMaterialDto,):Promise<UploadMaterialDtoForService> {
		return this.bookingControllerService.uploadMaterials(bookingId,body,)
	}

	@Delete('delete-material-single/:materialId',)
	@ApiOkResponse({
		description: 'Delete a material',
	},)
	public async deleteMaterialSingle(@Param('materialId',) materialId: string,):Promise<void> {
		return this.bookingControllerService.deleteMaterialSingle(materialId,)
	}

	@Patch('update-material-group/:groupId',)
	@ApiOkResponse({
		description: 'Update the group of a material',
	},)
	public async updateMaterialGroup(@Param('groupId',) groupId: string,):Promise<void> {
		const groupIdNumber = parseInt(groupId,)
		return this.bookingControllerService.updateMaterialGroup(groupIdNumber,)
	}

	@Post('add-edited-materials/:bookingId',)
	public async uploadEditedMaterials(@Param('bookingId',) bookingId: string, @Body() body: AddEditedMaterialsDto,):Promise<Array<BookingAdminEditedMaterialsDto>> {
		return this.editedMaterialsService.addBookingEditedMaterials(bookingId,body,)
	}

	@Delete('delete-edited-sketches/:bookingId',)
	@ApiOkResponse({
		description: 'Delete all edited sketches for a booking',
	},)
	public async deleteEditedSketches(@Param('bookingId',) bookingId: string,):Promise<void> {
		return this.editedMaterialsService.deleteEditedSketches(bookingId,)
	}

	@Patch('update-material',)
	public async updateMaterial(@Body() body: UpdateMaterialDto,):Promise<void> {
		return this.bookingControllerService.updateMaterial(body,)
	}

	@Get('get-materials-count/:bookingId',)
	public async getMaterialsCount(@Param('bookingId',) bookingId: string,):Promise<{
		photos: number
		videos: number
		audios: number
	}> {
		return this.bookingControllerService.getMaterialsCount(bookingId,)
	}
}