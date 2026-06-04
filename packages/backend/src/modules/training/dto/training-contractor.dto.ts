/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import { ContractorTraining } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString, } from 'class-validator'

export class TrainingContractorDto {
	constructor(data?:TrainingContractorDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.surname = data.surname
			this.avatar = data.avatar
			this.phone = data.phone
		}
	}

    @ApiProperty({ description: 'Unique identifier of the contractor', },)
    @IsNotEmpty()
    @IsString()
	public id!: string

    @ApiProperty({ description: 'Contractor\'s first name', },)
    @IsNotEmpty()
    @IsString()
    public name!: string

    @ApiProperty({ description: 'Contractor\'s last name', },)
    @IsNotEmpty()
    @IsString()
    public surname!: string

    @ApiProperty({ description: 'Contractor\'s avatar URL (nullable)', },)
    @IsOptional()
    @IsString()
    public avatar?: string | null

    @ApiProperty({ description: 'Contractor\'s phone number (nullable)', },)
    @IsOptional()
    @IsString()
    public phone?: string | null

    public static cast(data: ContractorTraining & {contractor : TrainingContractorDto},): TrainingContractorDto {
    	return new TrainingContractorDto({
    		id:            data.contractor.id,
    		name:          data.contractor.name,
    		surname:       data.contractor.surname,
    		avatar:        data.contractor.avatar,
    		phone:         data.contractor.phone,
    	},)
    }
}