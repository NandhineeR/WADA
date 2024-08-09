import { Country, ListItem, Region } from '@shared/models';
import * as moment from 'moment';
import { Moment } from 'moment';

export class AuthorizationInformation {
    adoReferenceNumber: string;

    city: string;

    competitionCategory: ListItem | null;

    competitionName: string;

    country: Country | null;

    descriptionOfTesting: string;

    endDate: Moment | null;

    feeForService: boolean;

    grantSCAWriteAccess: boolean;

    majorEvent: ListItem | null;

    notificationTo: Array<ListItem> | null;

    owner: ListItem | null;

    region: Region | null;

    resultManagementAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    startDate: Moment | null;

    testCoordinator: ListItem | null;

    testingAuthority: ListItem | null;

    testTiming: string | null;

    testType: boolean; // (OOC = false or IC = true)

    constructor(authorization?: Partial<AuthorizationInformation> | null) {
        const {
            adoReferenceNumber = '',
            city = '',
            competitionCategory = '',
            competitionName = '',
            country = null,
            descriptionOfTesting = '',
            endDate = null,
            feeForService = false,
            grantSCAWriteAccess = false,
            majorEvent = '',
            notificationTo = null,
            owner = null,
            region = null,
            resultManagementAuthority = null,
            sampleCollectionAuthority = null,
            startDate = null,
            testCoordinator = null,
            testingAuthority = null,
            testTiming = null,
            testType = false, // (OOC = false or IC = true)
        } = authorization || {};
        this.adoReferenceNumber = adoReferenceNumber;
        this.city = city;
        this.competitionCategory = competitionCategory ? new ListItem(competitionCategory) : null;
        this.competitionName = competitionName;
        this.country = country ? new Country(country) : null;
        this.descriptionOfTesting = descriptionOfTesting;
        this.endDate = endDate ? moment.utc(endDate) : null;
        this.feeForService = feeForService;
        this.grantSCAWriteAccess = grantSCAWriteAccess;
        this.majorEvent = majorEvent ? new ListItem(majorEvent) : null;
        this.notificationTo = notificationTo ? notificationTo.map((notTo) => new ListItem(notTo)) : null;
        this.owner = owner ? new ListItem(owner) : null;
        this.region = region ? new Region(region) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.startDate = startDate ? moment.utc(startDate) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.testTiming = testTiming;
        this.testType = testType;
    }
}
