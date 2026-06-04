import type { Admin, B2BClients, B2CClients, Worker, } from '@prisma/client'
import type { EClientType, } from './types/client.type'

export type Message = {
    message: string
    admin?: Omit<Admin, 'password'>
}

export type ClientMessage = {
    message:string;
    client?:Omit<B2CClients | B2BClients | Worker,'password'>
    clientType? : EClientType
}