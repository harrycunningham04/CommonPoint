/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { BookingMaterialService, } from '../services/booking-materials.service'
import { ApiCookieAuth, ApiOkResponse, ApiTags, } from '@nestjs/swagger'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'
import {
	BookingGetMaterialsResDto,
	BookingMaterialsQueryDto,
} from '../dto/booking-get-materials.dto'
import type { UploadMaterialDtoForService, } from '../dto/upload-material.dto'
import { UploadMaterialDto, } from '../dto/upload-material.dto'
import { TOKEN_TYPES, } from '../../../shared/constants/token-types.constants'
import { AddEditedMaterialsDto, } from '../dto/add-edited-material.dto'
import { BookingEditedMaterialsService, } from '../services/booking-edited-materials.service'
import type { BookingAdminEditedMaterialsDto, BookingAdminEditedMaterialsDtoResponse, BookingAdminRawMaterialsDto, BookingRawMaterialDtoResponse, } from '../dto/booking-admin-material.dto'
import { AdminBookingMaterialsService, } from '../services/admin-booking-materials.service'
import { UploadRawAdminDto, UploadRawAdminDtoForService } from '../dto/upload-raw-admin.dto'

@Controller('admin-booking-materials',)
@ApiTags('Admin job materials',)
@ApiCookieAuth(TOKEN_TYPES.JWT_ADMIN,)
@UseGuards(AdminAuthGuard,)
export class AdminBookingMaterialController {
	constructor(
        private readonly bookingMaterialsService: BookingMaterialService,
        private readonly adminBookingMaterialsService: AdminBookingMaterialsService,
        private readonly bookingEditedMaterialsService: BookingEditedMaterialsService,
	) {}

    @Get('uploaded-raw-materials/:bookingId',)
    @ApiOkResponse({
    	description: 'Get list of uploaded raw materials for a booking',
    	type:        BookingGetMaterialsResDto,
    },)
	public async getBookingMaterials(
        @Param('bookingId',) bookingId: string,
	): Promise<BookingRawMaterialDtoResponse> {
		return this.adminBookingMaterialsService.getBookingMaterials(bookingId,)
	}

    @Delete('delete-raw-material/:materialId',)
    @ApiOkResponse({
    	description: 'Delete a raw material',
    },)
    public async deleteMaterial(
        @Param('materialId',) materialId: string,
    ): Promise<void> {
    	return this.bookingMaterialsService.deleteMaterialSingle(materialId,)
    }

    @Post('upload-raw-materials/:bookingId',)
    public async uploadMaterials(
        @Param('bookingId',) bookingId: string,
        @Body() body: UploadRawAdminDtoForService,
    ): Promise<Array<BookingAdminRawMaterialsDto>> {
    	return this.bookingMaterialsService.uploadRawMaterialsAdmin(bookingId, body,)
    }

    @Get('uploaded-edited-materials/:bookingId',)
    public async getBookingEditedMaterials(
        @Param('bookingId',) bookingId: string,
    ): Promise<BookingAdminEditedMaterialsDtoResponse> {
    	return this.bookingEditedMaterialsService.getBookingEditedMaterials(bookingId,)
    }

    @Post('add-edited-materials/:bookingId',)
    public async addEditedMaterials(
        @Param('bookingId',) bookingId: string,
        @Body() body: AddEditedMaterialsDto,
    ): Promise<Array<BookingAdminEditedMaterialsDto>> {
    	return this.bookingEditedMaterialsService.addBookingEditedMaterials(
    		bookingId,
    		body,
    	)
    }

    @Delete('delete-edited-material/:materialId',)
    public async deleteEditedMaterial(@Param('materialId',) materialId: string,) {
    	return this.bookingEditedMaterialsService.deleteBookingEditedMaterial(
    		materialId,
    	)
    }
}
