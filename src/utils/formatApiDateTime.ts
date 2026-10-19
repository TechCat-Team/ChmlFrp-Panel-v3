const DEFAULT_LOCALE = 'zh-CN';
const LIFETIME_YEAR = 9999;

type DateLike = string | null | undefined;

interface DateTimeFormatOptions {
    locale?: string;
    timeZone?: string;
    fallback?: string;
    omitMidnight?: boolean;
}

interface RecentDateOptions extends DateTimeFormatOptions {
    now?: Date;
}

const getValidDate = (value: DateLike) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getDateParts = (date: Date, options: DateTimeFormatOptions = {}) => {
    const formatter = new Intl.DateTimeFormat(options.locale || DEFAULT_LOCALE, {
        timeZone: options.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const readPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';

    return {
        year: readPart('year'),
        month: readPart('month'),
        day: readPart('day'),
        hour: readPart('hour'),
        minute: readPart('minute'),
        second: readPart('second'),
    };
};

export const formatApiDateTime = (value: DateLike, options: DateTimeFormatOptions = {}) => {
    const date = getValidDate(value);
    if (!date) return options.fallback || '';

    const { year, month, day, hour, minute, second } = getDateParts(date, options);
    if (options.omitMidnight && hour === '00' && minute === '00' && second === '00') {
        return `${year}-${month}-${day}`;
    }
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const getLocalDateKey = (value: DateLike | Date, options: DateTimeFormatOptions = {}) => {
    const date = value instanceof Date ? value : getValidDate(value);
    if (!date) return '';

    const { year, month, day } = getDateParts(date, options);
    return `${year}-${month}-${day}`;
};

export const isTodayOrYesterdayLocal = (value: DateLike, options: RecentDateOptions = {}) => {
    const dateKey = getLocalDateKey(value, options);
    if (!dateKey) return false;

    const today = options.now || new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayKey = getLocalDateKey(today, options);
    const yesterdayKey = getLocalDateKey(yesterday, options);

    return dateKey === todayKey || dateKey === yesterdayKey;
};

export const isLifetimeTerm = (value: DateLike) => {
    const date = getValidDate(value);
    if (!date) return false;

    return date.getUTCFullYear() >= LIFETIME_YEAR;
};
