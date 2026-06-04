import moment from 'moment-timezone'

moment.tz.setDefault('Europe/London',)

export default moment

export const offsetDiffHours = moment().utcOffset() / 60