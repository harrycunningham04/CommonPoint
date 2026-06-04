import { ApiProperty, } from '@nestjs/swagger'
import { ReportType, } from '@prisma/client'
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, } from 'class-validator'
import { LocationVariantsEnum, ReasonVariantsEnum, SolutionVariantsEnum, } from '../disputes.type'
import { CreateContractorDisputeDto, } from './create-contractor-dispute.dto'

export class GenericVariantsDto<T extends string> {
	constructor(data?: GenericVariantsDto<T>,) {
		if (data) {
			this.key = data.key
			this.contractorName = data.contractorName
			this.clientName = data.clientName
			this.reportType = data.reportType
			return
		}
		this.key = '' as T
		this.contractorName = ''
		this.clientName = ''
		this.reportType = []
	}

  @ApiProperty({
  	description: 'The key of the variant',
  	example:     'KEY',
  },)
	public key: T

  @ApiProperty({
  	description: 'The contractor view of the variant',
  	example:     'CONTRACTOR_NAME',
  },)
  @IsString()
  public contractorName: string

  @ApiProperty({
  	description: 'The client view of the variant',
  	example:     'CLIENT_NAME',
  },)
  @IsString()
  public clientName: string

  @ApiProperty({
  	description: 'The report type of the variant',
  	example:     'REPORT_TYPE',
  },)
  @IsArray()
  @IsEnum(ReportType, {
  	each: true,
  },)
  public reportType: Array<ReportType>
}

export class CreateReportDto extends CreateContractorDisputeDto {
	constructor(data?: CreateReportDto,) {
		super(data,)
		if (data) {
			this.type = data.type
			this.location = data.location
			this.problem = data.problem
			this.solution = data.solution
			this.attachments = data.attachments
			this.isCancellation = data.isCancellation
			return
		}
		this.type = ReportType.photo
		this.location = LocationVariantsEnum.WHOLE_PROPERTY
		this.problem = ReasonVariantsEnum.VERY_MESSY
		this.solution = SolutionVariantsEnum.DID_OUR_BEST
		this.attachments = []
		this.isCancellation = false
	}

  @ApiProperty({
  	description: 'The type of the report',
  	example:     'photo',
  	enum:        ReportType,
  },)
  @IsEnum(ReportType,)
  @IsNotEmpty()
	public type: ReportType

  @ApiProperty({
  	description: 'The location of the report',
  	example:     'LOCATION',
  	enum:        LocationVariantsEnum,
  },)
  @IsEnum(LocationVariantsEnum,)
  @IsNotEmpty()
  public location: LocationVariantsEnum

  @ApiProperty({
  	description: 'The problem of the report',
  	example:     'PROBLEM',
  	enum:        ReasonVariantsEnum,
  },)
  @IsEnum(ReasonVariantsEnum,)
  @IsNotEmpty()
  public problem: ReasonVariantsEnum

  @ApiProperty({
  	description: 'The solution of the report',
  	example:     'SOLUTION',
  	enum:        SolutionVariantsEnum,
  },)
  @IsEnum(SolutionVariantsEnum,)
  @IsNotEmpty()
  public solution: SolutionVariantsEnum

  @ApiProperty({
  	description: 'The attachments of the report',
  	example:     'ATTACHMENTS',
  },)
  @IsArray()
	@IsString({
		each: true,
	},)
  public attachments: Array<string>

	@ApiProperty({
		description: 'The cancellation of the report',
		example:     'CANCELLATION',
	},)
	@IsBoolean()
  public isCancellation: boolean
}