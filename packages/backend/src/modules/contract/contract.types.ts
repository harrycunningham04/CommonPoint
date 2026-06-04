/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Training, } from '@prisma/client'
import type { Express, } from 'express'

export interface ITrainingListReturn {
    trainings: Array<Training>
    maxPage: number
}

export type ContractCreateInput = {
    contractorId: string
    adminId: string
    name: string
    file: Express.Multer.File
    created_at?: Date | string
    updated_at?: Date | string
}