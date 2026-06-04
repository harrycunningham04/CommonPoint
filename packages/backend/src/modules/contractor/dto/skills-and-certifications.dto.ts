import { ApiProperty, } from '@nestjs/swagger'
import { $Enums, ContractorSkillNama, } from '@prisma/client'
import { Type, } from 'class-transformer'
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsString, IsUrl, IsUUID, ValidateNested, } from 'class-validator'

class CertificationDocumentDto {
	constructor(data?: CertificationDocumentDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.url = data.url
			this.expiredAt = data.expiredAt
			return
		}
		this.id = ''
		this.name = ''
		this.url = ''
		this.expiredAt = new Date()
	}

  @IsUUID()
  @IsNotEmpty()
	@ApiProperty()
	public id: string

  @IsString()
  @IsNotEmpty()
	@ApiProperty()
  public name: string

  @IsUrl()
  @IsNotEmpty()
	@ApiProperty()
  public url: string

  @IsDate()
	@ApiProperty({
		type: Date,
	},)
  public expiredAt: Date
}

export class SkillsAndCertificationsResDto {
	constructor(data?: SkillsAndCertificationsResDto,) {
		if (data) {
			this.skills = data.skills
			this.certifications = data.certifications
			this.insurances = data.insurances
			return
		}
		this.skills = []
		this.certifications = []
		this.insurances = []
	}

  @IsArray()
  @IsEnum(ContractorSkillNama, { each: true, },)
	@ApiProperty()
	public skills: Array<ContractorSkillNama>

  @IsArray()
  @ValidateNested({ each: true, },)
  @Type(() => {
  	return CertificationDocumentDto
  },)
	@ApiProperty()
  public certifications: Array<CertificationDocumentDto>

  @IsArray()
  @ValidateNested({ each: true, },)
  @Type(() => {
  	return CertificationDocumentDto
  },)
	@ApiProperty()
  public insurances: Array<CertificationDocumentDto>

  public static cast(data: {
    id: string;
    skills: Array<{
        skill: {
            id: string;
            name: $Enums.ContractorSkillNama;
        };
    }>;
    SpecificDocuments: Array<{
        url: string;
        id: string;
        name: string;
        expiredAt: Date;
        type: $Enums.SpecificDocumentType;
    }>;
} | null,): SkillsAndCertificationsResDto {
  	const skills = new SkillsAndCertificationsResDto()
  	if (!data) {
  		return skills
  	}
  	skills.skills = data.skills.map((skill,) => {
  		return skill.skill.name
  	},)
  	skills.certifications = data.SpecificDocuments.filter((doc,) => {
  		return doc.type === $Enums.SpecificDocumentType.CERTIFICATE
  	},)
  	skills.insurances = data.SpecificDocuments.filter((doc,) => {
  		return doc.type === $Enums.SpecificDocumentType.INSURANCE
  	},)
  	return skills
  }
}