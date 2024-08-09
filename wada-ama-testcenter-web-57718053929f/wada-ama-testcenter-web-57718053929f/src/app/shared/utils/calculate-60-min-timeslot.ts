import * as moment from 'moment';
import { TimeSlot } from '@dcf/models';
import { isNullOrBlank } from './string-utils';

export function calculate60minTimeSlot(timeSlots: Array<TimeSlot>, time?: string): boolean {
    if (timeSlots?.length) {
        let result = false;
        timeSlots.forEach((timeSlot) => {
            if (isTimeWithinTimeSlot(time, timeSlot)) {
                result = true;
            }
        });
        return result;
    }
    return false;
}

function isTimeWithinTimeSlot(timeString: string | undefined, timeSlot: TimeSlot): boolean {
    if (!isNullOrBlank(timeString)) {
        const time = moment(timeString, 'HH:mm');
        const timeSlotStart = moment().set({
            hour: timeSlot.startHour,
            minute: timeSlot.startMinute,
            second: 0,
            millisecond: 0,
        });

        const timeSlotEnd = moment(timeSlotStart).add(60, 'minutes');

        return time.isBetween(timeSlotStart, timeSlotEnd, null, '[]');
    }
    return false;
}
