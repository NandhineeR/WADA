import { Pipe, PipeTransform } from '@angular/core';
import { formatDisplayDateWithTime } from '@shared/utils';
import { Moment } from 'moment';

@Pipe({
    name: 'formatDatetime',
})
export class FormatDatetimePipe implements PipeTransform {
    transform(date: Moment | null): string {
        return formatDisplayDateWithTime(date);
    }
}
