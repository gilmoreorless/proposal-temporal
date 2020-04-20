import { ES } from './ecmascript.mjs';
import { GetIntrinsic, MakeIntrinsicClass } from './intrinsicclass.mjs';
import { ISO_MONTH, ISO_DAY, REF_ISO_YEAR, CreateSlots, GetSlot, SetSlot } from './slots.mjs';

export class MonthDay {
  constructor(isoMonth, isoDay, refIsoYear = 1972) {
    isoMonth = ES.ToInteger(isoMonth);
    isoDay = ES.ToInteger(isoDay);
    refIsoYear = ES.ToInteger(refIsoYear);
    ES.RejectDate(refIsoYear, isoMonth, isoDay);

    CreateSlots(this);
    SetSlot(this, ISO_MONTH, isoMonth);
    SetSlot(this, ISO_DAY, isoDay);
    SetSlot(this, REF_ISO_YEAR, refIsoYear);
  }

  get month() {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, ISO_MONTH);
  }
  get day() {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, ISO_DAY);
  }

  with(temporalMonthDayLike, options) {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    const props = ES.ToPartialRecord(temporalMonthDayLike, ['day', 'month']);
    if (!props) {
      throw new RangeError('invalid month-day-like');
    }
    let { month = GetSlot(this, ISO_MONTH), day = GetSlot(this, ISO_DAY) } = props;
    ({ month, day } = ES.RegulateMonthDay(month, day, disambiguation));
    const Construct = ES.SpeciesConstructor(this, MonthDay);
    const result = new Construct(month, day);
    if (!ES.IsTemporalMonthDay(result)) throw new TypeError('invalid result');
    return result;
  }
  equals(other) {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalMonthDay(other)) throw new TypeError('invalid MonthDay object');
    for (const slot of [ISO_MONTH, ISO_DAY]) {
      const val1 = GetSlot(this, slot);
      const val2 = GetSlot(other, slot);
      if (val1 !== val2) return false;
    }
    return true;
  }
  toString() {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    let month = ES.ISODateTimePartString(GetSlot(this, ISO_MONTH));
    let day = ES.ISODateTimePartString(GetSlot(this, ISO_DAY));
    let resultString = `${month}-${day}`;
    return resultString;
  }
  toLocaleString(...args) {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    return new Intl.DateTimeFormat(...args).format(this);
  }
  withYear(item) {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    let year;
    if (typeof item === 'object') {
      ({ year } = ES.ToRecord(item, [['year']]));
    } else {
      year = ES.ToInteger(item);
    }
    const month = GetSlot(this, ISO_MONTH);
    const day = GetSlot(this, ISO_DAY);
    const Date = GetIntrinsic('%Temporal.Date%');
    return new Date(year, month, day);
  }
  getFields() {
    const fields = ES.ToRecord(this, [['day'], ['month']]);
    if (!fields) throw new TypeError('invalid receiver');
    return fields;
  }
  getISOFields() {
    if (!ES.IsTemporalMonthDay(this)) throw new TypeError('invalid receiver');
    return {
      month: GetSlot(this, ISO_MONTH),
      day: GetSlot(this, ISO_DAY)
    };
  }
  static from(item, options = undefined) {
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let month, day, refIsoYear;
    if (typeof item === 'object' && item) {
      if (ES.IsTemporalMonthDay(item)) {
        month = GetSlot(item, ISO_MONTH);
        day = GetSlot(item, ISO_DAY);
        refIsoYear = GetSlot(item, REF_ISO_YEAR);
      } else {
        // Intentionally alphabetical
        ({ month, day } = ES.ToRecord(item, [['day'], ['month']]));
        refIsoYear = 1972;
      }
    } else {
      ({ month, day } = ES.ParseTemporalMonthDayString(ES.ToString(item)));
      refIsoYear = 1972;
    }
    ({ month, day } = ES.RegulateMonthDay(month, day, disambiguation));
    const result = new this(month, day, refIsoYear);
    if (!ES.IsTemporalMonthDay(result)) throw new TypeError('invalid result');
    return result;
  }
}
MonthDay.prototype.toJSON = MonthDay.prototype.toString;

MakeIntrinsicClass(MonthDay, 'Temporal.MonthDay');
