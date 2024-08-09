import * as moment from 'moment';
import { formatTime, timeFormatRegex } from './time-format-utils';

export const secondToMillisecond = (s: number) => s * 1000;
export const minuteToMillisecond = (m: number) => secondToMillisecond(m) * 60;
export const hourToMillisecond = (h: number) => minuteToMillisecond(h) * 60;

export function stringToHourMinute(time: string): [number | undefined, number | undefined] {
    if (!time || time.length === 0) {
        return [undefined, undefined];
    }
    const formattedTime = formatTime(time);
    return [Number(formattedTime.slice(0, 2)), Number(formattedTime.slice(3, 5))];
}

export function hourMinuteToString(hour?: number | null, minute?: number | null): string {
    if ((hour === null || hour === undefined) && (minute === null || minute === undefined)) {
        return '';
    }
    return moment()
        .minute(minute || 0)
        .hour(hour || 0)
        .format('HH:mm');
}

export function isTimeFormatValid(time: string): boolean {
    return Boolean(timeFormatRegex.test(time));
}
