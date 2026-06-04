import { BadRequestException, Controller, Get, Query, UseGuards, } from '@nestjs/common'
import { StripeService, } from './stripe.service'
import { StripeCallbackDto, } from './dto/callback.dto'
import { ContractorAuthGuard, } from 'src/shared/guards/jwt.guard'
import Stripe from 'stripe'

@Controller('stripe',)
export class StripeController {
	constructor(
    private readonly stripeService: StripeService,
	) {}

  @Get('callback',)
	@UseGuards(ContractorAuthGuard,)
	public async stripeCallback(
		@Query() query: StripeCallbackDto,
	): Promise<{
		url: string
	}> {
		return this.stripeService.callback(query.code,)
	}

  @Get('callback-mobile',)
	@UseGuards(ContractorAuthGuard,)
  public async stripeCallbackMobile(
		@Query() query: StripeCallbackDto,
  ): Promise<{
		url: string
	}> {
  	return this.stripeService.callback(query.code, true,)
  }

	@Get('first-onboarding-link',)
  public async firstOnboardingLink(): Promise<{
		url: string
	}> {
  	return {
  		url: this.stripeService.getFirstOnboardingLink(),
  	}
  }

	@Get('transfer',)
	public async transfer(): Promise<void> {
		return this.stripeService.transfer()
	}

	@Get('payout',)
	public async payout(): Promise<Stripe.Response<Stripe.Payout>> {
		return this.stripeService.payoutToContractor('acct_1RWc7wCAnc1yaIsG', 100,)
	}
}
