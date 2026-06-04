import { BadRequestException, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { EditContractorBasicDto, EditContractorStripeDto, } from '../dto/edit-contractor-basic.dto'
import type { ContractorBasicInfoDto, } from '../dto/contractor-basic-info.dto'
import { ContractorLocationDetailsDto, type EditContractorLocationDto, } from '../dto/edit-contractor-location.dto'
import type { ContractorLocationResDto, } from '../dto/contractor-location-res.dto'
import { UploadService, } from 'src/modules/upload/upload.service'
import type { Express, } from 'express'
import { SpecificDocumentType, type ContractorSkillNama, } from '@prisma/client'
import { BasicContractorService, } from './basic-contractor.service'
import { RegionNamesDto, } from '../dto/all-contractor-info.dto'
import type { CertificationDto, CertificationsReqDto, } from '../dto/certifications.dto'
import type { SkillsAndCertificationsResDto, } from '../dto/skills-and-certifications.dto'

import type { EditContractorPasswordDto, } from '../dto/edit-contractor-password.dto'
import { CryptoService, } from 'src/modules/crypto/crypto.service'
import { text, } from 'src/shared/text/en'
import type { IContractorRegion, IUpdateContractorRegions, } from '../contractor.types'
import { JWTService, } from 'src/modules/jwt/jwt.service'
import { StripeService, } from 'src/modules/stripe/stripe.service'

@Injectable()
export class EditContractorService {
	constructor(
    private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
		private readonly basicInfoService: BasicContractorService,
		private readonly cryptoService : CryptoService,
		private readonly jwtService: JWTService,
		private readonly stripeService: StripeService,
	) {}

	public async editContractorStripe(userId: string, body: EditContractorStripeDto,): Promise<ContractorBasicInfoDto> {
		const decoded = this.jwtService.decodeJWTToken(body.token,)

		await this.stripeService.checkIfUserIsValidForTransfer(decoded.id,)

		return this.prisma.contractor.update({
			where:  { id: userId, },
			data:   { stripeId: decoded.id, isStipeSelected: true, },
		},)
	}

	public async editContractorBasicInfo(userId: string, body: EditContractorBasicDto,
		avatar?: Express.Multer.File,): Promise<ContractorBasicInfoDto> {
		let savedAvatar: string | undefined
		const {isAvatarDelete,...restBody} = body
		if (avatar) {
			const { buffer, originalname, } = avatar
			savedAvatar = await this.uploadService.uploadAvatar(originalname, buffer,)
		} else if (isAvatarDelete === 'true') {
			savedAvatar = ''
		}

		const updatedContractor = await this.prisma.contractor.update({
			where: {
				id: userId,
			},
			data: {
				...restBody,
				avatar: savedAvatar ?? undefined,
			},
		},)

		return updatedContractor
	}

	public async setupContractorSkills(userId: string, skills: Array<ContractorSkillNama>,): Promise<SkillsAndCertificationsResDto> {
		const skillIds = (await this.prisma.skills.findMany({
			where: {
				name: {
					in: skills,
				},
			},
			select: {
				id: true,
			},
		},)).map((it,) => {
			return it.id
		},)

		await Promise.all([
			this.prisma.contractorSkills.deleteMany({
				where: {
					contractor_id: userId,
					skill_id:      {
						notIn: skillIds,
					},
				},
			},),
			this.prisma.contractorSkills.createMany({
				data: skillIds.map((it,) => {
					return {
						contractor_id: userId,
						skill_id:      it,
						confirmed:     false,
					}
				},),
				skipDuplicates: true,
			},),
		],)

		return this.basicInfoService.getSkillsAndCertifications(userId,)
	}

	private async saveSpecificDocuments(userId: string, documents: Array<CertificationDto>,): Promise<void> {
		await Promise.all(documents.map(async(document,) => {
			if (!document.id) {
				await this.prisma.specificDocuments.create({
					data: {
						url:        document.url,
						name:       document.name,
						expiredAt:  document.expiredAt,
						type:       document.type,
						contractor: {
							connect: {
								id: userId,
							},
						},
					},
				},)
				return
			}
			await this.prisma.specificDocuments.upsert({
				where: {
					id:          document.id,
				},
				update: {
					url:       document.url,
					name:      document.name,
					expiredAt: document.expiredAt,
					type:      document.type,
				},
				create: {
					url:        document.url,
					name:       document.name,
					expiredAt:  document.expiredAt,
					type:       document.type,
					contractor: {
						connect: {
							id: userId,
						},
					},
				},
			},)
		},),)
	}

	public async setupContractorSpecificDocuments(userId: string, documents: CertificationsReqDto,): Promise<SkillsAndCertificationsResDto> {
		if (documents.certifications) {
			await this.saveSpecificDocuments(userId, documents.certifications.map((it,) => {
				return {
					...it,
					type:      SpecificDocumentType.CERTIFICATE,
				}
			},),)
		}
		if (documents.insurances) {
			await this.saveSpecificDocuments(userId, documents.insurances.map((it,) => {
				return {
					...it,
					type:      SpecificDocumentType.INSURANCE,
				}
			},),)
		}

		return this.basicInfoService.getSkillsAndCertifications(userId,)
	}

	public async deleteSpecificDocument(documentId: string,): Promise<void> {
		const document = await this.prisma.specificDocuments.findUnique({
			where: {
				id: documentId,
			},
			select: {
				url: true,
			},
		},)
		if (!document) {
			throw new BadRequestException('Document not found',)
		}

		await this.uploadService.deleteFile(document.url,)

		await this.prisma.specificDocuments.delete({
			where: {
				id: documentId,
			},
		},)
	}

	private async updateContactorRegionIsHome({userId, contractorRegion, regionId, index,}:IUpdateContractorRegions,): Promise<IContractorRegion | null> {
		const isIndexEquealsZero = index === 0
		if (contractorRegion?.isHome && isIndexEquealsZero) {
			return contractorRegion
		}

		if (contractorRegion?.isHome && !isIndexEquealsZero) {
			return this.prisma.contractorRegion.update({
				where: {
					contractorId_regionId: {
						contractorId: userId,
						regionId,
					},
				},
				data: { isHome: false, },
			},)
		}

		return null
	}

	private async updateContactorRegionNotIsHome({userId, contractorRegion, regionId, index,}:IUpdateContractorRegions,): Promise<IContractorRegion | null> {
		const isContractorRegionAndNotIsHome = contractorRegion && !contractorRegion.isHome
		const isIndexEquealsZero = index === 0

		if (isContractorRegionAndNotIsHome && isIndexEquealsZero) {
			return this.prisma.contractorRegion.update({
				where: {
					contractorId_regionId: {
						contractorId: userId,
						regionId,
					},
				},
				data: { isHome: true, },
			},)
		}

		if (isContractorRegionAndNotIsHome && !isIndexEquealsZero) {
			return this.prisma.contractorRegion.update({
				where: {
					contractorId_regionId: {
						contractorId: userId,
						regionId,
					},
				},
				data: { isHome: false, },
			},)
		}

		return null
	}

	private async updateContractorRegion({userId, contractorRegion, regionId, index,}:IUpdateContractorRegions,): Promise<IContractorRegion> {
		const updatedContractorRegionIsHome = await this.updateContactorRegionIsHome({userId, contractorRegion, regionId, index,},)
		if (updatedContractorRegionIsHome) {
			return updatedContractorRegionIsHome
		}

		const updatedContractorRegion = await this.updateContactorRegionNotIsHome({userId, contractorRegion, regionId, index,},)
		if (updatedContractorRegion) {
			return updatedContractorRegion
		}

		return this.prisma.contractorRegion.create({
			data: { contractorId: userId, regionId, isHome: index === 0, },
		},)
	}

	private async setupRegionNames(userId: string, regionNames: Array<string>,): Promise<void> {
		const processedRegions = await Promise.all(regionNames.map(async(regionName, index,) => {
			let region = await this.prisma.region.findFirst({
				where: { name: regionName, },
			},)
			if (!region) {
				region = await this.prisma.region.create({ data: { name: regionName, }, },)
			}
			const contractorRegion = await this.prisma.contractorRegion.findFirst({
				where: {
					contractorId: userId,
					regionId:     region.id,
				},
			},)

			return this.updateContractorRegion({userId, contractorRegion, regionId: region.id, index,},)
		},),)

		await this.prisma.contractorRegion.deleteMany({
			where: {
				contractorId: userId,
				NOT:          {
					regionId: {
						in: processedRegions.map((it,) => {
							return it.regionId
						},),
					},
				},
			},
		},)
	}

	public async editContractorLocation(userId: string, location: EditContractorLocationDto,): Promise<ContractorLocationResDto> {
		const { regionNames, locationDetails, ...rest } = location

		if (regionNames) {
			await this.setupRegionNames(userId, regionNames,)
		}

		let searchedLocation = await this.prisma.contractorLocation.findFirst({
			where: {
				contractorId: userId,
			},
		},)

		if (!searchedLocation) {
			searchedLocation = await this.prisma.contractorLocation.create({
				data: {
					...locationDetails,
					contractor: {
						connect: {
							id: userId,
						},
					},
				},
			},)
		}

		if (searchedLocation.placeId !== locationDetails.placeId) {
			await this.prisma.contractorLocation.update({
				where: {
					id: searchedLocation.id,
				},
				data: {
					placeId:   locationDetails.placeId,
					latitude:  locationDetails.latitude,
					longitude: locationDetails.longitude,
				},
			},)
		}

		const updatedContractor = await this.prisma.contractor.update({
			where: {
				id: userId,
			},
			data: {
				...rest,
				ContractorLocation: {
					connect: {
						id: searchedLocation.id,
					},
				},
			},
			select: {
				id:                 true,
				address:            true,
				radius:             true,
				ContractorLocation: true,
				regions:            {
					select: {
						isHome: true,
						region: {
							select: {
								id:     true,
								name:   true,
							},
						},
					},
				},
			},
		},)

		const { regions, ...contractor } = updatedContractor
		const {regionNames: regionNamesCasted,} = RegionNamesDto.cast({ regions, },)
		return {
			...contractor,
			locationDetails: ContractorLocationDetailsDto.cast(updatedContractor.ContractorLocation,),
			address:         updatedContractor.address ?? '',
			regionNames:     regionNamesCasted,
		}
	}

	public async changePassword(
		data: EditContractorPasswordDto,
		contractorId: string,
	): Promise<ContractorBasicInfoDto> {
		const { newPassword, oldPassword, } = data

		const contractor = await this.prisma.contractor.findUnique({
			where: {
				id: contractorId,
			},
		},)

		if (!contractor) {
			throw new BadRequestException('Contractor not found',)
		}

		const isSame = await this.cryptoService.comparePasswords(oldPassword, contractor.password!,)

		if (!isSame) {
			throw new BadRequestException(text.wrongPassword,)
		}

		const newHashedPassword = await this.cryptoService.hashString(newPassword,)

		return this.editContractorBasicInfo(contractorId, { password: newHashedPassword, },)
	}
}
