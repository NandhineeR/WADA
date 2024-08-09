import { isNullOrBlank } from '@shared/utils';
import { Timezone } from './timezone.model';

export class TimezoneField {
    dateTimeField: string | null;

    timezone: Timezone | null;

    static datetimeFields = {
        arrivalDate: 'Arrival date',
        endOfProcedureDate: 'End-of-procedure date',
        notificationDate: 'Notification date',
        urineSample: 'Urine sample',
        bloodSample: 'Blood sample',
        bpSample: 'Blood passport sample',
        dbsSample: 'Dried blood spot sample',
    };

    constructor(timezoneDefault?: Partial<TimezoneField> | null) {
        const { dateTimeField = null, timezone = null } = timezoneDefault || {};

        this.dateTimeField = dateTimeField;
        this.timezone = timezone || null;
    }

    getFullTimezoneField(): string {
        let fullTimezoneField = '';
        fullTimezoneField = !isNullOrBlank(this.dateTimeField)
            ? `${this.dateTimeField}: ${this.timezone?.gmtOffset}`
            : '';

        if (fullTimezoneField === ': ') {
            fullTimezoneField = '';
        }
        return fullTimezoneField;
    }
}
