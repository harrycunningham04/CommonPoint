export enum Template {
	BASIC = 'basic',
	FORGOT = 'forgot'
}

export type TEMPLATE_CONTEXT_TYPES = {
	[Template.BASIC]: {
		clickLondonUrl: string,
		email: string,
		unsubscribeUrl: string,
		managePreferencesUrl: string,
		message: string,
		password: string,
	},
	[Template.FORGOT] : {
		clickLondonUrl: string,
		email: string,
		unsubscribeUrl: string,
		managePreferencesUrl: string,
		message: string,
	}
}

export const templateDictionary = {
	[Template.BASIC]: {
		message:                'Hi there, Your account has been approved! You can now log in to the ClickLondon.',
		recoverPasswordMessage: 'Hi there, You have requested a password recovery! You can reset your password by clicking the button below.',
	},
}
