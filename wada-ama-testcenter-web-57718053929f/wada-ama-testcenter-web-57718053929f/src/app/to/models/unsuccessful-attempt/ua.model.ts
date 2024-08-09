import {
    Address,
    CountryWithRegions,
    GenericStatus,
    ListItem,
    LocalizedEntity,
    ModificationInfo,
    TestParticipant,
} from '@shared/models';
import { Moment } from 'moment';
import * as moment from 'moment';
import { LocationEnum } from '../enums/location.enum';
import { UATest } from './ua-test.model';

export class UA {
    status: GenericStatus | null;

    test: UATest | null;

    resultManagementAuthority: ListItem | null;

    whereaboutsLastCheckedDate: Moment | null;

    whereaboutsLastCheckedHour: number | null;

    whereaboutsLastCheckedMinute: number | null;

    timeSlotHour: number | null;

    timeSlotMinute: number | null;

    address: Address | null;

    attemptMethods: Array<LocalizedEntity>;

    attemptDate: Moment | null;

    attemptTimeFromHour: number | null;

    attemptTimeFromMinute: number | null;

    attemptTimeToHour: number | null;

    attemptTimeToMinute: number | null;

    descriptionOfAttempt: string;

    dopingControlOfficer: TestParticipant | null;

    dateOfReport: Moment | null;

    id: string;

    location: LocationEnum;

    locationDescription: string;

    creationInfo: ModificationInfo | null;

    updateInfo: ModificationInfo | null;

    firstName: string;

    lastName: string;

    adamsId: string;

    dateOfBirth: Date | null;

    sportNationality: CountryWithRegions | null;

    constructor(ua?: Partial<UA> | null) {
        const {
            attemptMethods = [],
            resultManagementAuthority = null,
            whereaboutsLastCheckedDate = null,
            whereaboutsLastCheckedHour = null,
            whereaboutsLastCheckedMinute = null,
            timeSlotHour = null,
            timeSlotMinute = null,
            address = null,
            attemptDate = null,
            attemptTimeFromHour = null,
            attemptTimeFromMinute = null,
            attemptTimeToHour = null,
            attemptTimeToMinute = null,
            descriptionOfAttempt = '',
            dopingControlOfficer = null,
            dateOfReport = null,
            id = '',
            status = null,
            test = null,
            locationDescription = '',
            location = LocationEnum.TrainingVenue,
            creationInfo = null,
            updateInfo = null,
            firstName = '',
            lastName = '',
            adamsId = '',
            dateOfBirth = null,
            sportNationality = null,
        } = ua || {};

        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.whereaboutsLastCheckedDate = whereaboutsLastCheckedDate ? moment.utc(whereaboutsLastCheckedDate) : null;
        this.whereaboutsLastCheckedHour = whereaboutsLastCheckedHour;
        this.whereaboutsLastCheckedMinute = whereaboutsLastCheckedMinute;
        this.timeSlotHour = timeSlotHour;
        this.timeSlotMinute = timeSlotMinute;
        this.address = address ? new Address(address) : null;
        this.attemptDate = attemptDate ? moment.utc(attemptDate) : null;
        this.attemptTimeFromHour = attemptTimeFromHour;
        this.attemptTimeFromMinute = attemptTimeFromMinute;
        this.attemptTimeToHour = attemptTimeToHour;
        this.attemptTimeToMinute = attemptTimeToMinute;
        this.descriptionOfAttempt = descriptionOfAttempt;
        this.dopingControlOfficer = dopingControlOfficer ? new TestParticipant(dopingControlOfficer) : null;
        this.dateOfReport = dateOfReport ? moment.utc(dateOfReport) : null;
        this.attemptMethods = attemptMethods.map((attempt: LocalizedEntity) => new LocalizedEntity(attempt));
        this.id = id;
        this.test = test ? new UATest(test) : null;
        this.status = status ? new GenericStatus(status) : null;
        this.locationDescription = locationDescription;
        this.location = location;
        this.creationInfo = creationInfo;
        this.updateInfo = updateInfo;
        this.firstName = firstName;
        this.lastName = lastName;
        this.adamsId = adamsId;
        this.dateOfBirth = dateOfBirth;
        this.sportNationality = sportNationality ? new CountryWithRegions(sportNationality) : null;
    }
}
