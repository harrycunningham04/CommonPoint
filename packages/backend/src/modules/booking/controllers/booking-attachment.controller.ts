/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UploadedFiles,
	UseFilters,
	UseInterceptors,
} from '@nestjs/common'
import { HttpExceptionFilter, } from 'src/shared/filters/http-exception.filter'
import { BookingAttachmentService, } from '../services/booking-attachment-service'
import { AnyFilesInterceptor, } from '@nestjs/platform-express'
import { diskStorage, } from 'multer'
import type { Attachment, } from '@prisma/client'
import type { Express, } from 'express'

@Controller('booking-attachment',)
@UseFilters(HttpExceptionFilter,)
export class BookingAttachmentController {
	constructor(private readonly attachmentService: BookingAttachmentService,) {}

  @Post('add-attachments/:bookingId',)
  @UseInterceptors(
  	AnyFilesInterceptor({
  		storage: diskStorage({
  			destination: './uploads',
  			filename:    (_req, file, cb,) => {
  				const filename = `${Date.now()}-${file.originalname}`
  				cb(null, filename,)
  			},
  		},),
  	},),
  )
	public async addBookingAttachments(
    @Param('bookingId',) bookingId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
	): Promise<Array<Attachment>> {
		const attachments = await this.attachmentService.createAttachment(
			files,
			bookingId,
		)
		return attachments
	}

    @Get('booking-attachments/:bookingId',)
  public async getAllBookingAttachments(@Param('bookingId',) bookingId:string,):Promise<Array<Attachment>> {
  	return this.attachmentService.getBookingAttachments(bookingId,)
  }

  @Delete('delete-attachment/:atachmentId',)
    public async deleteAttachmentById(@Param('atachmentId',) atachmentId:string,):Promise<{message:string}> {
    	return this.attachmentService.deleteAttachment(atachmentId,)
    }
}
