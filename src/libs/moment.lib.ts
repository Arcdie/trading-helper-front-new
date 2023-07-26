import moment from 'moment';

type StringOrDate = string | Date;

export class MomentLib {
  static addMinutes(date: StringOrDate, numberMinutes: number) {
    return moment(date).add(numberMinutes, 'minutes').toISOString();
  }

  static getStartOfMinute(date: StringOrDate) {
    return moment(MomentLib.toUTC(date)).startOf('minute').toISOString();
  }

  static toUTC(date: StringOrDate) {
    return moment.utc(date).toISOString();
  }

  static toYearMonthDayFormat(date: StringOrDate) {
    return moment(date).format('YYYY-MM-DD');
  }
}
