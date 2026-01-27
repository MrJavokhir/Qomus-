import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TASHKENT_TZ = 'Asia/Tashkent';

/**
 * Gets the current time in Tashkent timezone
 */
export const nowInTashkent = () => {
    return dayjs().tz(TASHKENT_TZ);
};

/**
 * Parses a date and time string in Tashkent timezone
 * @param date YYYY-MM-DD
 * @param time HH:mm
 */
export const parseTashkentTime = (date: string, time: string) => {
    return dayjs.tz(`${date} ${time}`, TASHKENT_TZ);
};

/**
 * Formats a UTC date to Tashkent time string
 */
export const formatToTashkent = (date: Date | string, format = 'YYYY-MM-DD HH:mm') => {
    return dayjs(date).tz(TASHKENT_TZ).format(format);
};

/**
 * Converts a JS Date (UTC) to a Tashkent ISO string
 */
export const toTashkentISO = (date: Date | string) => {
    return dayjs(date).tz(TASHKENT_TZ).format();
};

export { dayjs, TASHKENT_TZ };
