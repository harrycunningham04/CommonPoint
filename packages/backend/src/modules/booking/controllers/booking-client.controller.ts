/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { BookingClientService, } from '../services/booking-client.service'
import { GetBookingClientDto, } from '../dto/get-client-booking.dto'
import { Booking, BookingCGIClientPhotos, BookingReview, } from '@prisma/client'
import { ChangeBookingDto, } from '../dto/change-booking.dto'
import { VoteBookingDto, } from '../dto/vote-booking.dto'
import { AnyFilesInterceptor, } from '@nestjs/platform-express'
import { diskStorage, } from 'multer'
import { Express, } from 'express'
import { processFilesAndBody, } from '../utils/group-cgi-photos'
import { CreateReviewDto, } from '../dto/create-booking-review.dto'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { User, } from 'src/shared/decorators/user.decorator'
import { BookingClientDetailsDto, } from '../dto/booking-client-details.dto'
import { BookingClientCreationDto, DraftBookingDto, } from '../dto/booking-client-creation.dto'
import { ApiBody, } from '@nestjs/swagger'
import { AdditionalPhotoCheckoutDto, CreateAdditionalBookingDto, GetAdditionalBookingCheckoutDto, } from '../dto/booking-additional.dto'
import { CreateClientEditRequestDto } from '../dto/create-edit-request.dto'
import { BookingReviewService } from '../services/booking-review.service'
@Controller('booking-client',)
@UseGuards(ClientAuthGuard,)
export class BookingClientController {
	constructor(private readonly bookingService: BookingClientService,
    private readonly bookingReviewService: BookingReviewService,
	) {}

  @Get('bookings',)
	public async getBookings(
    @User() clientId:string,
    @Query() query: GetBookingClientDto,
	) {
		const bookings =	await this.bookingService.getBookings(clientId, query,)

		return bookings
	}

  @Get('bookings-office/:officeId',)
  public async getBookingsByOffice(
    @Param('officeId',) officeId: string,
    @Query() query: GetBookingClientDto,
  ) {
  	const bookings = await this.bookingService.getBookings(
  		officeId,
  		query,
  		true,
  	)

  	return bookings.data
  }

  @Get('booking-payment-session/:bookingId',)
  public async getPaymentSession(@Param('bookingId',) bookingId: string,): Promise<{
    url: string
  }> {
  	return this.bookingService.getBookingPaymentSession(bookingId,)
  }

  @Post('',)
  public async createBooking(@Body() body: BookingClientCreationDto, @User() userId: string,): Promise<{
    url: string;
    bookingId:string
  }> {
  	return this.bookingService.createBookingAndReturnRedirectUrl({...body, userId,},)
  }

  @Post('draft',)
  @ApiBody({
  	type: DraftBookingDto,
  },)
  public async createDraftBooking(@Body() body: DraftBookingDto,): Promise<{
    url: string;
    id:string
  }> {
  	return this.bookingService.createBookingDraftAndReturnRedirectUrl(body,)
  }

  @Get('draft/payment/:bookingDraftId',)
  public async createDraftBookingPayment(@Param('bookingDraftId',) bookingDraftId: string,): Promise<{
    url: string;
    id:string
  }> {
  	return this.bookingService.createBookingDraftPayment({
  		bookingDraftId,
  	},)
  }

  @UseGuards(ClientAuthGuard,)
  @Patch('update/:bookingId',)
  public async updateBookingClient(
    @Param('bookingId',) bookingId: string,
    @Body() body: ChangeBookingDto,
  ): Promise<Booking> {
  	return this.bookingService.updateBooking(bookingId, body,)
  }

  @Patch('upload-cgi/:bookingId',)
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
  public async uploadCGIExamples(
    @Param('bookingId',) bookingId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ): Promise<void> {
  	const groupedPhotos = processFilesAndBody(files,body,)

  	const uploadedPhotos = await this.bookingService.uploadAllFiles(groupedPhotos,)

  	await this.bookingService.updateBookingCGI(uploadedPhotos,bookingId,)
  }

  @Patch('upload-cgi-draft/:bookingId',)
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
  public async uploadCGIDraftExamples(
    @Param('bookingId',) bookingId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ): Promise<void> {
  	const groupedPhotos = processFilesAndBody(files,body,)

  	const uploadedPhotos = await this.bookingService.uploadAllFiles(groupedPhotos,)
  	await this.bookingService.updateBookingDraftCGI(uploadedPhotos,bookingId,)
  }

  @UseGuards(ClientAuthGuard,)
  @Get('single-booking/:bookingId',)
  public async getSingleBooking(
    @Param('bookingId',) bookingId: string,
  ): Promise<Booking | null> {
  	return this.bookingService.findBooking(bookingId,)
  }

  @UseGuards(ClientAuthGuard,)
  @Post('booking-review/:bookingGroupId',)
  public async createBookingReview(
    @Param('bookingGroupId',) bookingGroupId:string,
    @Body() data:CreateReviewDto,
  ):Promise<BookingReview> {
  	const createdReview = await this.bookingService.createNewBookingReview(data,bookingGroupId,)

  	return createdReview
  }

  @UseGuards(ClientAuthGuard,)
  @Post('material/like',)
  public async voteMaterial(
    @Body() body: VoteBookingDto,
  ): Promise<{ message: string }> {
  	return this.bookingService.handleLikeMaterial(body,)
  }

  @UseGuards(ClientAuthGuard,)
  @Patch('material/:materialId',)
  public async updateMaterial(
    @Param('materialId',) materialId: string,
  ): Promise<void> {
  	return this.bookingService.changeHeroShoot(materialId,)
  }

  @Patch('booking/:bookingGroupId',)
  public async updateBooking(
    @Param('bookingGroupId',) bookingGroupId: string,
    @Body() body: ChangeBookingDto,
  ): Promise<Booking | null> {
  	return this.bookingService.updateBookingByGroupId(bookingGroupId, body,)
  }

  @Get('booking/:bookingGroupId',)
  public async getBookingInfoByGroupId(
    @Param('bookingGroupId',) bookingGroupId: string,
  ): Promise<BookingClientDetailsDto> {
  	return this.bookingService.getBookingInfoByGroupId(bookingGroupId,)
  }

  @Post('booking-additional-create',)
  public async createAdditionalBooking(
    @Body() body: CreateAdditionalBookingDto,
  ): Promise<{
    url: string,
    id: string,
  }> {
  	return this.bookingService.createAdditionalBooking(body,)
  }

  @Get('booking-additional-checkout/:bookingGroupId',)
  public async getAdditionalBookingCheckout(
    @Param('bookingGroupId',) bookingGroupId: string,
    @Query() query: GetAdditionalBookingCheckoutDto,
  ): Promise<AdditionalPhotoCheckoutDto> {
  	return this.bookingService.getAdditionalBookingCheckoutInfo(bookingGroupId, query,)
  }

  @Post('booking-client-edit-request',)
  public async createBookingClientEditRequest(
    @User() clientId: string,
    @Body() body: CreateClientEditRequestDto,
  ): Promise<void> {
    return this.bookingReviewService.createClientEditRequest(clientId, body,)
  }

  @Patch('cancel-booking/:bookingGroupId',)
  public async cancelBooking(
    @Param('bookingGroupId',) bookingGroupId: string,
  ): Promise<void> {
    return this.bookingService.cancelBooking(bookingGroupId,)
  }

  @Get('check-if-some-booking-is-not-paid',)
  public async checkIfSomeBookingIsNotPaid(@User() clientId: string,): Promise<boolean> {
    return this.bookingService.checkIfSomeBookingIsNotPaid(clientId,)
  }
}
