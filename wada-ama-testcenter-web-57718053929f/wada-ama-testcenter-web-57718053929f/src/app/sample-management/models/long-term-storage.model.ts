import { Moment } from 'moment';
import * as moment from 'moment';

export class LongTermStorage {
    confirmed: boolean | null;

    reason: string;

    requestDate: Moment | null;

    requestInitiator: string;

    storageLocation: string;

    storedUntil: Moment | null;

    constructor(lts?: Partial<LongTermStorage> | null) {
        const {
            confirmed = null,
            reason = '',
            requestDate = null,
            requestInitiator = '',
            storageLocation = '',
            storedUntil = null,
        } = lts || {};

        this.confirmed = confirmed;
        this.reason = reason;
        this.requestDate = requestDate ? moment.utc(requestDate) : null;
        this.requestInitiator = requestInitiator;
        this.storageLocation = storageLocation;
        this.storedUntil = storedUntil ? moment.utc(storedUntil) : null;
    }
}
