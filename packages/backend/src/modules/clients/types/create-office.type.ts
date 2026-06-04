import type { OfficeClientType, OfficeType, PaymentPreference, Preference,} from '@prisma/client'
import { Worker, } from '@prisma/client'

export interface IWorkerData {
    firstName : string;
    lastName : string;
    phoneNumber : string;
    role : string;
    email: string
}

export interface ICreateOffice {
    name :string
    address : string
    billing_address : string
    email:string;
    phone_number:string;
    officeType : OfficeType
    officeClientType : OfficeClientType
    worker : Array<IWorkerData>
    paymentPreferences : PaymentPreference
    preferences : Array<Preference>
    clientId:string
}