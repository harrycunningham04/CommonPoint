/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { WIDGETS, } from '../constants/startData'
import { UpdateDefaultsDto, UpdateWidgetDto, } from '../dto/change-dto'
import { GetGlobalSearchDto, } from '../dto/global-search.dto'
import { BookingType, Prisma, } from '@prisma/client'
import { EFieldSearch, } from '../types/ESearchFiels'
import {
	DEFAULT_SEARCH_VALUES,
	DEFAULT_SELECT_CLIENT,
	DEFAULT_SELECT_PERSON,
} from '../constants/default-select'
import { EGlobalSearchCategory, } from '../types/ECategories'
import { CreateAdminDto, } from 'src/modules/admin/dto'
import { CreateAdminWidgetDto, } from '../dto/create-widget-dto'
import { DeleteWidgetDto, } from '../dto/delete-widget-dto'

import { startOfToday, endOfToday, } from 'date-fns'

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService,) {}

	private async initializeWidgets() {
		const existingWidgets = await this.prisma.widget.findMany()

		if (existingWidgets.length === 0) {
			for (const widget of WIDGETS) {
				await this.prisma.widget.create({
					data: {
						name: widget.name,
						type: widget.type,
					},
				},)
			}
		}
	}

	public async initializeAdminsWidgets(adminId: string,) {
		await this.initializeWidgets()

		const existingAdminWidgets = await this.prisma.adminWidget.findMany({
			where: { adminId, },
		},)

		if (existingAdminWidgets.length === 0) {
			const widgets = await this.prisma.widget.findMany()

			for (const widget of widgets) {
				const widgetConfig = WIDGETS.find((w,) => {
					return w.name === widget.name
				},)
				if (widgetConfig) {
					await this.prisma.adminWidget.create({
						data: {
							adminId,
							widgetId:        widget.id,
							isActive:        true,
							position:        widgetConfig.position,
							defaultPosition: widgetConfig.position,
							size:            widgetConfig.type,
							defaultSize:     widgetConfig.type,
						},
					},)
				}
			}
		}
	}

	public async createExtraAdminWidget(
		adminId: string,
		data: CreateAdminWidgetDto,
	) {
		const prevPosition = data.prevPosition ?
			parseInt(data.prevPosition, 10,) :
			0

		await this.prisma.adminWidget.updateMany({
			where: {
				adminId,
				size:     data.widgetSize,
				position: {
					gte: prevPosition + 1,
				},
			},
			data: {
				position: {
					increment: 1,
				},
			},
		},)

		const newAdminWidget = await this.prisma.adminWidget.create({
			data: {
				adminId,
				widgetId:        data.widgetId!,
				isActive:        true,
				defaultIsActive: false,
				size:            data.widgetSize,
				defaultSize:     data.widgetSize,
				position:        prevPosition + 1,
			},
		},)

		return newAdminWidget
	}

	public async deleteAdminWidget(
		adminId: string,
		data: DeleteWidgetDto,
	): Promise<void> {
		const widgetPosition = data.position ?
			parseInt(data.position, 10,) :
			0

		const currentAdminWidget = await this.prisma.adminWidget.findUnique({
			where: {
				id: data.adminWidgetId!,
			},
		},)

		await this.prisma.adminWidget.updateMany({
			where: {
				adminId,
				size:     data.widgetSize,
				position: {
					gt: widgetPosition,
				},
			},
			data: {
				position: {
					decrement: 1,
				},
			},
		},)

		if (currentAdminWidget?.defaultIsActive) {
			await this.prisma.adminWidget.update({
				where: {
					id: data.adminWidgetId!,
				},
				data: {
					isActive: false,
				},
			},)
		} else {
			await this.prisma.adminWidget.delete({
				where: {
					id: data.adminWidgetId!,
				},
			},)
		}
	}

	public async updateWidget({
		adminId,
		widgetId,
		data,
	}: {
    adminId: string;
    widgetId: string;
    data: UpdateWidgetDto;
  },) {
		const { isActive, size, position, adminWidgetId, } = data

		await this.prisma.adminWidget.updateMany({
			where: {
				id: adminWidgetId,
			},
			data: {
				isActive,
				size,
				position,
			},
		},)
	}

	public async getAllWidgets(adminId: string,) {
		return this.prisma.adminWidget.findMany({
			where: {
				adminId,
			},
			include: {
				widget: true,
			},
		},)
	}

	public async updateWidgetsPosition(
		adminId: string,
		widgetPositions: Array<{
		  widgetId: string;
		  position: number;
		  adminWidgetId: string;
		}>,
	  ) {
		console.log(widgetPositions,)

		await this.prisma.$transaction(
		  widgetPositions.map(({ widgetId, position, adminWidgetId, },) => {
				return this.prisma.adminWidget.update({
			  where: {
						id: adminWidgetId,
			  },
			  data: {
						position,
			  },
				},)
			},
		  ),
		)
	  }

	  public async updateDefaultValues(
		adminId: string,
		updateDefaultsDto: UpdateDefaultsDto,
	  ) {
		const { widgets, } = updateDefaultsDto

		await this.prisma.$transaction(
		  widgets.map(({ widgetId, defaultPosition, defaultIsActive, defaultSize, id, },) => {
				return this.prisma.adminWidget.update({
			  where: { id, },
			  data:  {
						defaultPosition,
						defaultIsActive,
						defaultSize,
			  },
				},)
		  },),
		)
	  }

	  public async resetAllWidgetsToDefaults(adminId: string,): Promise<void> {
		const widgets = await this.prisma.adminWidget.findMany({
		  where: {
				adminId,
		  },
		},)

		await this.prisma.$transaction(
		  widgets.map(({ id, defaultPosition, defaultIsActive, },) => {
				return this.prisma.adminWidget.update({
			  where: {
						id,
			  },
			  data: {
						position: defaultPosition,
						isActive: defaultIsActive,
			  },
				},)
		  },),
		)
	  }

	public async getSelectDataValues() {
		const contractorData = await this.prisma.contractor.findMany({
			where: {
				Booking: {
					some: {},
				},
			},
			select: {
				id:      true,
				name:    true,
				surname: true,
			},
		},)

		const regionData = await this.prisma.region.findMany({
			where: {
				contractorRegions: {
					some: {},
				},
			},
			select: {
				id:   true,
				name: true,
			},
		},)

		return {
			contractorValue: contractorData,
			regionValue:     regionData,
		}
	}

	public async getContractorTodayBookings(contractorId: string,) {
		const startOfDay = startOfToday()
		const endOfDay = endOfToday()

		console.log(contractorId,)

		const bookingsToday = await this.prisma.booking.findMany({
			where: {
				contractorId,
				date_time:    {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
		},)

		return bookingsToday
	}

	public async findGlobalSearchByModel<T>(
		model: any,
		fields: Array<string>,
		search: string,
		select: Prisma.SelectSubset<T, any>,
		take: number,
		skip: number,
	): Promise<Array<T>> {
		if (!search) {
			return []
		}

		const [nameQuery, surnameQuery,] = search.split(' ',)

		const orConditions = fields.map((field,) => {
			if (field.includes('.',)) {
				const [relation, relatedField,] = field.split('.',)
				return {
					// @ts-ignore
					[relation]: {
						// @ts-ignore

						[relatedField]: {
							contains: search,
							mode:     'insensitive',
						},
					},
				}
			}
			return {
				[field]: {
					contains: search,
					mode:     'insensitive',
				},
			}
		},)
		const clientSelfConditions: Prisma.Enumerable<Prisma.Enumerable<any>> = []
		if (fields.includes('firstName',) || fields.includes('lastName',)) {
			if (surnameQuery) {
				clientSelfConditions.push({
					AND: [
						{ firstName: { contains: nameQuery, mode: 'insensitive', }, },
						{ lastName: { contains: surnameQuery, mode: 'insensitive', }, },
					],
				},)
				clientSelfConditions.push({
					AND: [
						{ firstName: { contains: surnameQuery, mode: 'insensitive', }, },
						{ lastName: { contains: nameQuery, mode: 'insensitive', }, },
					],
				},)
			} else {
				clientSelfConditions.push({
					OR: [
						{ firstName: { contains: nameQuery, mode: 'insensitive', }, },
						{ lastName: { contains: nameQuery, mode: 'insensitive', }, },
					],
				},)
			}
		}

		const adminAndContractorConditions: Prisma.Enumerable<
      Prisma.Enumerable<any>
    > = []
		if (fields.includes('name',) || fields.includes('surname',)) {
			if (surnameQuery) {
				adminAndContractorConditions.push({
					OR: [
						{
							AND: [
								{ name: { contains: nameQuery, mode: 'insensitive', }, },
								{ surname: { contains: surnameQuery, mode: 'insensitive', }, },
							],
						},
						{
							AND: [
								{ name: { contains: surnameQuery, mode: 'insensitive', }, },
								{ surname: { contains: nameQuery, mode: 'insensitive', }, },
							],
						},
					],
				},)
			} else {
				adminAndContractorConditions.push({
					OR: [
						{ name: { contains: nameQuery, mode: 'insensitive', }, },
						{ surname: { contains: nameQuery, mode: 'insensitive', }, },
					],
				},)
			}
		}

		const contractorFullNameConditions: Prisma.Enumerable<
      Prisma.Enumerable<any>
    > = []
		if (
			fields.includes('contractor.name',) &&
      fields.includes('contractor.surname',)
		) {
			if (surnameQuery) {
				contractorFullNameConditions.push({
					OR: [
						{
							AND: [
								{
									contractor: {
										name: { contains: nameQuery, mode: 'insensitive', },
									},
								},
								{
									contractor: {
										surname: { contains: surnameQuery, mode: 'insensitive', },
									},
								},
							],
						},
						{
							AND: [
								{
									contractor: {
										name: { contains: surnameQuery, mode: 'insensitive', },
									},
								},
								{
									contractor: {
										surname: { contains: nameQuery, mode: 'insensitive', },
									},
								},
							],
						},
					],
				},)
			} else {
				contractorFullNameConditions.push({
					OR: [
						{
							contractor: {
								name: { contains: nameQuery, mode: 'insensitive', },
							},
						},
						{
							contractor: {
								surname: { contains: nameQuery, mode: 'insensitive', },
							},
						},
					],
				},)
			}
		}

		const createClientConditions = (
			clientType: string,
			nameField: string,
			surnameField: string,
		) => {
			if (surnameQuery) {
				return {
					[clientType]: {
						OR: [
							{
								AND: [
									{ [nameField]: { contains: nameQuery, mode: 'insensitive', }, },
									{
										[surnameField]: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
							{
								AND: [
									{
										[nameField]: {
											contains: surnameQuery,
											mode:     'insensitive',
										},
									},
									{
										[surnameField]: {
											contains: nameQuery,
											mode:     'insensitive',
										},
									},
								],
							},
						],
					},
				}
			}
			return {
				[clientType]: {
					OR: [
						{ [nameField]: { contains: nameQuery, mode: 'insensitive', }, },
						{ [surnameField]: { contains: nameQuery, mode: 'insensitive', }, },
					],
				},
			}
		}

		const clientConditions: Prisma.Enumerable<Prisma.Enumerable<any>> = []
		if (
			fields.includes('b2CClients.firstName',) ||
      fields.includes('b2CClients.lastName',)
		) {
			clientSelfConditions.push(
				createClientConditions('b2CClients', 'firstName', 'lastName',),
			)
		}
		if (
			fields.includes('b2BClients.firstName',) ||
      fields.includes('b2BClients.lastName',)
		) {
			clientSelfConditions.push(
				createClientConditions('b2BClients', 'firstName', 'lastName',),
			)
		}

		return model.findMany({
			where: {
				OR: [
					...orConditions,
					...adminAndContractorConditions,
					...clientSelfConditions,
					...clientConditions,
					...contractorFullNameConditions,
				],
			},
			select,
		},)
	}

	public async findProductsCouponsPackages<T>(
		model: any,
		fields: Array<string>,
		search: string,
		select: Prisma.SelectSubset<T, any>,
	): Promise<Array<T>> {
		if (!search) {
			return []
		}

		const orConditions = fields.map((field,) => {
			if (field.includes('.',)) {
				const [relation, relatedField,] = field.split('.',)
				return {
					// @ts-ignore
					[relation]: {
						// @ts-ignore

						[relatedField]: {
							contains: search,
							mode:     'insensitive',
						},
					},
				}
			}
			return {
				[field]: {
					contains: search,
					mode:     'insensitive',
				},
			}
		},)
		return  model.findMany({
			where: {
				OR: orConditions,
			},
			select,
		},)
	}

	public async findGlobalSearch(data: GetGlobalSearchDto,) {
		const { search, category, skip, take, } = data

		if (!search) {
			return null
		}
		const selectedCategories = category?.map((c,) => {
			return c.toLowerCase()
		},)
		const searchMap: Record<string, () => Promise<any>> = {
			admins: async() => {
				return this.findGlobalSearchByModel(this.prisma.admin, DEFAULT_SEARCH_VALUES, search, DEFAULT_SELECT_PERSON, take, skip,)
			},

			contractors: async() => {
				return this.findGlobalSearchByModel(this.prisma.contractor, DEFAULT_SEARCH_VALUES, search, DEFAULT_SELECT_PERSON, take, skip,)
			},

			clients: async() => {
				const b2c = await this.findGlobalSearchByModel(
					this.prisma.b2CClients,
					[
						EFieldSearch.FIRSTNAME,
						EFieldSearch.LASTNAME,
						EFieldSearch.EMAIL,
						EFieldSearch.PHONE_NUMBER,
						EFieldSearch.ADDRESS,
					],
					search,
					DEFAULT_SELECT_CLIENT,
					take,
					skip,
				)

				const b2b = await this.findGlobalSearchByModel(
					this.prisma.b2BClients,
					[
						EFieldSearch.FIRSTNAME,
						EFieldSearch.LASTNAME,
						EFieldSearch.EMAIL,
						EFieldSearch.PHONE_NUMBER,
						EFieldSearch.ADDRESS,
					],
					search,
					DEFAULT_SELECT_CLIENT,
					take,
					skip,
				)

				return [
					...b2c.map((client,) => {
						return { ...client, clientType: 'B2C', }
					},),
					...b2b.map((client,) => {
						return { ...client, clientType: 'B2B', }
					},),
				]
			},

			trainings: async() => {
				return this.findGlobalSearchByModel(
					this.prisma.training,
					['title', 'admin.name', 'admin.surname',],
					search,
					{
						[EFieldSearch.ID]:    true,
						[EFieldSearch.TITLE]: true,
						admin:                {
							select: {
								id:      true,
								name:    true,
								surname: true,
								avatar:  true,
							},
						},
					},
					take,
					skip,
				)
			},

			orders: async() => {
				return this.findGlobalSearchByModel(
					this.prisma.booking,
					[
						'address',
						'b2CClients.firstName',
						'b2CClients.lastName',
						'b2BClients.lastName',
						'b2BClients.firstName',
						'contractor.name',
						'contractor.surname',
					],
					search,
					{
						id:          true,
						address:     true,
						bookingType: true,
						date_time:   true,
						contractor:  {
							select: {
								name:    true,
								surname: true,
								avatar:  true,
							},
						},
						b2CClients: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
						b2BClients: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
					take,
					skip,
				)
			},

			bookings: async() => {
				return this.findGlobalSearchByModel(
					this.prisma.booking,
					[
						'address',
						'b2CClients.firstName',
						'b2CClients.lastName',
						'b2BClients.lastName',
						'b2BClients.firstName',
						'contractor.name',
						'contractor.surname',
					],
					search,
					{
						id:          true,
						address:     true,
						bookingType: true,
						date_time:   true,
						contractor:  {
							select: {
								name:    true,
								surname: true,
								avatar:  true,
							},
						},
						b2CClients: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
						b2BClients: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
					take,
					skip,
				)
			},

			disputes: async() => {
				const contractorDisputes = await this.findGlobalSearchByModel(
					this.prisma.contractorDispute,
					['contractor.name', 'contractor.surname',],
					search,
					{
						id:         true,
						contractor: {
							select: {
								name:    true,
								surname: true,
							},
						},
						description: true,
						status:      true,
						created_at:  true,
					},
					take,
					skip,
				)

				const clientDisputes = await this.findGlobalSearchByModel(
					this.prisma.clientDispute,
					['b2CClient.firstName', 'b2CClient.lastName',],
					search,
					{
						id:        true,
						b2CClient: {
							select: {
								firstName: true,
								lastName:  true,
							},
						},
						description: true,
						status:      true,
						created_at:  true,
					},
					take,
					skip,
				)

				return [
					...contractorDisputes.map((d,) => {
						return { ...d, disputeType: 'CONTRACTOR', }
					},),
					...clientDisputes.map((d,) => {
						return { ...d, disputeType: 'CLIENT', }
					},),
				]
			},

			products_coupons_packages: async() => {
				const products = await this.findProductsCouponsPackages(
					this.prisma.product,
					['name',],
					search,
					{ id: true, name: true, },
				)

				const packages = await this.findProductsCouponsPackages(
					this.prisma.package,
					['title',],
					search,
					{ id: true, title: true, },
				)

				const coupons = await this.findProductsCouponsPackages(
					this.prisma.coupon,
					['title',],
					search,
					{ id: true, title: true, },
				)

				return [
					...products.map((p,) => {
						return { ...p, type: 'PRODUCT', }
					},),
					...packages.map((p,) => {
						return { ...p, type: 'PACKAGE', }
					},),
					...coupons.map((c,) => {
						return { ...c, type: 'COUPON', }
					},),
				]
			},
		}

		const keysToSearch = selectedCategories?.length ?
			selectedCategories.filter((key,) => {
				return key in searchMap
			},) :
			Object.keys(searchMap,)

		const entries = await Promise.all(
			keysToSearch.map(async(key,) => {
				const value = await searchMap[key]?.()
				return [key, value,] as const
			},),
		)
		const results = Object.fromEntries(entries,)
		return results
	}
}
