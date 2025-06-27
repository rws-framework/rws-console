"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
const date_fns_1 = __importDefault(require("date-fns"));
const dateFnsTz = __importStar(require("date-fns-tz"));
class DateUtils {
    _date;
    static DEFAULT_TIMEZONE = process.env.TZ || 'Europe/Warsaw';
    _tz = DateUtils.DEFAULT_TIMEZONE;
    static create(input, tz) {
        return new DateUtils(input, tz);
    }
    constructor(input, tz) {
        if (input === undefined) {
            this._date = new Date();
        }
        else if (typeof input === 'number') {
            // If timestamp is in seconds, convert to milliseconds
            const timestamp = input < 10000000000 ? input * 1000 : input;
            this._date = new Date(timestamp);
        }
        else if (typeof input === 'string') {
            // Try parsing ISO string or timestamp
            try {
                this._date = date_fns_1.default.parseISO(input);
            }
            catch {
                const timestamp = parseInt(input, 10);
                this._date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
            }
        }
        else if (input instanceof Date) {
            this._date = input;
        }
        else {
            throw new Error('Invalid date input');
        }
        if (tz) {
            this._tz = tz;
        }
    }
    get date() {
        return this._date;
    }
    get tz() {
        return this._tz;
    }
    formatDate(formatString = 'yyyy-MM-dd HH:mm:ss') {
        return date_fns_1.default.format(this._date, formatString);
    }
    format(formatString = 'yyyy-MM-dd HH:mm:ss') {
        return this.formatDate(formatString);
    }
    formatToTimezone(timezone = this._tz) {
        return date_fns_1.default.format(dateFnsTz.toZonedTime(this._date, timezone), 'yyyy-MM-dd HH:mm:ssXXX');
    }
    formatToISO() {
        return this._date.toISOString();
    }
    timestamp() {
        return this._date.valueOf();
    }
    addDays(days) {
        this._date = date_fns_1.default.addDays(this._date, days);
        return this;
    }
    subtractDays(days) {
        this._date = date_fns_1.default.subDays(this._date, days);
        return this;
    }
    addHours(hours) {
        this._date = date_fns_1.default.addHours(this._date, hours);
        return this;
    }
    subtractHours(hours) {
        this._date = date_fns_1.default.subHours(this._date, hours);
        return this;
    }
    addMinutes(minutes) {
        this._date = date_fns_1.default.addMinutes(this._date, minutes);
        return this;
    }
    subtractMinutes(minutes) {
        this._date = date_fns_1.default.subMinutes(this._date, minutes);
        return this;
    }
    isAfter(date) {
        const compareDate = date instanceof DateUtils ? date.date :
            typeof date === 'string' ? date_fns_1.default.parseISO(date) : date;
        return date_fns_1.default.isAfter(this._date, compareDate);
    }
    isBefore(date) {
        const compareDate = date instanceof DateUtils ? date.date :
            typeof date === 'string' ? date_fns_1.default.parseISO(date) : date;
        return date_fns_1.default.isBefore(this._date, compareDate);
    }
    isEqual(date) {
        const compareDate = date instanceof DateUtils ? date.date :
            typeof date === 'string' ? date_fns_1.default.parseISO(date) : date;
        return date_fns_1.default.isEqual(this._date, compareDate);
    }
    getYear() {
        return this._date.getFullYear();
    }
    getMonth() {
        return this._date.getMonth();
    }
    getDay() {
        return this._date.getDay();
    }
    getHours() {
        return this._date.getHours();
    }
    getMinutes() {
        return this._date.getMinutes();
    }
    getSeconds() {
        return this._date.getSeconds();
    }
    set(value, element) {
        if (element === 'days') {
            this._date.setDate(value);
        }
        else if (element === 'months') {
            this._date.setMonth(value);
        }
        else if (element === 'hours') {
            this._date.setHours(value);
        }
        else if (element === 'minutes') {
            this._date.setMinutes(value);
        }
        else if (element === 'seconds') {
            this._date.setSeconds(value);
        }
        else if (element === 'miliseconds') {
            this._date.setMilliseconds(value);
        }
        return this;
    }
    static diff(date1, date2, unit = 'minutes') {
        const diffInMilliseconds = Math.abs(date1.date.getTime() - date2.date.getTime());
        return this.formatMsTo(diffInMilliseconds, unit);
    }
    static formatMsTo(ms, toFormat = 'minutes') {
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
    static timeZoneDiff(timezone = this.DEFAULT_TIMEZONE) {
        const zonedDate = dateFnsTz.toZonedTime(new Date(), timezone);
        const offsetInMinutes = zonedDate.getTimezoneOffset();
        return -offsetInMinutes / 60;
    }
    static now(timezone = this.DEFAULT_TIMEZONE) {
        return new DateUtils(dateFnsTz.toZonedTime(new Date(), timezone));
    }
    static parseDate(dateString, timezone = this.DEFAULT_TIMEZONE) {
        return new DateUtils(dateFnsTz.fromZonedTime(dateString, timezone));
    }
}
exports.DateUtils = DateUtils;
//# sourceMappingURL=DateUtils.js.map