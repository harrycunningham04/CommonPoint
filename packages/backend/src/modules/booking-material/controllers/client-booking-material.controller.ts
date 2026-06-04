import { Controller, Get, Param, Patch, Query, UseGuards, } from '@nestjs/common'
import { ClientAuthGuard, } from 'src/shared/guards/jwt.guard'
import { BookingMaterialService, } from '../services/booking-materials.service'
import { ApiOkResponse, } from '@nestjs/swagger'
import { BookingClientMaterialsService, } from '../services/booking-client-materials.service'
import { BookingMaterialsQueryDto, BookingMaterialsQueryDtoClient, } from '../dto/booking-get-materials.dto'
import type { ClientBookingMaterialDto, } from '../dto/get-client-materials.dto'
import { DownloadClientMaterialsDtoQuery, } from '../dto/download-client-materials.dto'
@Controller('client-booking-material',)
@UseGuards(ClientAuthGuard,)
export class ClientBookingMaterialController {
	constructor(private readonly bookingClientMaterialsService: BookingClientMaterialsService,) {}

    @Get('uploaded-materials/:bookingGroupId',)
    @ApiOkResponse({
    	description: 'Get list of uploaded materials for a booking',
    },)
	public async getBookingMaterials(@Param('bookingGroupId',) bookingGroupId : string, @Query() query: BookingMaterialsQueryDtoClient,):Promise<ClientBookingMaterialDto> {
		return this.bookingClientMaterialsService.getBookingMaterials(bookingGroupId, query,)
	}

	@Patch('change-hero-shoot/:materialId',)
	public async changeHeroShoot(@Param('materialId',) materialId: string,):Promise<void> {
		return this.bookingClientMaterialsService.changeHeroShoot(materialId,)
	}

	@Get('download-all-materials/:bookingGroupId',)
	public async downloadAllMaterials(@Param('bookingGroupId',) bookingGroupId: string, @Query() query: DownloadClientMaterialsDtoQuery,):Promise<{ urls: Array<string>, fileNames: Array<string>, }> {
		return this.bookingClientMaterialsService.downloadAllMaterials(bookingGroupId, query,)
	}
}
