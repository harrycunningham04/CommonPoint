import { Controller, Get, Query, UseGuards, } from '@nestjs/common'
import { ContractorAlgorithmService, } from './contractor-algorithm.service'
import { GetValidContractorsDto, GetValidContractorsForNewClientDto, GetValidContractorsReqDto, } from './dtos/get-valid-contractors.dto'
import { User, } from 'src/shared/decorators/user.decorator'
import type { ContractorSlotsResArray, IContractorSlotRes, } from '../booking/booking.types'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'

@Controller('contractor-algorithm',)
export class ContractorAlgorithmController {
	constructor(private readonly contractorAlgorithmService: ContractorAlgorithmService,) {}

	@Get('get-valid-contractors-for-office',)
	@UseGuards(ClientAuthGuard,)
	public async getValidContractorsForOffice(@Query() dto: GetValidContractorsDto,): Promise<ContractorSlotsResArray> {
		return this.contractorAlgorithmService.getThreeNearestContractorsWithAvailability(dto,)
	}

	@Get('get-valid-contractors-for-client',)
	@UseGuards(ClientAuthGuard,)
	public async getValidContractorsForClient(@User() userId: string, @Query() dto: GetValidContractorsReqDto,): Promise<ContractorSlotsResArray> {
		return this.contractorAlgorithmService.getThreeNearestContractorsWithAvailability({...dto, userIdOrOfficeId: userId,},)
	}

	@Get('get-first-three-cards-for-office',)
	@UseGuards(ClientAuthGuard,)
	public async getFirstThreeCardsForOffice(@Query() dto: GetValidContractorsDto,): Promise<Array<IContractorSlotRes>> {
		return this.contractorAlgorithmService.getThreeFirstSlots(dto,)
	}

	@Get('get-first-three-cards-for-client',)
	@UseGuards(ClientAuthGuard,)
	public async getFirstThreeCardsForClient(@User() userId: string, @Query() dto: GetValidContractorsReqDto,): Promise<Array<IContractorSlotRes>> {
		return this.contractorAlgorithmService.getThreeFirstSlots({...dto, userIdOrOfficeId: userId,},)
	}

	@Get('get-valid-contractors-for-new-client',)
	public async getValidContractorsForNewClient(@Query() dto: GetValidContractorsForNewClientDto,): Promise<ContractorSlotsResArray> {
		return this.contractorAlgorithmService.getThreeNearestContractorsWithAvailability(dto,)
	}

	@Get('get-first-three-cards-for-new-client',)
	public async getFirstThreeCardsForNewClient(@Query() dto: GetValidContractorsForNewClientDto,): Promise<Array<IContractorSlotRes>> {
		return this.contractorAlgorithmService.getThreeFirstSlots(dto,)
	}
}
