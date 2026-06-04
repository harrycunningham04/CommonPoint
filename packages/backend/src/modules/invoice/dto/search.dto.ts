import { IsString, } from 'class-validator'
import { PageOptionsDto, } from 'src/shared/dto/page-options.dto'

export class SearchInvoicesDto extends PageOptionsDto {
	constructor(data?: SearchInvoicesDto,) {
		super(data,)
		if (data) {
			this.search = data.search
			return
		}
		this.search = ''
	}

  @IsString()
	public	search: string
}