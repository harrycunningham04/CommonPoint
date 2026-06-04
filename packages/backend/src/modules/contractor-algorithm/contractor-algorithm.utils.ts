import { EngagementLevel, OrderValueLevel, } from '../booking-group/booking-group.types'
import type { ContractorScore, } from '../statistic-tracking/types'
import { startsFromHighToLow, startsFromLowToHigh, startsFromRegularToHighAndLow, startsFromRegularToLowAndHigh, } from './contractor-algorithm.const'

interface IProps {
	engagementLevel: EngagementLevel,
	valueLevel: OrderValueLevel,
	isPriority: boolean,
}

export const getContractorScores = ({
	engagementLevel,
	valueLevel,
	isPriority,
}: IProps,): Array<ContractorScore> => {
	const contractorFromHighToLowScores = getContractorFromHighToLowScoresB2B({
		engagementLevel,
		valueLevel,
		isPriority,
	},)
	if (contractorFromHighToLowScores) {
		return contractorFromHighToLowScores
	}

	const contractorFromRegularToHighAndLowScores = getContractorFromRegularToHighAndLowScores({
		engagementLevel,
		valueLevel,
		isPriority,
	},)
	if (contractorFromRegularToHighAndLowScores) {
		return contractorFromRegularToHighAndLowScores
	}

	const contractorFromRegularToLowAndHighScores = getContractorFromRegularToLowAndHighScores({
		engagementLevel,
		valueLevel,
		isPriority,
	},)
	if (contractorFromRegularToLowAndHighScores) {
		return contractorFromRegularToLowAndHighScores
	}

	const contractorFromLowToHighScores = getContractorFromLowToHighScores({
		engagementLevel,
		valueLevel,
		isPriority,
	},)

	if (contractorFromLowToHighScores) {
		return contractorFromLowToHighScores
	}

	const contractorFromHighToLowScoresB2C = getContractorFromHighToLowScoresB2C({
		engagementLevel,
		valueLevel,
		isPriority,
	},)

	if (contractorFromHighToLowScoresB2C) {
		return contractorFromHighToLowScoresB2C
	}

	return startsFromLowToHigh
}

const getContractorFromHighToLowScoresB2B = ({
	engagementLevel,
	isPriority,
}: IProps,): Array<ContractorScore> | null => {
	if (engagementLevel === EngagementLevel.B2B_NEW) {
		return startsFromHighToLow
	}

	if (engagementLevel === EngagementLevel.B2B_RETURNING && isPriority) {
		return startsFromHighToLow
	}

	if (engagementLevel === EngagementLevel.B2B_REGULAR && isPriority) {
		return startsFromHighToLow
	}

	return null
}

const getContractorFromHighToLowScoresB2C = ({
	engagementLevel,
	valueLevel,
}: IProps,): Array<ContractorScore> | null => {
	if (engagementLevel === EngagementLevel.B2C_FIRST_ORDER && valueLevel === OrderValueLevel.HIGH) {
		return startsFromHighToLow
	}

	if (engagementLevel === EngagementLevel.B2C_NOT_THE_FIRST_ORDER && valueLevel === OrderValueLevel.HIGH) {
		return startsFromHighToLow
	}

	return null
}

const getContractorFromRegularToHighAndLowScores = ({
	engagementLevel,
	valueLevel,
	isPriority,
}: IProps,): Array<ContractorScore> | null => {
	if (engagementLevel === EngagementLevel.B2B_RETURNING && !isPriority) {
		return startsFromRegularToHighAndLow
	}

	if (engagementLevel === EngagementLevel.B2B_LOW_VOLUME && valueLevel === OrderValueLevel.HIGH) {
		return startsFromRegularToHighAndLow
	}

	if (engagementLevel === EngagementLevel.B2B_REGULAR && isPriority) {
		return startsFromRegularToHighAndLow
	}

	return null
}

const getContractorFromRegularToLowAndHighScores = ({
	engagementLevel,
	valueLevel,
}: IProps,): Array<ContractorScore> | null => {
	if (engagementLevel === EngagementLevel.B2C_NOT_THE_FIRST_ORDER && valueLevel === OrderValueLevel.LOW) {
		return startsFromRegularToLowAndHigh
	}

	return null
}

const getContractorFromLowToHighScores = ({
	engagementLevel,
	valueLevel,
}: IProps,): Array<ContractorScore> | null => {
	if (engagementLevel === EngagementLevel.B2B_LOW_VOLUME) {
		return startsFromLowToHigh
	}

	if (engagementLevel === EngagementLevel.B2C_FIRST_ORDER && valueLevel === OrderValueLevel.LOW) {
		return startsFromLowToHigh
	}

	return null
}
