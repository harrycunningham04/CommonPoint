import { Controller, Get, Param, Query, UseGuards, } from '@nestjs/common'
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, } from '@nestjs/swagger'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import { PagedResDto, PagedResWithCountDto, } from 'src/shared/dto/paged-res.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import { RolesGuard, } from 'src/shared/guards/roles.guard'
import { Roles, } from 'src/shared/roles.decorator'
import { ReviewService, } from './review.service'
import { ReviewOptionsDto, } from './dto/review.dto'
import type { ReviewAdminDto, } from './dto/review.dto'
import type { ReviewGroupedDto, } from './dto/review.dto'
import { AdminAuthGuard, ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('review',)
@ApiTags('Review',)
@ApiCookieAuth('jwt',)
export class ReviewController {
	constructor(private readonly reviewService: ReviewService,) {}

  @UseGuards(RolesGuard,)
  @Roles(1,)
  @UseGuards(AdminAuthGuard,)
  @Get('admin/:contractorId',)
  @ApiOperation({ summary: 'Get reviews by contractor id', description: 'Get reviews by contractor id', },)
  @ApiQuery({ type: PageOptionsDto, },)
  @ApiOkResponse({ type: PagedResWithCountDto<ReviewGroupedDto>, },)
	public async reviewsByContractorId(@Query() query: PageOptionsDto, @Param('contractorId',) contractorId: string,): Promise<PagedResDto<ReviewAdminDto>> {
		return this.reviewService.reviewsAdmin({
			booking: {
				contractorId,
			},
		}, query,)
	}

  @UseGuards(RolesGuard,)
  @Roles(1,)
  @UseGuards(AdminAuthGuard,)
  @Get('admin/by-booking/:bookingId',)
  @ApiOperation({ summary: 'Get reviews by booking id', description: 'Get reviews by booking id', },)
  @ApiQuery({ type: PageOptionsDto, },)
  @ApiOkResponse({ type: PagedResWithCountDto<ReviewGroupedDto>, },)
  public async reviewsByBookingId(@Query() query: PageOptionsDto, @Param('bookingId',) bookingId: string,): Promise<PagedResDto<ReviewAdminDto>> {
  	return this.reviewService.reviewsAdmin({
  		bookingId,
  	}, query,)
  }

  @Get()
  @UseGuards(ContractorAuthGuard,)
  @ApiOperation({ summary: 'Get reviews', description: 'Get reviews for a contractor', },)
  @ApiQuery({ type: ReviewOptionsDto, },)
  @ApiOkResponse({ type: PagedResWithCountDto<ReviewGroupedDto>, },)
  public async reviews(@Query() query: ReviewOptionsDto, @User() userId: string,): Promise<PagedResWithCountDto<ReviewGroupedDto>> {
  	return this.reviewService.reviews(userId, query,)
  }

  @Get(':bookingId',)
  @UseGuards(ContractorAuthGuard,)
  @ApiOperation({ summary: 'Get reviews by booking id', description: 'Get reviews by booking id', },)
  @ApiQuery({ type: PageOptionsDto, },)
  @ApiOkResponse({ type: PagedResDto<ReviewGroupedDto>, },)
  public async reviewByBookingId(@Query() query: PageOptionsDto, @Param('bookingId',) bookingId: string,): Promise<PagedResDto<ReviewGroupedDto>> {
  	return this.reviewService.reviewByBookingId(bookingId, query,)
  }
}
