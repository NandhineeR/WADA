import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'duration',
})
export class DurationPipe implements PipeTransform {
    transform(start: Date, end: Date, unitOfTime: moment.unitOfTime.Diff = 'days'): number | null {
        const diff = moment(end).diff(moment(start), unitOfTime);
        return Number.isNaN(diff) || diff < 0 ? null : diff;
    }
}
