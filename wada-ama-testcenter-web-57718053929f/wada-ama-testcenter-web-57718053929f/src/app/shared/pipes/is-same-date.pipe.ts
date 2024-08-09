import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';

@Pipe({
    name: 'isSameDate',
})
export class IsSameDatePipe implements PipeTransform {
    transform(date: Moment, dateSelected: Moment, month: boolean): boolean {
        return date.isSame(dateSelected, month ? 'month' : 'date');
    }
}
