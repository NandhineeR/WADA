import { UA, UAForm, UATest } from '@to/models';
import { Athlete, ListItem, LocalizedEntity, ModificationInfo, TestParticipant } from '@shared/models';
import { hourMinuteToString, stringToHourMinute } from '@shared/utils/time-util';
import { adjustTimezoneToLocal } from '@shared/utils';

export function mapUnsuccessfulAttempt(tests: Array<UATest>): Array<UA> {
    return tests.map((test) => {
        const athlete = test.athlete || new Athlete();
        const ua = new UA({ test: new UATest({ id: test.id, athlete }) });
        ua.firstName = athlete.firstName;
        ua.lastName = athlete.lastName;
        ua.dateOfBirth = athlete.dateOfBirth;
        ua.adamsId = athlete.adamsId;
        ua.sportNationality = athlete.sportNationality;
        if (ua.test) {
            ua.test.toId = test.toId;
            ua.test.toNumber = test.toNumber;
            ua.test.sportDiscipline = test.sportDiscipline;
            ua.test.testingAuthority = test.testingAuthority;
            ua.test.sampleCollectionAuthority = test.sampleCollectionAuthority;
            ua.test.resultManagementAuthority = test.resultManagementAuthority;
            ua.test.testCoordinator = test.testCoordinator;
            ua.test.inCompetition = test.inCompetition;
        }
        ua.resultManagementAuthority = test.resultManagementAuthority;

        return ua;
    });
}

export function mapUAFromUAForm(form: UAForm, attemptMethods: Array<LocalizedEntity>, currentUA: UA | null): UA {
    const ua = createUA(form);
    if (attemptMethods.length > 0 && form.attemptedContactMethods) {
        attemptMethods.forEach((attemptMethod: LocalizedEntity) => {
            // only add attempt to UA if it was checked in the form
            if (form.attemptedContactMethods?.get(attemptMethod.specificCode)) {
                ua.attemptMethods.push(attemptMethod);
            }
        });
    }

    updateUAFromCurrentUA(ua, currentUA);
    return ua;
}

export function mapUAFromInputForm(form: UAForm, attemptMethods: Array<LocalizedEntity>, currentUA: UA | null): UA {
    const ua = createUA(form);
    if (attemptMethods.length > 0 && form.attemptedContactMethods) {
        attemptMethods.forEach((attemptMethod: LocalizedEntity) => {
            // only add attempt to UA if it was checked in the form
            Object.entries(form.attemptedContactMethods || []).forEach(([key, value]) => {
                if (value && key === attemptMethod.specificCode) {
                    ua.attemptMethods.push(attemptMethod);
                }
            });
        });
    }

    updateUAFromCurrentUA(ua, currentUA);
    return ua;
}

function createUA(form: UAForm) {
    const [attemptTimeFromHour, attemptTimeFromMinute] = stringToHourMinute(form.attemptTimeFrom);
    const [attemptTimeToHour, attemptTimeToMinute] = stringToHourMinute(form.attemptTimeTo);
    const [timeSlotHour, timeSlotMinute] = stringToHourMinute(form.timeSlot);
    const [whereaboutsLastCheckedHour, whereaboutsLastCheckedMinute] = stringToHourMinute(
        form.whereaboutsLastCheckedTime
    );

    const ua = new UA();
    ua.descriptionOfAttempt = form.descriptionOfAttempt;
    ua.locationDescription = form.specifyLocation;
    ua.location = form.location;
    ua.attemptDate = adjustTimezoneToLocal(form.attemptDate);
    ua.attemptTimeFromHour = getNumeric(attemptTimeFromHour);
    ua.attemptTimeFromMinute = getNumeric(attemptTimeFromMinute);
    ua.attemptTimeToHour = getNumeric(attemptTimeToHour);
    ua.attemptTimeToMinute = getNumeric(attemptTimeToMinute);
    ua.dateOfReport = adjustTimezoneToLocal(form.dateOfReport);
    ua.id = form.id;
    ua.timeSlotHour = getNumeric(timeSlotHour);
    ua.timeSlotMinute = getNumeric(timeSlotMinute);
    ua.whereaboutsLastCheckedDate = adjustTimezoneToLocal(form.whereaboutsLastCheckedDate);
    ua.whereaboutsLastCheckedHour = getNumeric(whereaboutsLastCheckedHour);
    ua.whereaboutsLastCheckedMinute = getNumeric(whereaboutsLastCheckedMinute);
    ua.resultManagementAuthority = form.resultManagementAuthority ? new ListItem(form.resultManagementAuthority) : null;
    ua.dopingControlOfficer = form.dopingControlOfficer ? new TestParticipant(form.dopingControlOfficer) : null;
    ua.address = form.address;
    ua.test = new UATest();
    ua.status = form.status;
    return ua;
}

