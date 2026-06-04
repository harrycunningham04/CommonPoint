import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UseGuards,
} from '@nestjs/common'
import { OnesignalService, } from './onesignal.service'
import { ApiTags, ApiOperation, ApiOkResponse, } from '@nestjs/swagger'
import { ContractorAuthGuard, } from '../../shared/guards/jwt.guard'
import type { IOneSignalReturn, } from './types/notifications-expire.enum'
import { User, } from 'src/shared/decorators/user.decorator'

@ApiTags('Onesignal',)
@Controller('onesignal',)
@UseGuards(ContractorAuthGuard,)
export class OnesignalController {
	constructor(private readonly oneSignalService: OnesignalService,) {}

  @ApiOperation({
  	summary: 'Get onesignal mute status',
  },)
  @ApiOkResponse({
  	description: 'Returns true if notifications are muted, false otherwise',
  	type:        Boolean,
  },)
  @Get('mute-status',)
	public async getMuteStatus(
    @User() userId: string,
	): Promise<IOneSignalReturn> {
		return this.oneSignalService.getMuteStatus(userId,)
	}

  @ApiOperation({
  	summary: 'Attach onesignal SubscriptionId to user',
  },)
  @Post('attach-id/:id',)
  public async attachId(
    @User() userId: string,
    @Param('id',) id: string,
  ): Promise<void> {
  	return this.oneSignalService.attachIdToUser(userId, id,)
  }

  @ApiOperation({
  	summary: 'Remove onesignal SubscriptionId from user',
  },)
  @Delete('remove-id/:id',)
  public async removeId(
    @User() userId: string,
    @Param('id',) id: string,
  ): Promise<void> {
  	return this.oneSignalService.removeIdFromUser(userId, id,)
  }

  @ApiOperation({
  	summary: 'Disable onesignal notifications for user device',
  },)
  @Get('mute',)
  public async muteId(@User() userId: string,): Promise<IOneSignalReturn> {
  	return this.oneSignalService.muteNotificationsOnDevice(userId,)
  }

  @ApiOperation({
  	summary: 'Enable onesignal notifications for user device',
  },)
  @Get('unmute',)
  public async unmuteId(@User() userId: string,): Promise<IOneSignalReturn> {
  	return this.oneSignalService.unmuteNotificationsOnDevice(userId,)
  }
}
