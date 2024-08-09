import {
    Address,
    CountryWithRegions,
    GenericStatus,
    ListItem,
    ModificationInfo,
    SportDiscipline,
    TestParticipant,
} from '@shared/models';
import * as moment from 'moment';
import { Moment } from 'moment';
import { LocationEnum } from '../enums/location.enum';

export class UAForm {
    status: GenericStatus | null;

    athleteName: string;

    adamsId: string;

    dateOfBirth: Date | null;

    age: number | null;

    sportNationality: CountryWithRegions | null;

    sportDiscipline: SportDiscipline | null;

    testingOrderNumber: string;

    testingAuthority: ListItem | null;

    resultManagementAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    testCoordinator: ListItem | null;

    testType: boolean;

    whereaboutsLastCheckedDate: Moment | null;

    whereaboutsLastCheckedTime: string;

    timeSlot: string;

    address: Address | null;

    location: LocationEnum;

    specifyLocation: string;

    attemptDate: Moment | null;

    attemptTimeFrom: string;

    attemptTimeTo: string;

    attemptedContactMethods: Map<string, boolean> | null;

    descriptionOfAttempt: string;

    dopingControlOfficer: TestParticipant | null;

    dateOfReport: Moment | null;

    id: string;

    testId: string;

    toNumber: string;

    creationInfo: ModificationInfo | null;

    updateInfo: ModificationInfo | null;

    constructor(uaForm?: Partial<UAForm> | null) {
        const {
            status = null,
            athleteName = '',
            adamsId = '',
            dateOfBirth = null,
            age = null,
            sportNationality = null,
            sportDiscipline = null,
            testingOrderNumber = '',
            testingAuthority = null,
            resultManagementAuthority = null,
            sampleCollectionAuthority = null,
            testCoordinator = null,
            testType = false,
            whereaboutsLastCheckedDate = null,
            whereaboutsLastCheckedTime = '',
            timeSlot = '',
            address = null,
            location = LocationEnum.TrainingVenue,
            specifyLocation = '',
            attemptDate = null,
            attemptTimeFrom = '',
            attemptTimeTo = '',
            attemptedContactMethods = null,
            descriptionOfAttempt = '',
            dopingControlOfficer = null,
            dateOfReport = null,
            id = '',
            testId = '',
            toNumber = '',
            creationInfo = null,
            updateInfo = null,
        } = uaForm || {};

        this.athleteName = athleteName;
        this.adamsId = adamsId;
        this.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        this.age = age;
        this.sportNationality = sportNationality ? new CountryWithRegions(sportNationality) : null;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.testingOrderNumber = testingOrderNumber;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.testType = testType;
        this.whereaboutsLastCheckedDate = whereaboutsLastCheckedDate ? moment.utc(whereaboutsLastCheckedDate) : null;
        this.whereaboutsLastCheckedTime = whereaboutsLastCheckedTime;
        this.timeSlot = timeSlot;
        this.address = address ? new Address(address) : null;
        this.location = location;
        this.specifyLocation = specifyLocation;
        this.attemptDate = attemptDate ? moment.utc(attemptDate) : null;
        this.attemptTimeFrom = attemptTimeFrom;
        this.attemptTimeTo = attemptTimeTo;
        this.attemptedContactMethods = attemptedContactMethods;
        this.descriptionOfAttempt = descriptionOfAttempt;
        this.dopingControlOfficer = dopingControlOfficer ? new TestParticipant(dopingControlOfficer) : null;
        this.dateOfReport = dateOfReport ? moment.utc(dateOfReport) : null;
        this.id = id;
        this.testId = testId;
        this.status = status;
        this.toNumber = toNumber;
        this.creationInfo = creationInfo;
        this.updateInfo = updateInfo;
    }
}
