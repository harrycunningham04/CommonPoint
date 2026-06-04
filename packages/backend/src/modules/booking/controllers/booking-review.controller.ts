/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Controller,
	UseGuards,
	Param,
	ParseUUIDPipe,
	Post,
	UseInterceptors,
	UploadedFile,
	Delete,
	Body,
} from '@nestjs/common'
import {
	ApiBody,
	ApiConsumes,
	ApiCookieAuth,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor, } from '@nestjs/platform-express'
import { Express, } from 'express'
import { BookingReviewService, } from '../services/booking-review.service'
import { CreateEditRequestDto, } from '../dto/create-edit-request.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('booking-review',)
@ApiTags('Job review',)
@ApiCookieAuth('jwt',)
@UseGuards(ContractorAuthGuard,)
export class BookingReviewController {
	constructor(private readonly bookingReviewService: BookingReviewService,) {}

    @Post('mark-as-complete/:bookingId',)
	public async markAsComplete(
        @Param('bookingId', ParseUUIDPipe,) bookingId: string,
	) {
		return this.bookingReviewService.markBookingAsCompleted(bookingId,)
	}

    @Post('edit-request/:bookingId',)
    public async createEditRequest(
        @Param('bookingId', ParseUUIDPipe,) bookingId: string,
        @Body() dto: CreateEditRequestDto,
    ) {
    	return this.bookingReviewService.createEditRequest(bookingId, dto,)
    }

    @Post('upload-edit-request-material/:editRequestId',)
    @ApiParam({
    	name:        'editRequestId',
    	type:        String,
    	description: 'The id of the cgi photo uploaded by client',
    },)
    @ApiConsumes('multipart/form-data',)
    @ApiBody({
    	schema: {
    		type:       'object',
    		properties: {
    			material: {
    				description: 'Material file',
    				type:        'string',
    				format:      'binary',
    			},
    		},
    	},
    },)
    @UseInterceptors(FileInterceptor('material',),)
    public async uploadCGIMaterial(
        @Param('editRequestId', ParseUUIDPipe,) editRequestId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
    	return this.bookingReviewService.uploadEditRequestMaterial(
    		editRequestId,
    		file,
    	)
    }

    @Delete('delete-request-material/:id',)
    public async deleteUploadedMaterial(
        @Param('id', ParseUUIDPipe,) materialId: string,
    ) {
    	return this.bookingReviewService.deleteEditRequestMaterial(materialId,)
    }
}
