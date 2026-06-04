import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, } from 'class-validator'

export class StatisticDto {
  @ApiProperty()
  @IsString()
	public month!: string

  @ApiProperty()
  @IsString()
  public year!: string
}

export class StatisticContractor extends StatisticDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
	public contractorId?: string
}

export class StatisticBookingClient extends StatisticDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
	public clientId?: string
}

export class StatisticRegion extends StatisticDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
	public regionId?: string
}