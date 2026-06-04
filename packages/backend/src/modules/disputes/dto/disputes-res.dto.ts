/* eslint-disable no-underscore-dangle */
import type { Prisma,} from '@prisma/client'
import { ContractorDisputeCategory, ReportType,} from '@prisma/client'
import { DisputeStatus, DisputeTheme, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, } from 'class-validator'
import { LocationVariantsEnum, } from '../disputes.type'
import { SolutionVariantsEnum, } from '../disputes.type'
import { ReasonVariantsEnum, } from '../disputes.type'
import { ApiProperty, } from '@nestjs/swagger'

export enum DisputeResType {
  GROUPED = 'GROUPED',
  SINGLE = 'SINGLE',
}

export interface IBasicDispute {
  id: string,
  theme: DisputeTheme,
  status: DisputeStatus,
  address: string,
  category: ContractorDisputeCategory,
  description: string,

	report: ReportResDto | null
}

export interface IGroupedDispute {
  type: DisputeResType,
  address: string,
  count: number,
  created_at: Date,
  details?: IBasicDispute,
}

export class ReportResDto {
	constructor(data?: ReportResDto,) {
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
		enum:    ReportType,
		example: ReportType.photo,
	},)
	@IsEnum(ReportType,)
	public type: ReportType

	@ApiProperty({
		enum:    LocationVariantsEnum,
		example: LocationVariantsEnum.WHOLE_PROPERTY,
	},)
	@IsEnum(LocationVariantsEnum,)
	public location: string

	@ApiProperty({
		enum:    ReasonVariantsEnum,
		example: ReasonVariantsEnum.VERY_MESSY,
	},)
	@IsEnum(ReasonVariantsEnum,)
	public problem: string

	@ApiProperty({
		enum:    SolutionVariantsEnum,
		example: SolutionVariantsEnum.DID_OUR_BEST,
	},)
	@IsEnum(SolutionVariantsEnum,)
	public solution: string

	@ApiProperty({
		example: [],
	},)
	@IsArray()
	@IsString({
		each: true,
	},)
	public attachments: Array<string>

	@ApiProperty({
		example: false,
	},)
	@IsBoolean()
	public isCancellation: boolean
}

export class SingleDisputeResDto {
	constructor(data?: IBasicDispute,) {
		if (data) {
			this.id = data.id
			this.theme = data.theme
			this.status = data.status
			this.category = data.category
			this.description = data.description
			this.address = data.address
			this.report = data.report
			return
		}
		this.id = ''
		this.theme = DisputeTheme.BOOKING
		this.status = DisputeStatus.IN_PROGRESS
		this.category = ContractorDisputeCategory.INVOICE_DISPUTE
		this.description = ''
		this.address = ''
		this.report = null
	}

  @IsUUID()
  @IsNotEmpty()
  @IsString()
	public	id: string

  @IsEnum(DisputeTheme,)
  public	theme: DisputeTheme

  @IsEnum(DisputeStatus,)
  public	status: DisputeStatus

  @IsEnum(ContractorDisputeCategory,)
  public	category: ContractorDisputeCategory

  @IsString()
  @IsNotEmpty()
  public	address: string

  @IsString()
  @IsNotEmpty()
  public	description: string

	@ApiProperty({
		type: ReportResDto,
	},)
	@ValidateNested()
	@Type(() => {
		return ReportResDto
	},)
	@IsOptional()
  public report: ReportResDto | null
}

export class DisputeResDto {
	constructor(data?: IGroupedDispute,) {
		if (data) {
			this.type = data.type
			this.address = data.address
			this.count = data.count
			this.created_at = data.created_at
			this.details = data.type === DisputeResType.SINGLE ?
				new SingleDisputeResDto(data.details,) :
				undefined
			return
		}
		this.type = DisputeResType.SINGLE
		this.address = ''
		this.count = 0
		this.created_at = new Date()
	}

  @IsEnum(DisputeResType,)
	public	type: DisputeResType

  @IsString()
  @IsNotEmpty()
  public	address: string

  @IsNumber()
  @Type(() => {
  	return Number
  },)
  public	count: number

  @IsDate()
  @Type(() => {
  	return Date
  },)
  public	created_at: Date

  @ValidateNested()
  @Type(() => {
  	return SingleDisputeResDto
  },)
  @IsOptional()
  public	details?: SingleDisputeResDto

  public static castSingleArray(disputes: Array<IBasicDispute & {
		created_at: Date | null;
	}>,): Array<DisputeResDto> {
  	return disputes.map((dispute,) => {
  		return new DisputeResDto({
  			type:       DisputeResType.SINGLE,
  			address:    dispute.address,
  			count:      1,
  			created_at: dispute.created_at ?? new Date(),
  			details:    new SingleDisputeResDto(dispute,),
  		},)
  	},)
  }

  public static castGroupedArray(disputesWithManyResult: Array<IBasicDispute>, disputes: Array<Prisma.PickEnumerable<Prisma.ContractorDisputeGroupByOutputType, Array<'address'>> & {
    _count: {
        id: number;
    };
    _max: {
        created_at: Date | null;
    };
}>,): Array<DisputeResDto> {
  	return disputes.map((dispute,) => {
  		const searchedDispute = disputesWithManyResult.find((it,) => {
  			return it.address === dispute.address
  		},)
  		if (dispute._count.id > 1 || !searchedDispute) {
  		return new DisputeResDto({
  			type:       DisputeResType.GROUPED,
  			address:    dispute.address,
  			count:      dispute._count.id,
  			created_at: dispute._max.created_at ?? new Date(),
  		},)
  		}

  		return new DisputeResDto({
  			type:       DisputeResType.SINGLE,
  			address:    dispute.address,
  			count:      dispute._count.id,
  			created_at: dispute._max.created_at ?? new Date(),
  			details:    new SingleDisputeResDto({
  				...searchedDispute,
  				report: searchedDispute.report ?
  					new ReportResDto(searchedDispute.report,) :
  					null,
  			},),
  		},)
  	},)
  }
}

export class AdminDisputeResDto extends DisputeResDto {
	constructor(data?: AdminDisputeResDto,) {
		super(data,)
		if (data) {
			this.contractorName = data.contractorName
			this.contractorPhone = data.contractorPhone
			return
		}
		this.contractorName = ''
	}

	@IsString()
	@IsNotEmpty()
	public contractorName: string

	@IsString()
	@IsOptional()
	public contractorPhone?: string

	public static castSingleArray(disputes: Array<IBasicDispute & {
		created_at: Date | null;
		contractor: {
			name: string;
			surname: string;
			phone: string | null;
		};
	}>,): Array<AdminDisputeResDto> {
		return disputes.map((dispute,) => {
  		return new AdminDisputeResDto({
  			type:            DisputeResType.SINGLE,
  			address:         dispute.address,
  			count:           1,
  			created_at:      dispute.created_at ?? new Date(),
  			details:         new SingleDisputeResDto(dispute,),
  			contractorName:  dispute.contractor.name,
  			contractorPhone: dispute.contractor.phone ?? undefined,
  		},)
  	},)
	}
}