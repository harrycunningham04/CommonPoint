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
} from '@nestjs/common'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import {
	ApiBody,
	ApiConsumes,
	ApiCookieAuth,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor, } from '@nestjs/platform-express'
import { Express, } from 'express'
import { BookingCGIService, } from '../services/booking-cgi.service'

@Controller('booking-cgi',)
@ApiTags('CGI Job',)
@ApiCookieAuth('jwt',)
@UseGuards(ContractorAuthGuard,)
export class BookingCGIController {
	constructor(private readonly bookingCgiService: BookingCGIService,) {}

    @Post('upload-material/:bookingCGIPhotoId',)
    @ApiParam({
    	name:        'bookingCGIPhotoId',
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
        @Param('bookingCGIPhotoId', ParseUUIDPipe,) clientPhotoId: string,
        @UploadedFile() file: Express.Multer.File,
	) {
		return this.bookingCgiService.uploadCGIMaterial(clientPhotoId, file,)
	}

	@Delete('material/:id',)
    public async deleteUploadedMaterial(@Param('id', ParseUUIDPipe,) materialId: string,) {
    	return this.bookingCgiService.deleteMaterial(materialId,)
    }
}
