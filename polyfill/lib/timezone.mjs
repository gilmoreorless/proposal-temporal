import { ES } from './ecmascript.mjs';
import { GetIntrinsic, MakeIntrinsicClass } from './intrinsicclass.mjs';
import {
  TIMEZONE_ID,
  EPOCHNANOSECONDS,
  ISO_YEAR,
  ISO_MONTH,
  ISO_DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLISECOND,
  MICROSECOND,
  NANOSECOND,
  CreateSlots,
  GetSlot,
  SetSlot
} from './slots.mjs';

import * as REGEX from './regex.mjs';
const OFFSET = new RegExp(`^${REGEX.offset.source}$`);

function parseOffsetString(string) {
  const match = OFFSET.exec(String(string));
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : +1;
  const hours = +match[2];
  const minutes = +(match[3] || 0);
  return sign * (hours * 60 + minutes) * 60 * 1e9;
}

export class TimeZone {
  constructor(timeZoneIdentifier) {
    if (new.target === TimeZone) {
      timeZoneIdentifier = ES.GetCanonicalTimeZoneIdentifier(timeZoneIdentifier);
    }
    CreateSlots(this);
    SetSlot(this, TIMEZONE_ID, timeZoneIdentifier);
  }
  get name() {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    return String(GetSlot(this, TIMEZONE_ID));
  }
  getOffsetNanosecondsFor(absolute) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalAbsolute(absolute)) throw new TypeError('invalid Absolute object');
    const id = GetSlot(this, TIMEZONE_ID);

    const offsetNs = parseOffsetString(id);
    if (offsetNs !== null) return offsetNs;

    return ES.GetIANATimeZoneOffsetNanoseconds(GetSlot(absolute, EPOCHNANOSECONDS), id);
  }
  getOffsetStringFor(absolute) {
    const offsetNs = this.getOffsetNanosecondsFor(absolute);
    if (typeof offsetNs !== 'number') {
      throw new TypeError('bad return from getOffsetNanosecondsFor');
    }
    if (!Number.isInteger(offsetNs) || Math.abs(offsetNs) > 86400e9) {
      throw new RangeError('out-of-range return from getOffsetNanosecondsFor');
    }
    return ES.FormatTimeZoneOffsetString(offsetNs);
  }
  getDateTimeFor(absolute) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalAbsolute(absolute)) throw new TypeError('invalid Absolute object');
    const ns = GetSlot(absolute, EPOCHNANOSECONDS);
    const offsetNs = this.getOffsetNanosecondsFor(absolute);
    if (typeof offsetNs !== 'number') {
      throw new TypeError('bad return from getOffsetNanosecondsFor');
    }
    if (!Number.isInteger(offsetNs) || Math.abs(offsetNs) > 86400e9) {
      throw new RangeError('out-of-range return from getOffsetNanosecondsFor');
    }
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.GetPartsFromEpoch(ns);
    ({ year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.BalanceDateTime(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond + offsetNs
    ));
    const DateTime = GetIntrinsic('%Temporal.DateTime%');
    return new DateTime(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
  }
  getAbsoluteFor(dateTime, options) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDateTime(dateTime)) throw new TypeError('invalid DateTime object');
    const disambiguation = ES.ToTimeZoneTemporalDisambiguation(options);

    const Absolute = GetIntrinsic('%Temporal.Absolute%');
    const possibleAbsolutes = this.getPossibleAbsolutesFor(dateTime);
    const numAbsolutes = possibleAbsolutes.length;
    if (numAbsolutes === 1) {
      const absolute = possibleAbsolutes[0];
      if (!ES.IsTemporalAbsolute(absolute)) {
        throw new TypeError('bad return from getPossibleAbsolutesFor');
      }
      return absolute;
    }
    if (numAbsolutes) {
      switch (disambiguation) {
        case 'earlier': {
          const absolute = possibleAbsolutes[0];
          if (!ES.IsTemporalAbsolute(absolute)) {
            throw new TypeError('bad return from getPossibleAbsolutesFor');
          }
          return absolute;
        }
        case 'later': {
          const absolute = possibleAbsolutes[numAbsolutes - 1];
          if (!ES.IsTemporalAbsolute(absolute)) {
            throw new TypeError('bad return from getPossibleAbsolutesFor');
          }
          return absolute;
        }
        case 'reject': {
          throw new RangeError('multiple absolute found');
        }
      }
    }

    const utcns = ES.GetEpochFromParts(
      GetSlot(dateTime, ISO_YEAR),
      GetSlot(dateTime, ISO_MONTH),
      GetSlot(dateTime, ISO_DAY),
      GetSlot(dateTime, HOUR),
      GetSlot(dateTime, MINUTE),
      GetSlot(dateTime, SECOND),
      GetSlot(dateTime, MILLISECOND),
      GetSlot(dateTime, MICROSECOND),
      GetSlot(dateTime, NANOSECOND)
    );
    if (utcns === null) throw new RangeError('DateTime outside of supported range');
    const dayBefore = new Absolute(utcns.minus(86400e9));
    const dayAfter = new Absolute(utcns.plus(86400e9));
    const offsetBefore = this.getOffsetNanosecondsFor(dayBefore);
    const offsetAfter = this.getOffsetNanosecondsFor(dayAfter);
    const nanoseconds = offsetAfter - offsetBefore;
    const diff = ES.ToTemporalDurationRecord({ nanoseconds }, 'reject');
    switch (disambiguation) {
      case 'earlier': {
        const earlier = dateTime.minus(diff);
        return this.getPossibleAbsolutesFor(earlier)[0];
      }
      case 'later': {
        const later = dateTime.plus(diff);
        const possible = this.getPossibleAbsolutesFor(later);
        return possible[possible.length - 1];
      }
      case 'reject': {
        throw new RangeError('no such absolute found');
      }
    }
  }
  getPossibleAbsolutesFor(dateTime) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDateTime(dateTime)) throw new TypeError('invalid DateTime object');
    const Absolute = GetIntrinsic('%Temporal.Absolute%');
    const id = GetSlot(this, TIMEZONE_ID);

    const offsetNs = parseOffsetString(id);
    if (offsetNs !== null) {
      const epochNs = ES.GetEpochFromParts(
        GetSlot(dateTime, ISO_YEAR),
        GetSlot(dateTime, ISO_MONTH),
        GetSlot(dateTime, ISO_DAY),
        GetSlot(dateTime, HOUR),
        GetSlot(dateTime, MINUTE),
        GetSlot(dateTime, SECOND),
        GetSlot(dateTime, MILLISECOND),
        GetSlot(dateTime, MICROSECOND),
        GetSlot(dateTime, NANOSECOND)
      );
      return [new Absolute(epochNs.minus(offsetNs))];
    }

    const possibleEpochNs = ES.GetIANATimeZoneEpochValue(
      id,
      GetSlot(dateTime, ISO_YEAR),
      GetSlot(dateTime, ISO_MONTH),
      GetSlot(dateTime, ISO_DAY),
      GetSlot(dateTime, HOUR),
      GetSlot(dateTime, MINUTE),
      GetSlot(dateTime, SECOND),
      GetSlot(dateTime, MILLISECOND),
      GetSlot(dateTime, MICROSECOND),
      GetSlot(dateTime, NANOSECOND)
    );
    return possibleEpochNs.map((ns) => new Absolute(ns));
  }
  getTransitions(startingPoint) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalAbsolute(startingPoint)) throw new TypeError('invalid Absolute object');
    const id = GetSlot(this, TIMEZONE_ID);

    // Offset time zones have no transitions
    if (parseOffsetString(id) !== null) {
      const result = {
        next() {
          return { value: undefined, done: true };
        }
      };
      if (typeof Symbol === 'function') {
        result[Symbol.iterator] = () => result;
      }
      return result;
    }

    let epochNanoseconds = GetSlot(startingPoint, EPOCHNANOSECONDS);
    const Absolute = GetIntrinsic('%Temporal.Absolute%');
    const result = {
      next: () => {
        epochNanoseconds = ES.GetIANATimeZoneNextTransition(epochNanoseconds, id);
        const done = epochNanoseconds === null;
        const value = epochNanoseconds === null ? null : new Absolute(epochNanoseconds);
        return { done, value };
      }
    };
    if (typeof Symbol === 'function') {
      result[Symbol.iterator] = () => result;
    }
    return result;
  }
  toString() {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    return this.name;
  }
  static from(item) {
    let timeZone;
    if (ES.IsTemporalTimeZone(item)) {
      timeZone = GetSlot(item, TIMEZONE_ID);
    } else {
      timeZone = ES.TemporalTimeZoneFromString(ES.ToString(item));
    }
    const result = new this(timeZone);
    if (!ES.IsTemporalTimeZone(result)) throw new TypeError('invalid result');
    return result;
  }
}

TimeZone.prototype.toJSON = TimeZone.prototype.toString;

MakeIntrinsicClass(TimeZone, 'Temporal.TimeZone');
