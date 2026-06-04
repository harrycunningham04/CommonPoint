import { Controller, Get, Query, UseGuards, } from '@nestjs/common'
import { CalculationService, } from './calculation.service'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import { User, } from 'src/shared/decorators/user.decorator'

@Controller('calculation',)
@UseGuards(ContractorAuthGuard,)
export class CalculationController {
	constructor(private readonly calculationService: CalculationService,) {}

  @Get('basic-contractor-payment',)
	public async calculateBasicContractorPayment(@Query('contractorId',) contractorId: string,@Query('startDate',) startDate: string,@Query('endDate',) endDate: string,): Promise<number> {
		return this.calculationService.calculateBasicContractorPayment({
			startDate:           new Date(startDate,),
			endDate:             new Date(endDate,),
			contractorId,
		},)
	}

	@Get('additional-contractor-payment',)
  public async calculateAdditionalContractorPayment(@Query('contractorId',) contractorId: string,@Query('startDate',) startDate: string,@Query('endDate',) endDate: string,): Promise<number> {
  	return this.calculationService.calculateBasicContractorPayment({
  		startDate:           new Date(startDate,),
  		endDate:             new Date(endDate,),
  		contractorId,
  	},)
  }

  @Get('booking-contractor-payment',)
  public async calculateBookingContractorPayment(@Query('bookingId',) bookingId: string,): Promise<number> {
    return this.calculationService.calculateBookingContractorPayment(bookingId,)
  }

}
