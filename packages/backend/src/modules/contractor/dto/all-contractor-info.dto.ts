import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, } from 'class-validator'
import { SkillsAndCertificationsResDto, } from './skills-and-certifications.dto'
import type { $Enums, Contractor,} from '@prisma/client'
import { ContractorTransportation, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { ApiProperty, } from '@nestjs/swagger'
import { ContractorLocationDetailsDto, } from './edit-contractor-location.dto'

export class AllContractorInfoResDto extends SkillsAndCertificationsResDto {
	constructor(data?: AllContractorInfoResDto,) {
		super(data,)
		if (data) {
			this.id = data.id
			this.avatar = data.avatar
			this.name = data.name
			this.surname = data.surname
			this.transportation = data.transportation
			this.phone = data.phone
			this.email = data.email
			this.address = data.address
			this.radius = data.radius
			this.regionNames = data.regionNames
			this.placeId = data.placeId
			this.longitude = data.longitude
			this.latitude = data.latitude
			this.locationDetails = data.locationDetails
			this.isAvailabilitySet = data.isAvailabilitySet
			this.isProfileCreated = data.isProfileCreated
			return
		}
		this.id = ''
		this.avatar = ''
		this.name = ''
		this.surname = ''
		this.transportation = []
		this.phone = ''
		this.email = ''
		this.address = ''
		this.radius = 0
		this.regionNames = []
		this.placeId = ''
		this.longitude = 0
		this.latitude = 0
		this.locationDetails = new ContractorLocationDetailsDto()
		this.isAvailabilitySet = false
		this.isProfileCreated = false
	}

  @IsUUID()
  @IsNotEmpty()
	public id: string

  @IsString()
  @IsOptional()
  public avatar?: string

  @IsString()
  @IsNotEmpty()
  public name: string

  @IsString()
  @IsNotEmpty()
  public surname: string

	@IsBoolean()
  public isAvailabilitySet: boolean

	@IsBoolean()
	public isProfileCreated: boolean

  @IsArray()
  @IsEnum(ContractorTransportation, { each: true, },)
	public transportation: Array<ContractorTransportation>

  @IsString()
  @IsNotEmpty()
  public phone: string

  @IsEmail()
  @IsNotEmpty()
  public email: string

  @IsString()
  @IsNotEmpty()
  public address: string

  @IsString()
  @IsNotEmpty()
  public placeId: string

	@IsNumber()
  public longitude: number

	@IsNumber()
	public latitude: number

	@IsString()
	@IsOptional()
	public stripeId?: string

	@IsBoolean()
	@IsOptional()
	public isStipeSelected?: boolean

  @IsNumber()
  @Type(() => {
  	return Number
  },)
	public radius: number

  public regionNames: Array<string>

  public locationDetails: ContractorLocationDetailsDto

  public static cast(data: Contractor & {
		ContractorLocation: {
			placeId: string | null;
			latitude: number;
			longitude: number;
		} | null;
	}	& {
    skills: Array<{
      skill: {
          id: string;
          name: $Enums.ContractorSkillNama;
      };
  }>;
		regions: Array<{
			isHome: boolean;
			region: {
				id: string;
				name: string;
			};
		}>;
    SpecificDocuments: Array<{
        id: string;
        name: string;
        url: string;
        expiredAt: Date;
        createdAt: Date;
        type: $Enums.SpecificDocumentType;
        contractorId: string;
    }>;
} | null,): AllContractorInfoResDto {
  	const contractor = new AllContractorInfoResDto()

  	if (!data) {
  		return contractor
  	}

  	const { password, SpecificDocuments, regions, ...rest} = data

  	return Object.assign(contractor, {
  		...rest,
  		...SkillsAndCertificationsResDto.cast(data,),
  		locationDetails: ContractorLocationDetailsDto.cast(data.ContractorLocation,),
  		regionNames:     RegionNamesDto.cast({ regions, },).regionNames,
  	},)
  }
}

export class RegionNamesDto {
	constructor(data?: RegionNamesDto,) {
		if (data) {
			this.regionNames = data.regionNames
			return
		}
		this.regionNames = []
	}

	@IsArray()
	@IsString({ each: true, },)
	@ApiProperty()
	public regionNames: Array<string>

	public static cast(data: {
		regions: Array<{
			isHome: boolean;
			region: {
				id: string;
				name: string;
			};
		}>,
	},): RegionNamesDto {
		const regionNames = new RegionNamesDto()
		regionNames.regionNames = data.regions.sort((region,) => {
			return region.isHome ?
				-1 :
				1
		},).map((region,) => {
			return region.region.name
		},)
		return regionNames
	}
}