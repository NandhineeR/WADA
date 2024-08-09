import { Moment } from 'moment';
import * as moment from 'moment';

export class QuickTurnAround {
    comments: string;

    requestDate: Moment | null;

    requestInitiator: string;

    constructor(qta?: Partial<QuickTurnAround> | null) {
        const { comments = '', requestDate = null, requestInitiator = '' } = qta || {};

        this.comments = comments;
        this.requestDate = requestDate ? moment.utc(requestDate) : null;
        this.requestInitiator = requestInitiator;
    }
}
