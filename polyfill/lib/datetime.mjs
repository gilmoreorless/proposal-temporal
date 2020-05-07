import { ES } from './ecmascript.mjs';
import { GetIntrinsic, MakeIntrinsicClass } from './intrinsicclass.mjs';

import {
  ISO_YEAR,
  ISO_MONTH,
  ISO_DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLISECOND,
  MICROSECOND,
  NANOSECOND,
  CALENDAR,
  CreateSlots,
  GetSlot,
  SetSlot
} from './slots.mjs';

const ObjectAssign = Object.assign;

export class DateTime {
  constructor(
    isoYear,
    isoMonth,
    isoDay,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
    microsecond = 0,
    nanosecond = 0,
    calendar = undefined
  ) {
    isoYear = ES.ToInteger(isoYear);
    isoMonth = ES.ToInteger(isoMonth);
    isoDay = ES.ToInteger(isoDay);
    hour = ES.ToInteger(hour);
    minute = ES.ToInteger(minute);
    second = ES.ToInteger(second);
    millisecond = ES.ToInteger(millisecond);
    microsecond = ES.ToInteger(microsecond);
    nanosecond = ES.ToInteger(nanosecond);
    calendar = ES.ToTemporalCalendar(calendar);
    ES.RejectDateTime(isoYear, isoMonth, isoDay, hour, minute, second, millisecond, microsecond, nanosecond);
    CreateSlots(this);
    SetSlot(this, ISO_YEAR, isoYear);
    SetSlot(this, ISO_MONTH, isoMonth);
    SetSlot(this, ISO_DAY, isoDay);
    SetSlot(this, HOUR, hour);
    SetSlot(this, MINUTE, minute);
    SetSlot(this, SECOND, second);
    SetSlot(this, MILLISECOND, millisecond);
    SetSlot(this, MICROSECOND, microsecond);
    SetSlot(this, NANOSECOND, nanosecond);
    SetSlot(this, CALENDAR, calendar);
  }
  get year() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).year(this);
  }
  get month() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).month(this);
  }
  get day() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).day(this);
  }
  get hour() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, HOUR);
  }
  get minute() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, MINUTE);
  }
  get second() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, SECOND);
  }
  get millisecond() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, MILLISECOND);
  }
  get microsecond() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, MICROSECOND);
  }
  get nanosecond() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, NANOSECOND);
  }
  get calendar() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR);
  }
  get dayOfWeek() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).dayOfWeek(this);
  }
  get dayOfYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).dayOfYear(this);
  }
  get weekOfYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).weekOfYear(this);
  }
  get daysInYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInYear(this);
  }
  get daysInMonth() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInMonth(this);
  }
  get isLeapYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).isLeapYear(this);
  }
  with(temporalDateTimeLike, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    let source = this;
    let calendar = temporalDateTimeLike.calendar;
    if (calendar) {
      source = new DateTime(
        GetSlot(this, ISO_YEAR),
        GetSlot(this, ISO_MONTH),
        GetSlot(this, ISO_DAY),
        GetSlot(this, HOUR),
        GetSlot(this, MINUTE),
        GetSlot(this, SECOND),
        GetSlot(this, MILLISECOND),
        GetSlot(this, MICROSECOND),
        GetSlot(this, NANOSECOND),
        calendar
      );
    } else {
      calendar = GetSlot(this, CALENDAR);
    }
    const fieldNames = calendar.fields([
      'day',
      'hour',
      'microsecond',
      'millisecond',
      'minute',
      'month',
      'nanosecond',
      'second',
      'year'
    ]);
    const props = ES.ToPartialRecord(temporalDateTimeLike, fieldNames);
    if (!props) {
      throw new RangeError('invalid date-time-like');
    }
    const fields = ES.ToRecord(
      source,
      fieldNames.map((name) => [name])
    );
    ObjectAssign(fields, props);
    const Construct = ES.SpeciesConstructor(this, DateTime);
    const result = calendar.dateTimeFromFields(fields, options, Construct);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  plus(temporalDurationLike, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);

    // Delegate the date part addition to the calendar
    const calendar = GetSlot(this, CALENDAR);
    const Date = GetIntrinsic('%Temporal.Date%');
    const addedDate = calendar.plus(
      new Date(GetSlot(this, ISO_YEAR), GetSlot(this, ISO_MONTH), GetSlot(this, ISO_DAY), calendar),
      duration,
      options,
      Date
    );
    let year = GetSlot(addedDate, ISO_YEAR);
    let month = GetSlot(addedDate, ISO_MONTH);
    let day = GetSlot(addedDate, ISO_DAY);

    // Add the time part
    let { hour, minute, second, millisecond, microsecond, nanosecond } = this;
    const { hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.BalanceDuration(
      duration.days,
      duration.hours,
      duration.minutes,
      duration.seconds,
      duration.milliseconds,
      duration.microseconds,
      duration.nanoseconds,
      'days'
    );
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.AddTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    ));
    day += deltaDays;
    ({ year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.RegulateDateTime(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      disambiguation
    ));
    const Construct = ES.SpeciesConstructor(this, DateTime);
    const result = new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  minus(temporalDurationLike, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);

    // Subtract the time part
    let { hour, minute, second, millisecond, microsecond, nanosecond } = this;
    const { hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.BalanceDuration(
      duration.days,
      duration.hours,
      duration.minutes,
      duration.seconds,
      duration.milliseconds,
      duration.microseconds,
      duration.nanoseconds,
      'days'
    );
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.SubtractTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    ));

    // Delegate the date part subtraction to the calendar
    const calendar = GetSlot(this, CALENDAR);
    const Date = GetIntrinsic('%Temporal.Date%');
    const addedDate = calendar.minus(
      new Date(GetSlot(this, ISO_YEAR), GetSlot(this, ISO_MONTH), GetSlot(this, ISO_DAY), calendar),
      { ...duration, days: duration.days - deltaDays },
      options,
      Date
    );
    let year = GetSlot(addedDate, ISO_YEAR);
    let month = GetSlot(addedDate, ISO_MONTH);
    let day = GetSlot(addedDate, ISO_DAY);

    ({ year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.RegulateDateTime(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      disambiguation
    ));
    const Construct = ES.SpeciesConstructor(this, DateTime);
    const result = new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  difference(other, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDateTime(other)) throw new TypeError('invalid DateTime object');
    const calendar = GetSlot(this, CALENDAR);
    if (calendar.id !== GetSlot(other, CALENDAR).id) {
      other = new DateTime(
        GetSlot(other, ISO_YEAR),
        GetSlot(other, ISO_MONTH),
        GetSlot(other, ISO_DAY),
        GetSlot(other, HOUR),
        GetSlot(other, MINUTE),
        GetSlot(other, SECOND),
        GetSlot(other, MILLISECOND),
        GetSlot(other, MICROSECOND),
        GetSlot(other, NANOSECOND),
        calendar
      );
    }
    const largestUnit = ES.ToLargestTemporalUnit(options, 'days');
    const [smaller, larger] = [this, other].sort(DateTime.compare);
    let { deltaDays, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.DifferenceTime(
      smaller,
      larger
    );
    let year = GetSlot(larger, ISO_YEAR);
    let month = GetSlot(larger, ISO_MONTH);
    let day = GetSlot(larger, ISO_DAY) + deltaDays;
    ({ year, month, day } = ES.BalanceDate(year, month, day));

    const Date = GetIntrinsic('%Temporal.Date%');
    const adjustedLarger = new Date(year, month, day, GetSlot(larger, CALENDAR));
    let dateLargestUnit = 'days';
    if (largestUnit === 'years' || largestUnit === 'months') {
      dateLargestUnit = largestUnit;
    }
    const dateOptions = ObjectAssign({}, options, { largestUnit: dateLargestUnit });
    const dateDifference = calendar.difference(smaller, adjustedLarger, dateOptions);

    let days;
    ({ days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.BalanceDuration(
      dateDifference.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      largestUnit
    ));

    const Duration = GetIntrinsic('%Temporal.Duration%');
    return new Duration(
      dateDifference.years,
      dateDifference.months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    );
  }
  equals(other) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDateTime(other)) throw new TypeError('invalid Date object');
    for (const slot of [ISO_YEAR, ISO_MONTH, ISO_DAY, HOUR, MINUTE, SECOND, MILLISECOND, MICROSECOND, NANOSECOND]) {
      const val1 = GetSlot(this, slot);
      const val2 = GetSlot(other, slot);
      if (val1 !== val2) return false;
    }
    return true;
  }
  toString() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    let year = ES.ISOYearString(GetSlot(this, ISO_YEAR));
    let month = ES.ISODateTimePartString(GetSlot(this, ISO_MONTH));
    let day = ES.ISODateTimePartString(GetSlot(this, ISO_DAY));
    let hour = ES.ISODateTimePartString(GetSlot(this, HOUR));
    let minute = ES.ISODateTimePartString(GetSlot(this, MINUTE));
    let second = ES.ISOSecondsString(
      GetSlot(this, SECOND),
      GetSlot(this, MILLISECOND),
      GetSlot(this, MICROSECOND),
      GetSlot(this, NANOSECOND)
    );
    let resultString = `${year}-${month}-${day}T${hour}:${minute}${second ? `:${second}` : ''}`;
    return resultString;
  }
  toLocaleString(...args) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return new Intl.DateTimeFormat(...args).format(this);
  }

  inTimeZone(temporalTimeZoneLike = 'UTC', options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const timeZone = ES.ToTemporalTimeZone(temporalTimeZoneLike);
    const disambiguation = ES.ToTimeZoneTemporalDisambiguation(options);
    return timeZone.getAbsoluteFor(this, { disambiguation });
  }
  getDate() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const Date = GetIntrinsic('%Temporal.Date%');
    return new Date(GetSlot(this, ISO_YEAR), GetSlot(this, ISO_MONTH), GetSlot(this, ISO_DAY), GetSlot(this, CALENDAR));
  }
  getYearMonth() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const YearMonth = GetIntrinsic('%Temporal.YearMonth%');
    const calendar = GetSlot(this, CALENDAR);
    const fieldNames = calendar.fields(['month', 'year']);
    const fields = ES.ToRecord(
      this,
      fieldNames.map((name) => [name])
    );
    return calendar.yearMonthFromFields(fields, {}, YearMonth);
  }
  getMonthDay() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const MonthDay = GetIntrinsic('%Temporal.MonthDay%');
    const calendar = GetSlot(this, CALENDAR);
    const fieldNames = calendar.fields(['day', 'month']);
    const fields = ES.ToRecord(
      this,
      fieldNames.map((name) => [name])
    );
    return calendar.monthDayFromFields(fields, {}, MonthDay);
  }
  getTime() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const Time = GetIntrinsic('%Temporal.Time%');
    return new Time(
      GetSlot(this, HOUR),
      GetSlot(this, MINUTE),
      GetSlot(this, SECOND),
      GetSlot(this, MILLISECOND),
      GetSlot(this, MICROSECOND),
      GetSlot(this, NANOSECOND)
    );
  }
  getFields() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const calendar = GetSlot(this, CALENDAR);
    const fieldNames = calendar.fields([
      'day',
      'hour',
      'microsecond',
      'millisecond',
      'minute',
      'month',
      'nanosecond',
      'second',
      'year'
    ]);
    const fields = ES.ToRecord(
      this,
      fieldNames.map((name) => [name])
    );
    if (!fields) throw new TypeError('invalid receiver');
    fields.calendar = calendar;
    return fields;
  }
  getISOFields() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return {
      year: GetSlot(this, ISO_YEAR),
      month: GetSlot(this, ISO_MONTH),
      day: GetSlot(this, ISO_DAY),
      hour: GetSlot(this, HOUR),
      minute: GetSlot(this, MINUTE),
      second: GetSlot(this, SECOND),
      millisecond: GetSlot(this, MILLISECOND),
      microsecond: GetSlot(this, MICROSECOND),
      nanosecond: GetSlot(this, NANOSECOND)
    };
  }

  static from(item, options = undefined) {
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, calendar, result;
    if (typeof item === 'object' && item) {
      if (ES.IsTemporalDateTime(item)) {
        year = GetSlot(item, ISO_YEAR);
        month = GetSlot(item, ISO_MONTH);
        day = GetSlot(item, ISO_DAY);
        hour = GetSlot(item, HOUR);
        minute = GetSlot(item, MINUTE);
        second = GetSlot(item, SECOND);
        millisecond = GetSlot(item, MILLISECOND);
        microsecond = GetSlot(item, MICROSECOND);
        nanosecond = GetSlot(item, NANOSECOND);
        calendar = GetSlot(item, CALENDAR);
        result = new this(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, calendar);
      } else {
        calendar = ES.ToTemporalCalendar(item.calendar);
        result = calendar.dateTimeFromFields(item, options, this);
      }
    } else {
      ({
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        microsecond,
        nanosecond
      } = ES.ParseTemporalDateTimeString(ES.ToString(item)));
      ({ year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.RegulateDateTime(
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        microsecond,
        nanosecond,
        disambiguation
      ));
      calendar = ES.GetDefaultCalendar();
      result = new this(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, calendar);
    }
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  static compare(one, two) {
    if (!ES.IsTemporalDateTime(one) || !ES.IsTemporalDateTime(two)) throw new TypeError('invalid DateTime object');
    for (const slot of [ISO_YEAR, ISO_MONTH, ISO_DAY, HOUR, MINUTE, SECOND, MILLISECOND, MICROSECOND, NANOSECOND]) {
      const val1 = GetSlot(one, slot);
      const val2 = GetSlot(two, slot);
      if (val1 !== val2) return ES.ComparisonResult(val1 - val2);
    }
    return ES.ComparisonResult(0);
  }
}
DateTime.prototype.toJSON = DateTime.prototype.toString;

MakeIntrinsicClass(DateTime, 'Temporal.DateTime');
