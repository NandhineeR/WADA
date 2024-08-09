import { Pipe, PipeTransform } from '@angular/core';
import { calculateAge } from '@to/utils/step.utils';
import * as moment from 'moment';

type Moment = moment.Moment;

@Pipe({
    name: 'calculateAge',
})
export class CalculateAgePipe implements PipeTransform {
    transform(dateOfBirth: Moment): string {
        return calculateAge(dateOfBirth);
    }
}
