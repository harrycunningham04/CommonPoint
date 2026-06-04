/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Query,
} from '@nestjs/common'
import { ESoftService, } from './esoft.service'
import { ESoftWebhookParamsDto, } from './dto/webhook-params.dto'
import { ApiTags, } from '@nestjs/swagger'
import { GetAssetsDto, } from './dto/get-assets.dto'
@Controller('esoft',)
@ApiTags('ESOFT',)
export class ESoftController {
	constructor(private readonly eSoftService: ESoftService,) {}

    @Get('notification',)
	public async webhook(@Query() params: ESoftWebhookParamsDto,) {
		return this.eSoftService.webhook(params,)
	}

	@Get('get-all-orders',)
    public async getAllOrders() {
    	return this.eSoftService.getAllOrders()
    }

    @Get('get-edited-materials',)
	public async getEditedMaterials(
        @Query() query: GetAssetsDto,
	) {
    	return this.eSoftService.getEditedMaterials({
			reference:           query.reference,
			orderLineId:         Number(query.orderLineId,),
		},)
	}

	@Delete('cancel-order/:id',)
    public async cancelOrder(@Param('id', ParseUUIDPipe,) id: string,) {
    	return this.eSoftService.cancelOrder(id,)
    }
}
