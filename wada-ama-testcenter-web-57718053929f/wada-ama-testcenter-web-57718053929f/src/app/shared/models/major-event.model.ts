import * as moment from 'moment';
import { Moment } from 'moment';
import { ListItem } from './list-item.model';

export class MajorEvent {
    id: string;

    description: string;

    shortDescription: string;

    country: ListItem | null;

    region: ListItem | null;

    city: string;

    sampleCollectionAuthority: ListItem | null;

    resultManagementAuthority: ListItem | null;

    testAuthority: ListItem | null;

    laboratory: ListItem | null;

    startDate: Moment | null;

    endDate: Moment | null;

    constructor(majorEvent?: MajorEvent | null) {
        const {
            id = '',
            description = '',
            shortDescription = '',
            country = null,
            region = null,
            city = '',
            sampleCollectionAuthority = null,
            resultManagementAuthority = null,
            testAuthority = null,
            laboratory = null,
            startDate = null,
            endDate = null,
        } = majorEvent || {};

        this.id = id;
        this.description = description;
        this.shortDescription = shortDescription;
        this.country = country ? new ListItem(country) : null;
        this.region = region ? new ListItem(region) : null;
        this.city = city;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.testAuthority = testAuthority ? new ListItem(testAuthority) : null;
        this.laboratory = laboratory ? new ListItem(laboratory) : null;
        this.startDate = startDate ? moment.utc(startDate) : null;
        this.endDate = endDate ? moment.utc(endDate) : null;
    }
}
