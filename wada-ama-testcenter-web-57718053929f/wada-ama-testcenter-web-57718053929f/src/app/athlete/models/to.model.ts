import { Status } from '@shared/models/status.model';
import { Country, ListItem, Region } from '@shared/models';
import { Test } from './test.model';

export class TO {
    tests: Array<Test>;

    id: string;

    testingOrderNumber: string;

    testingAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    resultManagementAuthority: ListItem | null;

    testCoordinator: ListItem | null;

    adoReferenceNumber: string;

    country: Country | null;

    region: Region | null;

    city: string;

    testType: boolean | null;

    serviceFee: boolean | null;

    testingOrderStatus: Status | null;

    constructor(to?: Partial<TO> | null) {
        const {
            tests = [],
            id = '',
            testingOrderNumber = '',
            testingAuthority = null,
            sampleCollectionAuthority = null,
            resultManagementAuthority = null,
            testCoordinator = null,
            adoReferenceNumber = '',
            country = null,
            region = null,
            city = '',
            testType = null,
            serviceFee = null,
            testingOrderStatus = null,
        } = to || {};

        this.tests = (tests || []).map((test) => new Test(test));
        this.id = id;
        this.testingOrderNumber = testingOrderNumber;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.adoReferenceNumber = adoReferenceNumber;
        this.country = country ? new Country(country) : null;
        this.region = region ? new Region(region) : null;
        this.city = city;
        this.testType = testType;
        this.serviceFee = serviceFee;
        this.testingOrderStatus = testingOrderStatus;
    }
}
