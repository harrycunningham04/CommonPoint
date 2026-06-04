import { CategoryPreference, } from '@prisma/client'

import { ContractorSkillNama, } from '@prisma/client'

export const SKILL_TO_CATEGORIES: Record<ContractorSkillNama, Array<CategoryPreference>> = {
	[ContractorSkillNama.PHOTO]:      [CategoryPreference.PHOTOGRAPHY, CategoryPreference.EDITING,],
	[ContractorSkillNama.VIDEO]:      [CategoryPreference.VIDEO, CategoryPreference.EDITING,],
	[ContractorSkillNama.FLOORPLAN]:  [CategoryPreference.FLOORPLAN,],
	[ContractorSkillNama.LEASE_PLAN]: [CategoryPreference.FLOORPLAN,],

	[ContractorSkillNama.DRONE]:              [],
	[ContractorSkillNama.EPC]:                [],
	[ContractorSkillNama.FIRERISK_ASSESMENT]: [],
	[ContractorSkillNama.CGI]:                [],
	[ContractorSkillNama.VIRTUAL_TOUR]:       [],
	[ContractorSkillNama.HEADSHOT]:           [],
}