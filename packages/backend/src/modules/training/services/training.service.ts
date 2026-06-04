/* eslint-disable no-mixed-spaces-and-tabs */
import { Injectable, } from '@nestjs/common'
import type { Prisma, Review, Training, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import * as path from 'path'
import type { FilterDto, GetTrainingsDto, } from '../dto/get-training.dto'
import type {
	ITrainingListReturn,
	TrainingCreateInput,
} from '../training.types'
import { UploadService, } from 'src/modules/upload/upload.service'
import type { AssignContractorDto, CreateTrainingDto, } from '../dto/create-training.dto'
import type { Express, } from 'express'
import { TrainingContractorDto, } from '../dto/training-contractor.dto'
import type { PageOptionsDto, } from 'src/shared/dto/page-options.dto'
import type { PagedResDto, } from 'src/shared/dto/paged-res.dto'

@Injectable()
export class TrainingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly uploadService: UploadService,
	) {}

	public async addTraining(data : {adminId:string; body : CreateTrainingDto},): Promise<Training> {
		const {contractors, ...rest} = data.body

		const newTraining = await this.prisma.training.create({
			data: {
				...rest,
				admin: {
					connect: {
						id: data.adminId,
					},
				},
			},
		},)

		if (contractors.length > 0) {
			const contractorTraining = contractors.map(((contractorId,) => {
				return {
					training_id:   newTraining.id,
					contractor_id: contractorId,
				}
			}),)

			await this.prisma.contractorTraining.createMany({
				data: contractorTraining,
			},)
		}

		return newTraining
	}

	public async getTrainingReviews(trainingId : string,data : PageOptionsDto,): Promise<PagedResDto<Review>> {
		const {skip,take,} = data
		const reviews = await this.prisma.review.findMany({
			where: {
				training_id: trainingId,
			},
			skip,
			take,
			include: {
				contractor: true,
			},
		},)

		const totalCount = await this.prisma.review.count({
			where: {
				training_id: trainingId,
			},
		},)

		return {
			data:    reviews,
			hasNext: totalCount > skip + take,
		}
	}

	public async uploadTrainingMaterial(file: Express.Multer.File,trainingId:string,): Promise<Training> {
		const filePath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'..',
			'..',
			'uploads',
			file.filename,
		)

		const uploadedFile = await this.uploadService.uploadLocalFileToS3(
			filePath,
			file.originalname,
		)

		const uploadedTraining = await this.prisma.training.update({
			where: {
				id: trainingId,
			},
			data: {
				file: uploadedFile.url,
			},
		},)

		return uploadedTraining
	}

	public getTrainingFilterWhere(
		filter: FilterDto | undefined,
	): Prisma.TrainingWhereInput {
		const filterWhere: Prisma.TrainingWhereInput = {}

		if (filter) {
			const { category, dateFrom, dateTo, } = filter
			filterWhere.created_at = {}
			if (category) {
				Object.assign(filterWhere, {
					category: {
						in: category,
					},
				},)
			}
			if (dateFrom) {
				filterWhere.created_at.gte = new Date(dateFrom,)
			}
			if (dateTo) {
				const endOfDay = new Date(dateTo,)
				endOfDay.setHours(23, 59, 59, 999,)
				filterWhere.created_at.lte = endOfDay
			}
		}

		return filterWhere
	}

	public async filteredTrainings(
		data: GetTrainingsDto,
	): Promise<ITrainingListReturn> {
		const { page, limit, search, filter, } = data
		const numberedPage = Number.parseInt(page, 10,)
		const numberedLimit = Number.parseInt(limit, 10,)
		const skip = (numberedPage - 1) * numberedLimit

		const filterWhere = this.getTrainingFilterWhere(filter,)

		let orderBy: Prisma.TrainingOrderByWithRelationInput = {}
		if (filter?.sortBy) {
			if (filter.sortBy === 'alphabetic') {
				orderBy = { title: filter.sortDirection! as Prisma.SortOrder, }
			} else if (filter.sortBy === 'uploaded') {
				orderBy = {
					created_at: filter.sortDirection! as Prisma.SortOrder,
				}
			} else {
				orderBy = {
					reviews: {
						_count: filter.sortDirection! as Prisma.SortOrder,
					},
				}
			}
		}

		const where: Prisma.TrainingWhereInput = {
			...filterWhere,
			OR: [{ title: { contains: search, mode: 'insensitive', }, },],
		}

		const trainings = await this.prisma.training.findMany({
			where,
			orderBy,
			skip,
			take:    numberedLimit,
			include: {
				_count: {
				  select: { reviews: true, },
				},
			  },
		},)

		const totalCount = await this.prisma.training.count({
			where,
		},)

		const maxPage = Math.ceil(totalCount / numberedLimit,)

		return { trainings, maxPage: maxPage === 0 ?
			1 :
			maxPage, }
	}

	public async changeTraining(
		id: string,
		data: Prisma.TrainingUpdateInput,
	): Promise<Training> {
		const { file, } = data
		if (file) {
			// if file is url just update, else upload and update
		}
		const training = await this.prisma.training.update({
			where: {
				id,
			},
			data,
			include: {
				_count: {
				  select: { reviews: true, },
				},
			  },
		},)

		return training
	}

	public async addReview(
		trainingId: string,
		contractorId: string,
		text: string,
	): Promise<Review> {
		const review = await this.prisma.review.create({
			data: {
				text,
				training: {
					connect: {
						id: trainingId,
					},
				},
				contractor: {
					connect: {
						id: contractorId,
					},
				},
			},
		},)

		return review
	}

	public async deleteTraining(id: string,): Promise<void> {
		await this.prisma.training.delete({
			where: { id, },
		},)
	}

	public async assignTraining(trainingId: string, data: AssignContractorDto,): Promise<void> {
		const existingContractorTrainings = await this.prisma.contractorTraining.findMany({
		  where:  { training_id: trainingId, },
		  select: { contractor_id: true, },
		},)

		const existingContractorIds = existingContractorTrainings.map((ct,) => {
			return ct.contractor_id
		},)

		const newContractorIds = data.contractors

		const contractorsToAdd = newContractorIds.filter((id,) => {
			return !existingContractorIds.includes(id,)
		},)

		const contractorsToRemove = existingContractorIds.filter((id,) => {
			return !newContractorIds.includes(id,)
		},)

		if (contractorsToRemove.length > 0) {
		  await this.prisma.contractorTraining.deleteMany({
				where: {
			  training_id:   trainingId,
			  contractor_id: { in: contractorsToRemove, },
				},
		  },)
		}

		if (contractorsToAdd.length > 0) {
		  await this.prisma.contractorTraining.createMany({
				data: contractorsToAdd.map((contractorId,) => {
					return {
			  training_id:   trainingId,
			  contractor_id: contractorId,
					}
				},),
		  },)
		}
	  }

	public async getTrainingContractors(trainingId : string,): Promise<Array<TrainingContractorDto>> {
		const contractors = await this.prisma.contractorTraining.findMany({
			where: {
				training_id: trainingId,
			},
			include: {
				contractor: {
					select: {
						id:      true,
						name:    true,
						surname: true,
						avatar:  true,
						phone:   true,
					},
				},
			},
		},)
		return contractors.map((contractor,) => {
			return new TrainingContractorDto(contractor.contractor,)
		},)
	}
}
