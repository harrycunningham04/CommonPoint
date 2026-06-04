import { IsNotEmpty, IsUUID, } from 'class-validator'
import { EditContractorLocationDto, } from './edit-contractor-location.dto'
import { ApiProperty, } from '@nestjs/swagger'

export class ContractorLocationResDto extends EditContractorLocationDto {
	constructor(data?: ContractorLocationResDto,) {
		super(data,)
		if (data) {
			this.id = data.id
			return
		}
		this.id = ''
	}

  @IsUUID()
  @IsNotEmpty()
	@ApiProperty({
		type:        'string',
		description: 'Contractor ID',
		example:     '123e4567-e89b-12d3-a456-426614174000',
	},)
	public id: string
}