function updateUAFromCurrentUA(uaToUpdate: UA, currentUA: UA | null) {
    if (uaToUpdate && currentUA) {
        uaToUpdate.firstName = currentUA.firstName;
        uaToUpdate.lastName = currentUA.lastName;
        uaToUpdate.dateOfBirth = currentUA.dateOfBirth;
        uaToUpdate.adamsId = currentUA.adamsId;
        uaToUpdate.sportNationality = currentUA.sportNationality;
        uaToUpdate.updateInfo = new ModificationInfo(currentUA.updateInfo);
        uaToUpdate.creationInfo = new ModificationInfo(currentUA.creationInfo);

        if (uaToUpdate.test && currentUA.test) {
            uaToUpdate.test.id = currentUA.test.id;
            uaToUpdate.test.toNumber = currentUA.test.toNumber;
            uaToUpdate.test.sampleCollectionAuthority = currentUA.test.sampleCollectionAuthority;
            uaToUpdate.test.toId = currentUA.test.toId;
            uaToUpdate.test.toNumber = currentUA.test.toNumber;
            uaToUpdate.test.sportDiscipline = currentUA.test.sportDiscipline;
            uaToUpdate.test.testingAuthority = currentUA.test.testingAuthority;
            uaToUpdate.test.sampleCollectionAuthority = currentUA.test.sampleCollectionAuthority;
            uaToUpdate.test.resultManagementAuthority = currentUA.test.resultManagementAuthority;
            uaToUpdate.test.testCoordinator = currentUA.test.testCoordinator;
            uaToUpdate.test.inCompetition = currentUA.test.inCompetition;
        }
    }
}

export function mapUAFormFromUA(ua: UA): UAForm {
    let name = '';
    if (ua) {
        if (ua.firstName && ua.lastName) name = `${ua.firstName}, ${ua.lastName}`;
        else name = ua.firstName || ua.lastName;
    }

    const form: UAForm = new UAForm();
    if (ua.attemptMethods) {
        const attempMap = new Map<string, boolean>();
        ua.attemptMethods.forEach((attemp: LocalizedEntity) => {
            attempMap.set(attemp.specificCode, true);
        });
        form.attemptedContactMethods = attempMap;
    }
    form.athleteName = name;
    form.descriptionOfAttempt = ua.descriptionOfAttempt;
    form.attemptDate = adjustTimezoneToLocal(ua.attemptDate);
    form.testId = ua.test?.id || '';
    form.timeSlot = hourMinuteToString(ua.timeSlotHour, ua.timeSlotMinute);
    form.resultManagementAuthority = ua.resultManagementAuthority;
    if (ua.test) {
        form.testingOrderNumber = ua.test.toNumber;
        form.sampleCollectionAuthority = ua.test.sampleCollectionAuthority;
        form.testingAuthority = ua.test.testingAuthority;
        form.testCoordinator = ua.test.testCoordinator;
    }
    form.adamsId = ua.adamsId;
    form.dateOfBirth = ua.dateOfBirth;
    form.attemptedContactMethods = new Map<string, boolean>();
    if (ua.attemptMethods.length > 0) {
        ua.attemptMethods.forEach((attempt: LocalizedEntity) => {
            if (form.attemptedContactMethods) {
                form.attemptedContactMethods.set(attempt.specificCode, true);
            }
        });
    }

    form.whereaboutsLastCheckedTime = hourMinuteToString(
        ua.whereaboutsLastCheckedHour,
        ua.whereaboutsLastCheckedMinute
    );
    form.attemptTimeTo = hourMinuteToString(ua.attemptTimeToHour, ua.attemptTimeToMinute);
    form.attemptTimeFrom = hourMinuteToString(ua.attemptTimeFromHour, ua.attemptTimeFromMinute);
    form.dopingControlOfficer = ua.dopingControlOfficer;
    form.whereaboutsLastCheckedDate = adjustTimezoneToLocal(ua.whereaboutsLastCheckedDate);
    form.dateOfReport = adjustTimezoneToLocal(ua.dateOfReport);
    form.location = ua.location;
    form.specifyLocation = ua.locationDescription;
    form.address = ua.address;
    form.id = ua.id;
    form.status = ua.status;
    form.sportNationality = ua.sportNationality;
    form.toNumber = ua.test?.toNumber || '';
    form.sportDiscipline = ua.test?.sportDiscipline || null;
    form.creationInfo = ua.creationInfo;
    form.updateInfo = ua.updateInfo;

    return form;
}

function getNumeric(timePart: any): number | null {
    return typeof timePart === 'number' && timePart >= 0 ? timePart : null;
}
