import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, ValidateNested, } from 'class-validator'

export class ChangeNotificationDto {
  @ApiProperty()
  @IsOptional()
	public notificationId?: string | Array<string>
}
