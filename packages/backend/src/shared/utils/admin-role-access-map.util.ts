/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { roleToAccessLevelMap, } from '../types/role.types'

export const adminRoleAccessMap = (role: string,): number => {
	return roleToAccessLevelMap[role] ?? 1
}
