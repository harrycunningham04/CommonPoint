export const getUniqueId = (ids: Array<string>,): Array<string> => {
	const newSet = new Set<string>()

	for (const id of ids) {
		newSet.add(id,)
	}

	return Array.from(newSet,)
}