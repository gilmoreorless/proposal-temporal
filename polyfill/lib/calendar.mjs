import { ES } from './ecmascript.mjs';
import { GetIntrinsic, MakeIntrinsicClass } from './intrinsicclass.mjs';
import { CALENDAR, CALENDAR_ID, ISO_YEAR, ISO_MONTH, ISO_DAY, CreateSlots, GetSlot, SetSlot } from './slots.mjs';

export class Calendar {
  constructor(id) {
    CreateSlots(this);
    SetSlot(this, CALENDAR_ID, id);
  }
  get id() {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR_ID);
  }
  dateFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  dateTimeFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  yearMonthFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  monthDayFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  fields(fields) {
    return fields.slice();
  }
  plus(date, duration, options, constructor) {
    void date;
    void duration;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  minus(date, duration, options, constructor) {
    void date;
    void duration;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  difference(smaller, larger, options) {
    void smaller;
    void larger;
    void options;
    throw new Error('not implemented');
  }
  year(date) {
    void date;
    throw new Error('not implemented');
  }
  month(date) {
    void date;
    throw new Error('not implemented');
  }
  day(date) {
    void date;
    throw new Error('not implemented');
  }
  dayOfWeek(date) {
    void date;
    throw new Error('not implemented');
  }
  dayOfYear(date) {
    void date;
    throw new Error('not implemented');
  }
  weekOfYear(date) {
    void date;
    throw new Error('not implemented');
  }
  daysInMonth(date) {
    void date;
    throw new Error('not implemented');
  }
  daysInYear(date) {
    void date;
    throw new Error('not implemented');
  }
  isLeapYear(date) {
    void date;
    throw new Error('not implemented');
  }
  toString() {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR_ID);
  }
  static from(item) {
    return ES.ToTemporalCalendar(item);
  }
}

MakeIntrinsicClass(Calendar, 'Temporal.Calendar');

export class Iso8601 extends Calendar {
  constructor() {
    super('iso8601');
  }
  dateFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    // Intentionally alphabetical
    let { year, month, day } = ES.ToRecord(fields, [['day'], ['month'], ['year']]);
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));
    return new constructor(year, month, day, this);
  }
  dateTimeFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    // Intentionally alphabetical
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.ToRecord(fields, [
      ['day'],
      ['hour', 0],
      ['microsecond', 0],
      ['millisecond', 0],
      ['minute', 0],
      ['month'],
      ['nanosecond', 0],
      ['second', 0],
      ['year']
    ]);
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
    return new constructor(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, this);
  }
  yearMonthFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    // Intentionally alphabetical
    let { year, month } = ES.ToRecord(fields, [['month'], ['year']]);
    ({ year, month } = ES.RegulateYearMonth(year, month, disambiguation));
    return new constructor(year, month, this, /* refIsoDay = */ 1);
  }
  monthDayFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    // Intentionally alphabetical
    let { month, day } = ES.ToRecord(fields, [['day'], ['month']]);
    ({ month, day } = ES.RegulateMonthDay(month, day, disambiguation));
    return new constructor(month, day, this, /* refIsoYear = */ 1972);
  }
  plus(date, duration, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);

    const { years, months, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    const { days } = ES.BalanceDuration(
      duration.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'days'
    );

    let year = GetSlot(date, ISO_YEAR);
    let month = GetSlot(date, ISO_MONTH);
    let day = GetSlot(date, ISO_DAY);
    ({ year, month, day } = ES.AddDate(year, month, day, years, months, days, disambiguation));
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));

    return new constructor(year, month, day, this);
  }
  minus(date, duration, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);

    const { years, months, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    const { days } = ES.BalanceDuration(
      duration.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'days'
    );

    let year = GetSlot(date, ISO_YEAR);
    let month = GetSlot(date, ISO_MONTH);
    let day = GetSlot(date, ISO_DAY);
    ({ year, month, day } = ES.SubtractDate(year, month, day, years, months, days, disambiguation));
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));

    return new constructor(year, month, day, this);
  }
  difference(smaller, larger, options) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const largestUnit = ES.ToLargestTemporalUnit(options, 'days', ['hours', 'minutes', 'seconds']);
    const { years, months, days } = ES.DifferenceDate(smaller, larger, largestUnit);
    const Duration = GetIntrinsic('%Temporal.Duration%');
    return new Duration(years, months, days, 0, 0, 0, 0, 0, 0);
  }
  year(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(date, ISO_YEAR);
  }
  month(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(date, ISO_MONTH);
  }
  day(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(date, ISO_DAY);
  }
  dayOfWeek(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return ES.DayOfWeek(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH), GetSlot(date, ISO_DAY));
  }
  dayOfYear(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return ES.DayOfYear(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH), GetSlot(date, ISO_DAY));
  }
  weekOfYear(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return ES.WeekOfYear(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH), GetSlot(date, ISO_DAY));
  }
  daysInMonth(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return ES.DaysInMonth(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH));
  }
  daysInYear(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return ES.LeapYear(GetSlot(date, ISO_YEAR)) ? 366 : 365;
  }
  isLeapYear(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return ES.LeapYear(GetSlot(date, ISO_YEAR));
  }
}

