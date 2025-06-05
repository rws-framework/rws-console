import dateFns from 'date-fns';
import * as dateFnsTz from 'date-fns-tz';

type DateUtilsTimeUnits = 'seconds' | 'minutes' | 'hours' | 'days' | 'milliseconds';

export class DateUtils {
  private _date: Date;
  static DEFAULT_TIMEZONE = process.env.TZ || 'Europe/Warsaw';
  private _tz: string = DateUtils.DEFAULT_TIMEZONE;

  constructor(input?: string | number | Date, tz?: string) {
    if (input === undefined) {
      this._date = new Date();
    } else if (typeof input === 'number') {
      // If timestamp is in seconds, convert to milliseconds
      const timestamp = input < 10000000000 ? input * 1000 : input;
      this._date = new Date(timestamp);
    } else if (typeof input === 'string') {
      // Try parsing ISO string or timestamp
      try {
        this._date = dateFns.parseISO(input);
      } catch {
        const timestamp = parseInt(input, 10);
        this._date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      }
    } else if (input instanceof Date) {
      this._date = input;
    } else {
      throw new Error('Invalid date input');
    }

    if(tz){
      this._tz = tz;
    }
  }

  get date(): Date {
    return this._date;
  }

  get tz(): string {
    return this._tz;
  }

  formatDate(formatString = 'yyyy-MM-dd HH:mm:ss'): string {
    return dateFns.format(this._date, formatString);
  }

  format(formatString = 'yyyy-MM-dd HH:mm:ss'): string {
    return this.formatDate(formatString);
  }

  formatToTimezone(timezone = this._tz): string {
    return dateFns.format(dateFnsTz.toZonedTime(this._date, timezone), 'yyyy-MM-dd HH:mm:ssXXX');
  }

  formatToISO(): string
  {
    return this._date.toISOString();
  }

  timestamp(): number
  {
    return this._date.valueOf();
  }

  addDays(days: number): DateUtils {
    this._date = dateFns.addDays(this._date, days);

    return this;
  }

  subtractDays(days: number): DateUtils {
    this._date = dateFns.subDays(this._date, days);
    return this;
  }

  addHours(hours: number): DateUtils {
    this._date = dateFns.addHours(this._date, hours);

    return this;
  }

  subtractHours(hours: number): DateUtils {
    this._date = dateFns.subHours(this._date, hours);
    return this;
  }

  addMinutes(minutes: number): DateUtils {
    this._date = dateFns.addMinutes(this._date, minutes);

    return this;
  }

  subtractMinutes(minutes: number): DateUtils {
    this._date = dateFns.subMinutes(this._date, minutes)
    return this;
  }

  isAfter(date: Date | string | DateUtils): boolean {
    const compareDate = date instanceof DateUtils ? date.date : 
      typeof date === 'string' ? dateFns.parseISO(date) : date;
    return dateFns.isAfter(this._date, compareDate);
  }

  isBefore(date: Date | string | DateUtils): boolean {
    const compareDate = date instanceof DateUtils ? date.date : 
      typeof date === 'string' ? dateFns.parseISO(date) : date;
    return dateFns.isBefore(this._date, compareDate);
  }

  isEqual(date: Date | string | DateUtils): boolean {
    const compareDate = date instanceof DateUtils ? date.date : 
      typeof date === 'string' ? dateFns.parseISO(date) : date;
    return dateFns.isEqual(this._date, compareDate);
  }

  getYear(): number
  {
    return this._date.getFullYear();
  }

  getMonth(): number
  {
    return this._date.getMonth();
  }

  getDay(): number
  {
    return this._date.getDay();
  }

  getHours(): number
  {
    return this._date.getHours();
  }

  getMinutes(): number
  {
    return this._date.getMinutes();
  }

  getSeconds(): number
  {
    return this._date.getSeconds();
  }

  set(value: number, element: 'days' | 'months' | 'hours' | 'minutes' | 'seconds' | 'miliseconds')
  {
    if(element === 'days'){
      this._date.setDate(value);
    } else if(element === 'months'){
      this._date.setMonth(value);
    } else if(element === 'hours'){
      this._date.setHours(value);
    } else if(element === 'minutes'){
      this._date.setMinutes(value);
    } else if(element === 'seconds'){
      this._date.setSeconds(value);
    } else if(element === 'miliseconds'){
      this._date.setMilliseconds(value);
    }    
    return this;
  }

  static diff(date1: DateUtils, date2: DateUtils, unit: DateUtilsTimeUnits = 'minutes'): number {
    const diffInMilliseconds = Math.abs(date1.date.getTime() - date2.date.getTime());
    
    return this.formatMsTo(diffInMilliseconds, unit);
  }

  static formatMsTo(ms: number, toFormat: DateUtilsTimeUnits = 'minutes'): number
  {
    switch (toFormat) {
      case 'seconds':
        return Math.floor(ms / 1000);
      case 'minutes':
        return Math.floor(ms / (1000 * 60));
      case 'hours':
        return Math.floor(ms / (1000 * 60 * 60));
      case 'days':
        return Math.floor(ms / (1000 * 60 * 60 * 24));      
      default:
        return ms;
    }
  }

  static timeZoneDiff(timezone = this.DEFAULT_TIMEZONE): number {    
    const zonedDate = dateFnsTz.toZonedTime(new Date(), timezone);
    const offsetInMinutes = zonedDate.getTimezoneOffset();
    return -offsetInMinutes / 60;
  }

  static now(timezone = this.DEFAULT_TIMEZONE): DateUtils {
    return new DateUtils(dateFnsTz.toZonedTime(new Date(), timezone));
  }

  static parseDate(dateString: string, timezone = this.DEFAULT_TIMEZONE): DateUtils {
    return new DateUtils(dateFnsTz.fromZonedTime(dateString, timezone));
  }
}
