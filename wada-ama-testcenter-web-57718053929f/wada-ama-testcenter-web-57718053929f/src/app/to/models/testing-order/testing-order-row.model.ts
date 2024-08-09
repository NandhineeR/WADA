import * as moment from 'moment';
import { Moment } from 'moment';

export class TestingOrderRow {
    id: string;

    testingOrderNumber: string;

    adoReferenceNumber: string;

    testingAuthority: string;

    description: string;

    testingOrderStatus: string;

    issuedDate: Moment | null;

    startDate: Moment | null;

    city: string;

    constructor(to?: Partial<TestingOrderRow> | null) {
        const {
            id = '',
            testingOrderNumber = '',
            adoReferenceNumber = '',
            testingAuthority = '',
            description = '',
            testingOrderStatus = '',
            issuedDate = '',
            startDate = '',
            city = '',
        } = to || {};

        this.id = id;
        this.testingOrderNumber = testingOrderNumber;
        this.adoReferenceNumber = adoReferenceNumber;
        this.testingAuthority = testingAuthority;
        this.description = description;
        this.testingOrderStatus = testingOrderStatus;
        this.issuedDate = issuedDate ? moment.utc(issuedDate) : null;
        this.startDate = startDate ? moment.utc(startDate) : null;
        this.city = city;
    }
}
