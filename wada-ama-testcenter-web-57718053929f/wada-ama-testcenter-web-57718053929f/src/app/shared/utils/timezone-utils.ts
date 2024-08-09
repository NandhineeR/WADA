import * as moment from 'moment';
import { Moment } from 'moment';

export function adjustTimezoneToLocal(date: Moment | null | undefined): Moment | null {
    if (!date) return null;

    return moment(date).utc(true);
}
