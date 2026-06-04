import { IsOptional, IsString } from 'class-validator'

export class CheckAddressDto {
    @IsOptional()
    @IsString()
    public address!: string
}
