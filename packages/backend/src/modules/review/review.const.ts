export const AdminReviewInclude = Object.freeze({
	booking: {
		select: {
			address:    true,
			contractor: {
				select: {
					name:    true,
					surname: true,
					phone:   true,
				},
			},
			date_time:   true,
			b2CClients: {
				select: {
					firstName:   true,
					lastName:    true,
					phoneNumber: true,
				},
			},
			b2BClients: {
				select: {
					firstName:   true,
					lastName:    true,
					phoneNumber: true,
				},
			},
		},
	},
},)