/* eslint-disable no-await-in-loop */
import { Injectable, NotFoundException, } from '@nestjs/common'
import type { BookingPreferenceTable, CategoryPreference, ContractorSkillNama, OfficePreference, Preference, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import { SelectBookingSkills, } from 'src/modules/booking/booking.const'
import { BookingUniqueSkills, } from 'src/modules/booking/dto'
import { PREFERENCE_DICTIONARY, } from 'src/shared/constants/preference-dictionary.constants'
import { SKILL_TO_CATEGORIES, } from '../constants/skill-to-preferences-category.constant'
import { ClientBasicService, } from './client-basic.service'
import { ClientType, } from '../types/client.types'
import type { CreatePreferenceDto, GetClientPreferencesAdminDto, } from '../dto/preference.dto'

@Injectable()
export class PreferencesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly clientBasicService: ClientBasicService,
	) {}

	public async initializePreferences() : Promise<void> {
		const preferencesCount = await this.prisma.preference.count()

		if (preferencesCount === 0) {
			for (const preference of PREFERENCE_DICTIONARY) {
				await this.prisma.preference.create({
					data: {
						name:        preference.name,
						category:    preference.category,
						description: preference.description,
					},
				},)
			}
		}
	}

	public async getAllPreferences() : Promise<Array<Preference>> {
		return this.prisma.preference.findMany({
			where:  {},
			select: {
				id:          true,
				name:        true,
				category:    true,
				description: true,
			},
		},)
	}

	public async getPreferencesByClientId(clientId: string,) : Promise<Array<Preference>> {
		return this.prisma.preference.findMany({
			where: {
				clientsB2C: { some: { clientId, }, },
			},
		},)
	}

	public async createPreferenceForOffice(officeId: string, preferenceId: string,) : Promise<OfficePreference> {
		const officePreference = await this.prisma.officePreference.create({
			data: {
				officeId,
				preferenceId,
			},
		},)
		return officePreference
	}

	public async deletePreferenceForOffice(officeId: string, preferenceId: string,) : Promise<void> {
		const officePreference = await this.prisma.officePreference.findUnique({
			where: {
				officeId_preferenceId: {
					officeId,
					preferenceId,
				},
			},
		},)

		if (!officePreference) {
			throw new NotFoundException('Preference not found',)
		}

		await this.prisma.officePreference.delete({
			where: {
				officeId_preferenceId: {
					officeId,
					preferenceId,
				},
			},
		},)
	}

	public async createPreferenceForBooking(bookingId: string, preferenceId: string,) : Promise<BookingPreferenceTable> {
		const bookingPreference = await this.prisma.bookingPreferenceTable.create({
			data: {
				bookingId,
				preferenceId,
			},
		},)
		return bookingPreference
	}

	public async getAndCreateForOffice(officeId: string,) : Promise<Array<Preference>> {
		const office = await this.prisma.office.findUnique({
			where:   { id: officeId, },
			include: {
				officePreference: true,
			},
		},)

		if (!office) {
			throw new NotFoundException('Office not found',)
		}

		const preferences = await this.getPreferencesByClientId(office.b2BClientsId!,)

		for (const preference of preferences) {
			await this.createPreferenceForOffice(officeId, preference.id,)
		}

		return preferences
	}

	public async preferencesByBookingGroupId(bookingGroupId: string,) : Promise<void> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:   { id: bookingGroupId, },
			select: {
				bookings: true,
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		for (const booking of bookingGroup.bookings) {
			await this.preferencesByBookingId(booking.id,)
		}
	}

	public async preferencesByBookingId(bookingId: string,) : Promise<void> {
		const booking = await this.prisma.booking.findUnique({
			where:  { id: bookingId, },
			select: {
				b2BClientsId: true,
				b2CClientsId: true,
				officeId:     true,
				...SelectBookingSkills,
			},
		},)

		if (!booking) {
			throw new NotFoundException('Booking not found',)
		}

		const isB2C = Boolean(booking.b2CClientsId,)
		const isOffice = Boolean(booking.officeId,)

		const uniqueSkills = BookingUniqueSkills.getUniqueSkills(booking,)

		const relevantCategories = new Set<CategoryPreference>()

		let preferenceIds: Array<{ id: string, }> = []

		for (const skill of uniqueSkills) {
			const categories = SKILL_TO_CATEGORIES[skill.name as ContractorSkillNama]
			categories.forEach((c,) => {
				return relevantCategories.add(c,)
			},)
		}

		if (isB2C) {
			preferenceIds = await this.prisma.preference.findMany({
				where: {
					category:   { in: [...relevantCategories,], },
					clientsB2C: {
						some: {
							clientId: booking.b2CClientsId!,
						},
					},
				},
				select: {
					id: true,
				},
			},)
		} else if (isOffice) {
			preferenceIds = await this.prisma.preference.findMany({
				where: {
					category:   { in: [...relevantCategories,], },
					offices:  { some: { officeId: booking.officeId!, }, },
				},
			},)
		}

		await this.prisma.bookingPreferenceTable.createMany({
			data:           preferenceIds.map(({ id, },) => {
				return { bookingId, preferenceId: id, }
			},),
			skipDuplicates: true,
		},)
	}

	public async deleteAllPreferencesForClient(clientId: string,) : Promise<void> {
		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		if (clientType === ClientType.B2C) {
			await this.prisma.clientB2CPreference.deleteMany({
				where: { clientId, },
			},)
		} else if (clientType === ClientType.B2B) {
			await this.prisma.clientB2BPreference.deleteMany({
				where: { b2bClientId: clientId, },
			},)
		}
	}

	public async createPreferenceForClient(clientId: string, body: CreatePreferenceDto,) : Promise<void> {
		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		if (clientType === ClientType.B2C) {
			await this.deleteAllPreferencesForClient(clientId,)
			await this.prisma.clientB2CPreference.createMany({
				data: body.preferenceIds.map((id,) => {
					return { clientId, preferenceId: id, }
				},),
			},)
		} else if (clientType === ClientType.B2B) {
			await this.deleteAllPreferencesForClient(clientId,)
			const officesIds = await this.prisma.office.findMany({
				where: {
					b2BClientsId: clientId,
				},
				select: {
					id: true,
				},
			},)

			for (const officeId of officesIds) {
				await this.recreatePreferencesForOffice(officeId.id, body.preferenceIds,)
			}

			await this.prisma.clientB2BPreference.createMany({
				data: body.preferenceIds.map((id,) => {
					return { b2bClientId: clientId, preferenceId: id, }
				},),
			},)
		}
	}

	public async getClientPreferencesAdmin(clientId: string,) : Promise<Array<Preference>> {
		const clientType = await this.clientBasicService.getClientTypeById(clientId,)

		if (clientType === ClientType.B2C) {
			return this.prisma.preference.findMany({
				where: {
					clientsB2C: { some: { clientId, }, },
				},
			},)
		}

		if (clientType === ClientType.B2B) {
			return this.prisma.preference.findMany({
				where: {
					clientsB2B: { some: { b2bClientId: clientId, }, },
				},
			},)
		}

		return []
	}

	public async recreatePreferencesForOffice(officeId: string,preferenceIds: Array<string>,) : Promise<void> {
		await this.prisma.officePreference.deleteMany({
			where: {
				officeId,
			},
		},)

		await this.prisma.officePreference.createMany({
			data: preferenceIds.map((id,) => {
				return { officeId, preferenceId: id, }
			},),
		},)
	}

	public async getClientPreferencesOffice(officeId: string,) : Promise<Array<Preference>> {
		const preferences = await this.prisma.officePreference.findMany({
			where: {
				officeId,
			},
			include: {
				preference: true,
			},
		},)

		return preferences.map(({ preference, },) => {
			return preference
		},)
	}

	public async getBookingPreferences(bookingGroupId: string,) : Promise<Array<Preference>> {
		const bookingGroup = await this.prisma.bookingGroup.findUnique({
			where:  { id: bookingGroupId, },
			select: {
				bookings: true,
			},
		},)

		if (!bookingGroup) {
			throw new NotFoundException('Booking group not found',)
		}

		const preferences = await this.prisma.bookingPreferenceTable.findMany({
			where: {
				bookingId: { in: bookingGroup.bookings.map(({ id, },) => {
					return id
				},), },
			},
			include: {
				preference: true,
			},
		},)

		return preferences.map(({ preference, },) => {
			return preference
		},)
	}

	public async getBookingFormPreferences(clientId: string, officeId?: string, skills: Array<ContractorSkillNama> = [],) : Promise<Array<Preference>> {
		const clientType = await this.clientBasicService.getClientTypeById(clientId,)
		const relevantCategories = new Set<CategoryPreference>()

		for (const skill of skills) {
			const categories = SKILL_TO_CATEGORIES[skill]
			categories.forEach((c,) => {
				return relevantCategories.add(c,)
			},)
		}

		const categories = Array.from(relevantCategories,)

		if (clientType === ClientType.B2C) {
			const preferences = await this.prisma.preference.findMany({
				where: {
					clientsB2C: { some: { clientId, }, },
					category:   { in: categories, },
				},
			},)

			return preferences
		}

		if ((clientType === ClientType.B2B || clientType === ClientType.WORKER)  && officeId) {
			const office = await this.prisma.office.findUnique({
				where: { id: officeId, },
			},)

			if (!office) {
				throw new NotFoundException('Office not found',)
			}

			const preferences = await this.prisma.preference.findMany({
				where: {
					offices:  { some: { officeId: office.id, }, },
					category:   { in: categories, },
				},
			},)

			return preferences
		}

		return []
	}
}
