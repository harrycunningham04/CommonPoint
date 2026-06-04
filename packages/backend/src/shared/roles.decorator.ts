import type { CustomDecorator,} from '@nestjs/common'
import { SetMetadata, } from '@nestjs/common'
import { ACCESS_KEY, } from './constants/roles.constants'

export const Roles = (access: number,): CustomDecorator<string> => {
	return SetMetadata(ACCESS_KEY, access,)
}
