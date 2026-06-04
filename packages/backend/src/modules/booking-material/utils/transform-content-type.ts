/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ContractorSkillNama,} from '@prisma/client'
import { MaterialTypeContent, } from '@prisma/client'
import { MaterialTypeContentClient, } from '../types/material-type'

export const transformContentType = (contentType: MaterialTypeContentClient,):MaterialTypeContent => {
	switch (contentType) {
	case MaterialTypeContentClient.CGI_PHOTOS:
		return MaterialTypeContent.PHOTOS
	case MaterialTypeContentClient.PHOTOS:
		return MaterialTypeContent.PHOTOS
	case MaterialTypeContentClient.FLORPLANS:
		return MaterialTypeContent.SKETCHES
	case MaterialTypeContentClient.LEASE_PLAN:
		return MaterialTypeContent.SKETCHES
	case MaterialTypeContentClient.VIDEOS:
		return MaterialTypeContent.VIDEOS
	default:
		throw new Error(`Invalid content type: ${contentType}`,)
	}
}

export const transformFromSkills = (skills: Array<ContractorSkillNama>,): Array<MaterialTypeContent> => {
	return skills.map((skill,) => {
		switch (skill) {
		case ContractorSkillNama.CGI:
		case ContractorSkillNama.PHOTO:
			return MaterialTypeContent.PHOTOS
		case ContractorSkillNama.FLOORPLAN:
		case ContractorSkillNama.LEASE_PLAN:
			return MaterialTypeContent.SKETCHES
		case ContractorSkillNama.VIDEO:
			return MaterialTypeContent.VIDEOS
		default:
			throw new Error(`Invalid contractor skill: ${skill}`,)
		}
	},)
}

export const transformToClientContentType = (contentType: MaterialTypeContent,): MaterialTypeContentClient => {
	switch (contentType) {
	case MaterialTypeContent.PHOTOS:
		return MaterialTypeContentClient.PHOTOS
	case MaterialTypeContent.SKETCHES:
		return MaterialTypeContentClient.FLORPLANS
	case MaterialTypeContent.VIDEOS:
		return MaterialTypeContentClient.VIDEOS
	default:
		throw new Error(`Invalid MaterialTypeContent: ${contentType}`,)
	}
}