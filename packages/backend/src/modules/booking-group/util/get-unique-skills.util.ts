import type { SkillDto, } from 'src/modules/booking/dto'

export function getUniqueSkillsById(skills: Array<SkillDto>,): Array<SkillDto> {
	const seen = new Set<string>()
	return skills.filter((skill,) => {
		if (seen.has(skill.id,)) {
			return false
		}
		seen.add(skill.id,)
		return true
	},)
}
