import * as moment from 'moment';
import { Moment } from 'moment';

export class UASummary {
    id: string;

    attemptDate: Moment | null;

    constructor(ua?: Partial<UASummary> | null) {
        const { id = '', attemptDate = null } = ua || {};

        this.id = id;
        this.attemptDate = attemptDate ? moment.utc(attemptDate) : null;
    }
}
