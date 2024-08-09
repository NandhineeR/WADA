import { propsUndefined } from '@shared/utils/object-util';
import { ListItem } from './list-item.model';
import { Participant } from './participant.model';
import { SportDiscipline } from './sport-discipline.model';
import { Country } from './country.model';
import { Region } from './region.model';
import { StatusEnum } from './enums/status.enum';
import { Status } from './status.model';
import { Athlete } from './athlete.model';
import { Test } from './test.model';

export class TOItem {
    id: string;

    placeholder: string | null;

    testingOrderNumber: string;

    testingAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    resultManagementAuthority: ListItem | null;

    testCoordinator: ListItem | null;

    leadDopingControlOfficer: Participant | null;

    adoReferenceNumber: string;

    sportDiscipline: SportDiscipline | null;

    country: Country | null;

    region: Region | null;

    city: string;

    athleteLevel: string;

    testType: boolean | null;

    status: StatusEnum | null;

    serviceFee: boolean | null;

    testingOrderStatus: Status | null;

    athlete: Athlete | null;

    test: Test | null;

    issuedDate: Date | null;

    startDate: Date | null;

    description: string;

    constructor(to?: Partial<TOItem> | null) {
        const {
            id = '',
            placeholder = '',
            testingOrderNumber = '',
            testingAuthority = null,
            sampleCollectionAuthority = null,
            resultManagementAuthority = null,
            testCoordinator = null,
            leadDopingControlOfficer = null,
            adoReferenceNumber = '',
            sportDiscipline = null,
            country = null,
            region = null,
            city = '',
            athleteLevel = '',
            testType = null,
            status = null,
            serviceFee = null,
            testingOrderStatus = null,
            athlete = null,
            test = null,
            issuedDate = null,
            startDate = null,
            description = '',
        } = to || {};

        this.id = id;
        this.placeholder = placeholder;
        this.testingOrderNumber = testingOrderNumber;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.leadDopingControlOfficer = leadDopingControlOfficer ? new Participant(leadDopingControlOfficer) : null;
        this.adoReferenceNumber = adoReferenceNumber;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.country = propsUndefined(country) ? null : country;
        this.region = propsUndefined(region) ? null : region;
        this.city = city;
        this.athleteLevel = athleteLevel;
        this.testType = testType;
        this.status = status;
        this.serviceFee = serviceFee;
        this.athlete = athlete ? new Athlete(athlete) : null;
        this.test = test ? new Test(test) : null;
        this.testingOrderStatus = testingOrderStatus ? new Status(testingOrderStatus) : null;
        this.issuedDate = issuedDate;
        this.startDate = startDate;
        this.description = description;
    }

    static fromTONumber(toNumber?: string): TOItem {
        const to = new TOItem();
        to.testingOrderNumber = toNumber || '';
        return to;
    }
}
