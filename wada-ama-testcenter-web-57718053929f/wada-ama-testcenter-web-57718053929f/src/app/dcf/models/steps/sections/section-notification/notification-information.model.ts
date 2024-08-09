import { Country, ListItem, Participant, Region } from '@shared/models';
import { Moment } from 'moment';
import * as moment from 'moment';
import { propsUndefinedOrEmpty } from '@shared/utils/object-util';
import { Timezone } from '../../../dcf/timezone.model';

export class NotificationInformation {
    advanceNotice: boolean | null;

    advanceNoticeReason: string | null;

    notificationDate: Moment | null;

    timezone: Timezone | null;

    country: Country | null;

    region: Region | null;

    city: string | null;

    identificationDocument: ListItem | null;

    identificationDocumentType: string | null;

    selectionCriteria: ListItem | null;

    notifyingChaperone: Participant | null;

    constructor(notification?: Partial<NotificationInformation> | null) {
        const {
            advanceNotice = false,
            advanceNoticeReason = null,
            notificationDate = null,
            timezone = null,
            country = null,
            region = null,
            city = null,
            identificationDocument = null,
            identificationDocumentType = null,
            selectionCriteria = null,
            notifyingChaperone = null,
        } = notification || {};

        this.advanceNotice = advanceNotice;
        this.advanceNoticeReason = advanceNoticeReason;
        this.notificationDate = notificationDate ? moment(notificationDate) : null;
        this.timezone = timezone && !propsUndefinedOrEmpty(timezone) ? new Timezone(timezone) : null;
        this.country = country ? new Country(country) : null;
        this.region = region ? new Region(region) : null;
        this.city = city;
        this.identificationDocument = identificationDocument ? new ListItem(identificationDocument) : null;
        this.identificationDocumentType = identificationDocumentType;
        this.selectionCriteria = selectionCriteria ? new ListItem(selectionCriteria) : null;
        this.notifyingChaperone = notifyingChaperone ? new Participant(notifyingChaperone) : null;
    }
}
