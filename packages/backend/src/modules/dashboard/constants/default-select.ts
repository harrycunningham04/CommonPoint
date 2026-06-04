import { EFieldSearch, } from '../types/ESearchFiels'

export const DEFAULT_SELECT_PERSON = {
	[EFieldSearch.ID]:      true,
	[EFieldSearch.NAME]:    true,
	[EFieldSearch.SURNAME]: true,
	[EFieldSearch.AVATAR]:  true,
}

export const DEFAULT_SEARCH_VALUES = [
	EFieldSearch.EMAIL,
	EFieldSearch.NAME,
	EFieldSearch.SURNAME,
	EFieldSearch.PHONE,
]

export const DEFAULT_SELECT_CLIENT = {
	[EFieldSearch.ID]:        true,
	[EFieldSearch.FIRSTNAME]: true,
	[EFieldSearch.LASTNAME]:  true,
}
