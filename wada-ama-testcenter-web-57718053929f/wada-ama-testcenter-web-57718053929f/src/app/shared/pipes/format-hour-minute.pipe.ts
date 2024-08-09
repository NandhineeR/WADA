import { Pipe, PipeTransform } from '@angular/core';
import { hourMinuteToString } from '@shared/utils/time-util';

@Pipe({
    name: 'formatHourMinute',
})
export class FormatHourMinutePipe implements PipeTransform {
    transform(hour?: number | null, minute?: number | null): string {
        return hourMinuteToString(hour, minute);
    }
}
