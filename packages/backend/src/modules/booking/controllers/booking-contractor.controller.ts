/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, Query, UseGuards, Param, Body, Patch, ParseUUIDPipe, ParseEnumPipe, ParseIntPipe, Delete, } from '@nestjs/common'
import { BookingContractorService, } from '../services/booking-contractor.service'
import { User, } from 'src/shared/decorators/user.decorator'
import { ApiBody, ApiCookieAuth, ApiOkResponse, ApiParam, ApiQuery, ApiTags, } from '@nestjs/swagger'
import { GetContractorBookingDto, JobsDtoResponse, } from '../dto/get-contractor-booking.dto'
import { PagedResDto, } from 'src/shared/dto/paged-res.dto'
import { BookingStatus, MaterialTypeContent, type Booking, } from '@prisma/client'
import { GetJobsLocationDto, } from '../dto/get-jobs-location.dto'
import { GetJobsMapResponseDto, } from '../dto/jobs-map-response.dto'
import { GetBookingMobileDto, } from '../dto/get-booking-mobile.dto'
import { BookingEquipmentResDto, BookingMobileResDto, } from '../dto'
import { FloorplanChecklistDto, RawMaterialsDto, } from 'src/modules/raw-material/dto/floorplans.dto'
import { PageSearchOptionsDto, } from 'src/shared/dto/page-options.dto'
import { ReorderBookingsDto, } from '../dto/reorder-bookings.dto'
import { SingleBookingResDto, } from '../dto'
import type { UpdateStageAndStatusResDto, } from '../dto/update-booking.dto'
import { UpdateBookingStageDto, } from '../dto/update-booking.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { BookingContractorOffsiteListDto, } from '../dto/booking-contractor-off-site-list.dto'

@Controller('booking-contractor',)
@ApiTags('Contractor Jobs',)
@ApiCookieAuth('jwt',)
@UseGuards(ContractorAuthGuard,)
export class BookingContractorController {
	constructor(
        private readonly bookingContractorService : BookingContractorService,
	) {}

    @Get('contractor-jobs',)
    @ApiOkResponse({
    	description: 'Contractor list of jobs',
    	type:        [JobsDtoResponse,],
    },)
	public async getContractorJobs(@User() userId:string,@Query() query:GetContractorBookingDto,):Promise<PagedResDto<Booking>> {
		return this.bookingContractorService.getContractorBookings(userId,query,)
	}

	@Get('contractor-off-site',)
	@ApiOkResponse({
		description: 'Get contractor off site',
		type:        [BookingContractorOffsiteListDto,],
	},)
    public async getContractorOffSite(@User() userId:string,) : Promise<Array<BookingContractorOffsiteListDto>> {
    	return this.bookingContractorService.getContractorOffSite(userId,)
    }

	@Get('job-map',)
	@ApiOkResponse({
		description: 'Get jobs map',
		type:        [GetJobsMapResponseDto,],
	},)
	public async getContractorJobsMap(@User() userId:string,@Query() query:GetJobsLocationDto,) {
    	return this.bookingContractorService.getContractorJobMap(userId,query,)
	}

	@Get('mobile-jobs',)
	@ApiQuery({
		type: GetBookingMobileDto,
	},)
	@ApiOkResponse({
		description: 'Get mobile jobs',
		type:        [BookingMobileResDto,],
	},)
	public async getContractorBookingsMobile(@User() userId:string,@Query() query:GetBookingMobileDto,): Promise<Array<BookingMobileResDto>> {
		return this.bookingContractorService.getContractorBookingsMobile(userId,query,)
	}

	@Get('mobile-equipments',)
	@ApiQuery({
		type: GetBookingMobileDto,
	},)
	@ApiOkResponse({
		description: 'Get mobile equipments',
		type:        [BookingEquipmentResDto,],
	},)
	public async getContractorEquipment(@User() userId:string,@Query() query:GetBookingMobileDto,): Promise<Array<BookingEquipmentResDto>> {
		return this.bookingContractorService.getContractorEquipment(userId,query,)
	}

	@Get('search-by-completed-booking',)
	@ApiQuery({
		type: PageSearchOptionsDto,
	},)
	@ApiOkResponse({
		description: 'Search by completed booking',
		type:        PagedResDto<SingleBookingResDto>,
	},)
	public async searchByCompletedBooking(@User() userId:string,@Query() query:PageSearchOptionsDto,): Promise<PagedResDto<SingleBookingResDto>> {
		return this.bookingContractorService.searchByCompletedBooking(userId,query,)
	}

