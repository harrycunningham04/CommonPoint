import { IsNotEmpty, IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class PagedDisputesByAddressDto extends PageOptionsDto {
	constructor(data?: PagedDisputesByAddressDto,) {
		super(data,)
		if (data) {
			this.address = data.address
			return
		}
		this.address = ''
	}

  @IsString()
  @IsNotEmpty()
	public address: string
}