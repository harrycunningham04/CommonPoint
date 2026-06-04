import { ApiProperty, } from '@nestjs/swagger'
import { ContractorDisputeCategory, DisputeStatus, DisputeTheme, } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString, } from 'class-validator'

export class CreateContractorDisputeDto {
	constructor(data?:CreateContractorDisputeDto,) {
		if (data) {
			this.description = data.description
			this.bookingId = data.bookingId
			this.theme = data.theme
			this.category = data.category
			this.status = data.status
			this.contractorInvoiceId = data.contractorInvoiceId
			return
		}
		this.description = ''
		this.bookingId = ''
		this.theme = DisputeTheme.BOOKING
		this.category = ContractorDisputeCategory.CAPTURE_ISSUE
		this.status = DisputeStatus.IN_PROGRESS
	}

  @ApiProperty()
  @IsString()
	public description: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public bookingId: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contractorInvoiceId?: string

  @ApiProperty()
  @IsEnum(DisputeTheme,)
  public theme: DisputeTheme

  @ApiProperty()
  @IsEnum(ContractorDisputeCategory,)
  public category: ContractorDisputeCategory

  @ApiProperty()
  @IsEnum(DisputeStatus,)
  public status: DisputeStatus
}