	@Get(':id',)
	@ApiOkResponse({
		description: 'Get single booking',
		type:        SingleBookingResDto,
	},)
	@ApiParam({
		name:        'id',
		type:        String,
		description: 'The id of the booking',
	},)
	public async getContractorBooking(@User() userId:string,@Param('id',) id:string,): Promise<SingleBookingResDto> {
		return this.bookingContractorService.getContractorBooking(userId,id,)
	}

	@Patch('raw-materials/:materialType',)
	@ApiBody({
		type: RawMaterialsDto,
	},)
	@ApiOkResponse({
		description: 'Add raw materials to booking',
		type:        RawMaterialsDto,
	},)
	@ApiBody({
		type: RawMaterialsDto,
	},)
	public async addRawMaterials(@User() userId:string,@Body() body:RawMaterialsDto, @Param('materialType', new ParseEnumPipe(MaterialTypeContent,),) materialType: MaterialTypeContent,): Promise<RawMaterialsDto> {
		return this.bookingContractorService.addRawMaterials(userId,body,materialType,)
	}

	@Patch('floorplan-checklist',)
	@ApiBody({
		type: FloorplanChecklistDto,
	},)
	@ApiOkResponse({
		description: 'Add floorplan checklist to booking',
		type:        FloorplanChecklistDto,
	},)
	public async addFloorplanChecklist(@User() userId:string,@Body() body:FloorplanChecklistDto,): Promise<FloorplanChecklistDto> {
		return this.bookingContractorService.addFloorplanChecklist(userId,body,)
	}

	@Patch('stage/:bookingId',)
	@ApiParam({
		name:        'bookingId',
		type:        String,
		description: 'The id of the booking',
	},)
	@ApiOkResponse({
		description: 'Booking status done',
	},)
	public async bookingDone(@User() contractorId:string,@Param('bookingId',) bookingId:string, @Body() body:UpdateBookingStageDto,): Promise<UpdateStageAndStatusResDto> {
		return this.bookingContractorService.contractorChangeStatus({
			contractorId,
			bookingId,
			status: body.statusType,
			date:   body.date,
		},)
	}

	@Patch('status/:id/:status',)
	@ApiParam({
		name:        'id',
		type:        String,
		description: 'The id of the booking',
	},)
	@ApiParam({
		name:        'status',
		enum:        BookingStatus,
		description: 'Status of booking',
	},)
	public async updateBookingStatus(
		@User() userId: string,
		@Param('id', ParseUUIDPipe,) id: string,
		@Param('status', new ParseEnumPipe(BookingStatus,),) status: BookingStatus,
	) {
		return this.bookingContractorService.updateBookingStatus(userId, id, status,)
	}

	@Patch('reorder',)
	public async reorderJobs(@Body() dto: ReorderBookingsDto,) {
		this.bookingContractorService.reorderJobs(dto.orderIds,)
	}

	@ApiParam({
		name:        'bookingId',
		type:        String,
		description: 'The id of the booking',
	},)
	@ApiParam({
		name:        'minutes',
		type:        Number,
		description: 'The minutes of running late',
	},)
	@ApiOkResponse({
		description: 'Running late',
	},)
	@Patch('running-late/:bookingId/:minutes',)
	public async runningLate(@Param('bookingId', ParseUUIDPipe,) bookingId: string, @Param('minutes', ParseIntPipe,) minutes: number,) {
		return this.bookingContractorService.runningLate(bookingId, minutes,)
	}

	@Delete('running-late/:bookingId',)
	@ApiParam({
		name:        'bookingId',
		type:        String,
		description: 'The id of the booking',
	},)
	@ApiOkResponse({
		description: 'Remove running late',
	},)
	public async removeRunningLate(@Param('bookingId', ParseUUIDPipe,) bookingId: string,) {
		return this.bookingContractorService.removeRunningLate(bookingId,)
	}

	@Patch('mark-materials-as-uploaded/:id',)
	@ApiParam({
		name:        'id',
		type:        String,
		description: 'The id of the booking',
	},)
	public async markMaterialsAsUploaded(
		@User() userId: string,
		@Param('id', ParseUUIDPipe,) id: string,
	) {
		return this.bookingContractorService.markRawMaterialsAsUploaded(userId, id,)
	}
}

