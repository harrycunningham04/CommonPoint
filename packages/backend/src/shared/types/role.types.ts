export enum EAccessLevels {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
}

export const roleToAccessLevelMap: Record<string, EAccessLevels> = {
	'Head of Contractors, Head of Ops': EAccessLevels.LEVEL_2,
	'QA, New Business Sales, Admin':    EAccessLevels.LEVEL_1,
	'Director, Head of Ops':            EAccessLevels.LEVEL_2,
	'New Business Sales':               EAccessLevels.LEVEL_1,
	'Booking Admin':                    EAccessLevels.LEVEL_2,
	'Head of Ops, Head of Contractors': EAccessLevels.LEVEL_2,
	'Operation Specialist':             EAccessLevels.LEVEL_1,
}