// Implementation details for Japanese calendar
//
// NOTE: For convenience, this hacky class only supports the most recent five
// eras, those of the modern period. For the full list, see:
// https://github.com/unicode-org/cldr/blob/master/common/supplemental/supplementalData.xml#L4310-L4546
//
// NOTE: Japan started using the Gregorian calendar in 6 Meiji, replacing a
// lunisolar calendar. So the day before January 1 of 6 Meiji (1873) was not
// December 31, but December 2, of 5 Meiji (1872). The existing Ecma-402
// Japanese calendar doesn't seem to take this into account, so neither do we:
// > args = ['en-ca-u-ca-japanese', { era: 'short' }]
// > new Date('1873-01-01T12:00').toLocaleString(...args)
// '1 1, 6 Meiji, 12:00:00 PM'
// > new Date('1872-12-31T12:00').toLocaleString(...args)
// '12 31, 5 Meiji, 12:00:00 PM'
const jp = {
  eraStartDates: ['1868-09-08', '1912-07-30', '1926-12-25', '1989-01-08', '2019-05-01'],
  eraAddends: [1867, 1911, 1925, 1988, 2018],

  // This is what API consumers pass in as the value of the 'era' field. We use
  // string constants consisting of the romanized name
  // Unfortunately these are not unique throughout history, so this should be
  // solved: https://github.com/tc39/proposal-temporal/issues/526
  // Otherwise, we'd have to introduce some era numbering system, which (as far
  // as I can tell from Wikipedia) the calendar doesn't have, so would be
  // non-standard and confusing, requiring API consumers to figure out "now what
  // number is the Reiwa (current) era?" My understanding is also that this
  // starting point for eras (0645-06-19) is not the only possible one, since
  // there are unofficial eras before that.
  // https://en.wikipedia.org/wiki/Japanese_era_name
  eraNames: ['meiji', 'taisho', 'showa', 'heisei', 'reiwa'],
  // Note: C locale era names available at
  // https://github.com/unicode-org/icu/blob/master/icu4c/source/data/locales/root.txt#L1582-L1818

  findEra(date) {
    const TemporalDate = GetIntrinsic('%Temporal.Date%');
    const idx = jp.eraStartDates.findIndex((dateStr) => {
      const { year, month, day } = ES.ParseTemporalDateString(dateStr);
      const startDate = new TemporalDate(year, month, day);
      return ES.CompareDate(date, startDate) < 0;
    });
    if (idx === -1) return jp.eraStartDates.length - 1;
    if (idx === 0) return 0;
    return idx - 1;
  },

  isoYear(year, era) {
    const eraIdx = jp.eraNames.indexOf(era);
    if (eraIdx === -1) throw new RangeError(`invalid era ${era}`);

    return year + jp.eraAddends[eraIdx];
  }
};

export class Japanese extends Iso8601 {
  constructor() {
    super('japanese'); // FIXME: this doesn't work if you inherit from iso8601

    const eraDescriptor = {
      get() {
        const calendar = GetSlot(this, CALENDAR);
        return calendar.era ? calendar.era(this) : undefined;
      },
      enumerable: false,
      configurable: true
    };
    const Date = GetIntrinsic('%Temporal.Date%');
    Object.defineProperty(Date.prototype, 'era', eraDescriptor);
    const DateTime = GetIntrinsic('%Temporal.DateTime%');
    Object.defineProperty(DateTime.prototype, 'era', eraDescriptor);
    const YearMonth = GetIntrinsic('%Temporal.YearMonth%');
    Object.defineProperty(YearMonth.prototype, 'era', eraDescriptor);
  }

  era(date) {
    return jp.eraNames[jp.findEra(date)];
  }
  year(date) {
    const eraIdx = jp.findEra(date);
    return GetSlot(date, ISO_YEAR) - jp.eraAddends[eraIdx];
  }

  fields(fields) {
    return fields
      .flatMap((field) => {
        if (field === 'year') return ['era', 'year'];
        return field;
      })
      .sort();
  }
  dateFromFields(fields, options, constructor) {
    // Intentionally alphabetical
    fields = ES.ToRecord(fields, [['day'], ['era'], ['month'], ['year']]);
    const isoYear = jp.isoYear(fields.year, fields.era);
    return super.dateFromFields({ ...fields, year: isoYear }, options, constructor);
  }
  dateTimeFromFields(fields, options, constructor) {
    // Intentionally alphabetical
    fields = ES.ToRecord(fields, [
      ['day'],
      ['era'],
      ['hour', 0],
      ['month'],
      ['microsecond', 0],
      ['millisecond', 0],
      ['minute', 0],
      ['nanosecond', 0],
      ['second', 0],
      ['year']
    ]);
    const isoYear = jp.isoYear(fields.year, fields.era);
    return super.dateTimeFromFields({ ...fields, year: isoYear }, options, constructor);
  }
  yearMonthFromFields(fields, options, constructor) {
    // Intentionally alphabetical
    fields = ES.ToRecord(fields, [['era'], ['month'], ['year']]);
    const isoYear = jp.isoYear(fields.year, fields.era);
    return super.yearMonthFromFields({ ...fields, year: isoYear }, options, constructor);
  }
}
