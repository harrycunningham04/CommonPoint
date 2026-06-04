export const SelectSkills = Object.freeze({
	productTypes: {
		include: {
			adjustments:       true,
			productTypeSkills: {
				include: {
					skill: true,
				},
			},
		},
	},
},)