import { isNullOrBlank } from '@shared/utils/string-utils';
import * as moment from 'moment';
import { Moment } from 'moment';

export class AltitudeTraining {
    location: string;

    altitude: number | null;

    start: Moment | null;

    end: Moment | null;

    constructor(altitudeTraining?: Partial<AltitudeTraining> | null) {
        const { location = '', altitude = null, start = null, end = null } = altitudeTraining || {};

        this.location = location;
        this.altitude = altitude;
        this.start = start ? moment.utc(start) : null;
        this.end = end ? moment.utc(end) : null;
    }

    isNull(): boolean {
        return (
            isNullOrBlank(this.location) &&
            isNullOrBlank(this.altitude?.toString()) &&
            isNullOrBlank(this.start?.toString()) &&
            isNullOrBlank(this.end?.toString())
        );
    }
}
