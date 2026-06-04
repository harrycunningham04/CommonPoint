import { IsNumber, } from 'class-validator'
import { IsString, } from 'class-validator'
import { IsUUID, } from 'class-validator'

export class BookingAttachmentResDto {
	constructor(data?: BookingAttachmentResDto,) {
		if (data) {
			this.id = data.id
			this.name = data.name
			this.size = data.size
			this.url = data.url
			return
		}
		this.id = ''
		this.name = ''
		this.size = 0
		this.url = ''
	}

  @IsUUID()
	public id: string

  @IsString()
  public name: string

  @IsNumber()
  public size: number

  @IsString()
  public url: string
}