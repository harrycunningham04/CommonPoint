import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString, } from 'class-validator'

export class GetContractorAssignDto {
	constructor(data?:GetContractorAssignDto,) {
		if (data) {
			this.id = data.id
			this.avatar = data.avatar
			this.name = data.name
			this.surname = data.surname
            this.phone = data.phone
            this.onSite = data.onSite
		}
	}

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
	public id!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public name!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public surname!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public avatar!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public phone!: string

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    public onSite!: boolean
}