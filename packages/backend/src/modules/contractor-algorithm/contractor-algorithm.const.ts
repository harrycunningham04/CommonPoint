import { ContractorScore, } from '../statistic-tracking/types'

export const startsFromHighToLow = [ContractorScore.HIGH, ContractorScore.REGULAR, ContractorScore.LOW,]
export const startsFromLowToHigh = [ContractorScore.LOW, ContractorScore.REGULAR, ContractorScore.HIGH,]
export const startsFromRegularToHighAndLow = [ContractorScore.REGULAR, ContractorScore.HIGH, ContractorScore.LOW,]
export const startsFromRegularToLowAndHigh = [ContractorScore.REGULAR, ContractorScore.LOW, ContractorScore.HIGH,]