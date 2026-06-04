export const PACKAGE_INCLUDE_TYPE = Object.freeze({
	PackageProductType: {
		include: {
			productType: {
				include: {
					productTypeSkills: {
						include: {
							skill: true,
						},
					},
				},
			},
		},
	},
},)