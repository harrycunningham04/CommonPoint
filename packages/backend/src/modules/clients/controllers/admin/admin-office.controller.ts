/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-mixed-spaces-and-tabs */
import { Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards, } from '@nestjs/common'
import { OfficeService, } from '../../services/office.service'
import { Prisma,} from '@prisma/client'
import type { Office, PaymentPreference, Worker, } from '@prisma/client'
import { User, } from 'src/shared/decorators/user.decorator'
import { OfficeResponseDto, } from '../../dto/office-response.dto'
import { OfficeUpdateDto, } from '../../dto/office-update-dto'
import { OfficeCreateDto, } from '../../dto/office-create-dto'
import { OfficeAvailableProductsAddDto, OfficeAvailableProductsResponseDto, OfficePackagesDto, OfficeProductsUpdateDto, OfficesDto, type IOfficeListReturn, } from '../../dto/office.dto'
import { WorkerService, } from '../../services/worker.service'
import { CreateWorkerDto, GetWorkersQueryDto, UpdateWorkerDto,  } from '../../dto/worker.dto'
import { WorkerResponseDto, } from '../../dto/worker-response.dto'
import { AdminAuthGuard, } from 'src/shared/guards/jwt.guard'

@UseGuards(AdminAuthGuard,)
@Controller('admin/office',)
export class AdminOfficeController {
	constructor(private readonly officeService: OfficeService, private readonly workerService: WorkerService,) {}

  @Get('packages-form',)
	public async getOfficePackagesForm(@Query() query: OfficePackagesDto,): Promise<Array<OfficeResponseDto>> {
  	return this.officeService.getOfficePackagesForm(query,)
	}

  @Get('client/:clientId',)
  public async getOfficesByClientId(@Param('clientId',) clientId: string,): Promise<Array<OfficeResponseDto>> {
  	return this.officeService.getOfficesByClientId(clientId,)
  }

  @Get()
  public async getOffices(@Query() query: OfficesDto,): Promise<IOfficeListReturn> {
  	return this.officeService.getFilteredOffices(query,)
  }

  @Get('office-packages/:officeId',)
  public async getOfficePackages(@Param('officeId',) officeId:string,) {
  	return this.officeService.getOfficePackages(officeId,)
  }

  @Get('office-products/:officeId',)
  public async getOfficeProfucts(@Param('officeId',) officeId:string,) {
  	return this.officeService.getOfficeProducts(officeId,)
  }

  @Get('/:officeId',)
  public async getOfficeById(@Param('officeId',) officeId:string,):Promise<Office | null> {
  	return this.officeService.getSingleOfficeById(officeId,)
  }

  @Post()
  public async createOffice(@Body() data: OfficeCreateDto,): Promise<OfficeResponseDto> {
  	return this.officeService.createOffice(data,)
  }

  @Delete(':id',)
  public async deleteOffice(@Param('id',) id: string,): Promise<Office> {
  	return this.officeService.deleteOffice(id,)
  }

  @Patch(':id',)
  public async updateOfficePartial(@Param('id',) id: string,@Body() data: OfficeUpdateDto,): Promise<OfficeResponseDto> {
  	return this.officeService.updateOfficePartial(id, data,)
  }

  @Get(':officeId/preferences',)
  public async getPreferences(@Param('officeId',) officeId: string,) {
  	return this.officeService.getPreferences(officeId,)
  }

  @Post(':officeId/preferences',)
  public async addPreference(@Param('officeId',) officeId: string, @Body() data: Omit<Prisma.PreferenceCreateInput, 'office'>,) {
  	return this.officeService.addPreference(officeId, data,)
  }

  @Patch(':officeId/preferences/:preferenceId',)
  public async updatePreference(@Param('officeId',) officeId: string, @Param('preferenceId',) preferenceId: string, @Body() data: Partial<Prisma.PreferenceUpdateInput>,) {
  	return this.officeService.updatePreference(officeId, preferenceId, data,)
  }

  @Delete(':officeId/preferences/:preferenceId',)
  public async deletePreference(@Param('officeId',) officeId: string, @Param('preferenceId',) preferenceId: string,) {
  	return this.officeService.deletePreference(officeId, preferenceId,)
  }

  @Get(':officeId/payment-preferences',)
  public async getPaymentPreferences(@Param('officeId',) officeId: string,): Promise<PaymentPreference> {
  	return this.officeService.getPaymentPreferences(officeId,)
  }

  @Get(':officeId/workers',)
  public async getWorkers(@Param('officeId',) officeId: string, @Query() query: GetWorkersQueryDto,): Promise<Array<WorkerResponseDto>> {
  	const workers = await this.workerService.getWorkers({ ...query, officeId, limit: 30,} as unknown as GetWorkersQueryDto,)
  	return workers.data
  }

  @Post(':officeId/workers',)
  public async createWorker(@Param('officeId',) officeId: string, @Body() data: CreateWorkerDto,): Promise<WorkerResponseDto> {
  	return this.workerService.createWorker({ ...data, officeIds: [officeId,], } as unknown as CreateWorkerDto,)
  }

  @Patch(':officeId/workers/:workerId',)
  public async updateWorker(@Param('officeId',) officeId: string, @Param('workerId',) workerId: string, @Body() data: UpdateWorkerDto,): Promise<WorkerResponseDto> {
  	return this.workerService.updateWorker(workerId, { ...data, officeIds: [officeId,], } as unknown as UpdateWorkerDto,)
  }

  @Get('b2b-office-select/:clientId',)
  public async getB2bClientsSelect(@Param('clientId',) clientId: string,): Promise<Array<{ id: string, title: string, }>> {
  	return this.officeService.getOfficesByB2BClient(clientId,)
  }

  @Get(':officeId/available-products',)
  public async getAvailableProducts(@Param('officeId',) officeId: string,): Promise<OfficeAvailableProductsResponseDto> {
  	return this.officeService.getAvailableProducts(officeId,)
  }

  @Post(':officeId/available-products',)
  public async addAvailableProduct(@Param('officeId',) officeId: string, @Body() data: OfficeAvailableProductsAddDto,): Promise<void> {
  	return this.officeService.addAvailableProduct(officeId, data,)
  }

  @Delete(':officeId/available-products/:productId',)
  public async removeAvailableProduct(@Param('officeId',) officeId: string, @Param('productId',) productId: string,): Promise<void> {
  	return this.officeService.removeAvailableProduct(officeId, productId,)
  }

  @Patch(':officeId/office-products',)
  public async updateOfficeProductsPrices(@Param('officeId',) officeId: string, @Body() data: OfficeProductsUpdateDto,): Promise<void> {
  	return this.officeService.updateOfficeProductsPrices(officeId, data,)
  }
}