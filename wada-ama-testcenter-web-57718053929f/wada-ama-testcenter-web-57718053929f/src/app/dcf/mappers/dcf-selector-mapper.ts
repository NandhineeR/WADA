import { DCF, LabResult, ProceduralInformation, Sample, SampleInformation, TimezoneField } from '@dcf/models';
import { Analysis, Participant, SampleTypeEnum, TOItem, Test } from '@shared/models';
import * as moment from 'moment';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { athleteToAthleteInfo } from './dcf.mapper';

export function mapTOItem(toTest: Test): TOItem {
    const toItem = new TOItem();

    const test = new Test();
    test.id = toTest.id;
    test.majorEvent = toTest.majorEvent;
    test.competitionName = toTest.competitionName;
    test.analyses = toTest.analyses?.map((analysis: Analysis) => new Analysis(analysis)) || [];
    toItem.id = toTest.toId;
    toItem.testingOrderNumber = toTest.testingOrderNumber;
    toItem.placeholder = toTest.placeholder;
    toItem.test = test;
    toItem.testingOrderNumber = toTest.testingOrderNumber;
    toItem.testingAuthority = toTest.testingAuthority;
    toItem.sampleCollectionAuthority = toTest.sampleCollectionAuthority;
    toItem.resultManagementAuthority = toTest.resultManagementAuthority;
    toItem.testCoordinator = toTest.testCoordinator;
    toItem.adoReferenceNumber = toTest.adoReferenceNumber;
    toItem.sportDiscipline = toTest.sportDiscipline;
    toItem.country = toTest.country;
    toItem.region = toTest.region;
    toItem.city = toTest.city;
    toItem.athleteLevel = toTest.athleteLevel;
    toItem.testType = toTest.testType;
    toItem.serviceFee = toTest.serviceFee;
    toItem.athlete = athleteToAthleteInfo(toTest.athlete);
    toItem.test.witnessChaperone = toTest.witnessChaperone;
    toItem.test.notifyingChaperone = toTest.notifyingChaperone;
    toItem.test.coach = toTest.coach;
    toItem.test.doctor = toTest.doctor;
    toItem.test.bloodCollectionOfficer = toTest.bloodCollectionOfficer;
    toItem.test.athleteRepresentative = toTest.athleteRepresentative;
    toItem.test.dopingControlOfficer = toTest.dopingControlOfficer;

    return toItem;
}

export function fetchParticipantFromEverySteps(dcf: DCF): Array<Participant> {
    const participants = Array<Participant>();

    if (dcf.notification && dcf.notification.notifyingChaperone) {
        participants.push(dcf.notification.notifyingChaperone);
    }

    if (dcf.proceduralInformation && dcf.proceduralInformation.dco) {
        participants.push(dcf.proceduralInformation.dco);
    }

    if (dcf.sampleInformation && dcf.sampleInformation.samples) {
        dcf.sampleInformation.samples.forEach((sample: Sample) => {
            addRelevantSampleParticipant(sample, participants);
        });
    }

    return participants;
}

function addRelevantSampleParticipant(sample: Sample, participants: Array<Participant>) {
    if (SampleFactory.isUrine(sample)) {
        if (sample.witnessChaperone) {
            participants.push(sample.witnessChaperone);
        }
    }
    if (SampleFactory.isBlood(sample)) {
        if (sample.bloodCollectionOfficial) {
            participants.push(sample.bloodCollectionOfficial);
        }
    }
    if (SampleFactory.isBloodPassport(sample)) {
        if (sample.bloodCollectionOfficial) {
            participants.push(sample.bloodCollectionOfficial);
        }
    }
}

export function removeDuplicateParticipant(participantArray: Array<Participant>): Array<Participant> {
    return (
        participantArray &&
        participantArray.reduce((acc: Array<Participant>, current: Participant) => {
            const duplicate = acc.find(
                (participant) =>
                    participant.lastName === current.lastName && participant.firstName === current.firstName
            );
            if (!duplicate) {
                return acc.concat([current]);
            }
            return acc;
        }, [])
    );
}

export function compareSampleFields(labResult: LabResult, sample: Sample): Array<string> {
    const fieldsMismatches: Array<string> = [];

    // Because we store UTC datetime in the database, it's essential to disregard the time information in order
    // to accurately compare the dates.
    const collectionDate: string = moment(sample.collectionDate).format('YYYY-MM-DD') || '';

    if (moment(labResult.arrivalDate).valueOf() !== moment(collectionDate).valueOf()) {
        fieldsMismatches.push('collectionDate');
    }
    if (labResult.sampleCode !== sample.sampleCode) {
        fieldsMismatches.push('sampleCode');
    }
    if (!labResult.sampleType || labResult.sampleType.specificCode !== sample.sampleTypeSpecificCode) {
        fieldsMismatches.push('sampleType');
    }
    if (!labResult.laboratory || !sample.laboratory || +labResult.laboratory.id !== +sample.laboratory.id) {
        fieldsMismatches.push('laboratory');
    }
    return fieldsMismatches;
}

export function compareSampleInformationFields(labResult: LabResult, dcf: DCF): Array<string> {
    const fieldsMismatches: Array<string> = [];
    if (!dcf.sampleInformation || labResult.inCompetition !== dcf.sampleInformation.testType) {
        fieldsMismatches.push('inCompetition');
    }
    return fieldsMismatches;
}

export function compareAthleteFields(labResult: LabResult, dcf: DCF, gender: string | undefined): Array<string> {
    const fieldsMismatches: Array<string> = [];
    if (
        !dcf.athlete ||
        !dcf.athlete.sportDiscipline ||
        !labResult.sport ||
        labResult.sport.sportId !== dcf.athlete.sportDiscipline.sportId
    ) {
        fieldsMismatches.push('sport');
    }
    if (
        !dcf.athlete ||
        !dcf.athlete.sportDiscipline ||
        !labResult.sport ||
        labResult.sport.disciplineId !== dcf.athlete.sportDiscipline.disciplineId
    ) {
        fieldsMismatches.push('sportDiscipline');
    }
    if (!dcf.athlete || labResult.gender !== gender) {
        fieldsMismatches.push('gender');
    }
    return fieldsMismatches;
}

export function compareNotificationFields(labResult: LabResult, dcf: DCF): Array<string> {
    const fieldsMismatches: Array<string> = [];
    if ((dcf.notification?.country || labResult.country) && dcf.notification?.country?.id !== labResult.country?.id) {
        fieldsMismatches.push('country');
    }

    if ((dcf.notification?.region || labResult.state) && dcf.notification?.region?.id !== labResult.state?.id) {
        fieldsMismatches.push('state');
    }

    if ((dcf.notification?.city || labResult.city) && dcf.notification?.city !== labResult.city) {
        fieldsMismatches.push('city');
    }
    return fieldsMismatches;
}

export function compareAuthorizationFields(labResult: LabResult, dcf: DCF): Array<string> {
    const fieldsMismatches: Array<string> = [];
    if (
        !labResult.testAuthority ||
        !dcf.authorization ||
        !dcf.authorization.testingAuthority ||
        labResult.testAuthority.id !== dcf.authorization.testingAuthority.id
    ) {
        fieldsMismatches.push('testAuthority');
    }
    if (
        !labResult.sampleCollectionAuthority ||
        !dcf.authorization ||
        !dcf.authorization.sampleCollectionAuthority ||
        labResult.sampleCollectionAuthority.id !== dcf.authorization.sampleCollectionAuthority.id
    ) {
        fieldsMismatches.push('sampleCollectionAuthority');
    }
    if (
        !labResult.resultManagementAuthority ||
        !dcf.authorization ||
        !dcf.authorization.resultManagementAuthority ||
        labResult.resultManagementAuthority.id !== dcf.authorization.resultManagementAuthority.id
    ) {
        fieldsMismatches.push('resultManagementAuthority');
    }
    return fieldsMismatches;
}

export function overwriteTimezoneFields(
    sampleInformation: SampleInformation | null,
    samples: Array<Sample>,
    proceduralInformation: ProceduralInformation | null
) {
    const populatedTimezoneFields: Array<TimezoneField> = [];

    if (sampleInformation?.timezone) {
        populatedTimezoneFields.push(
            new TimezoneField({
                dateTimeField: TimezoneField.datetimeFields.arrivalDate,
                timezone: sampleInformation.timezone,
            })
        );
    }

    if (samples) {
        samples.forEach((sample) => {
            if (sample.timezone) {
                const timezoneField = new TimezoneField({ timezone: sample.timezone });

                switch (sample.sampleTypeSpecificCode) {
                    case SampleTypeEnum.Urine:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.urineSample;
                        break;
                    case SampleTypeEnum.Blood:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.bloodSample;
                        break;
                    case SampleTypeEnum.BloodPassport:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.bpSample;
                        break;
                    case SampleTypeEnum.DriedBloodSpot:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.dbsSample;
                        break;
                    default:
                        timezoneField.dateTimeField = '';
                }

                populatedTimezoneFields.push(timezoneField);
            }
        });
    }

    if (proceduralInformation?.timezone) {
        populatedTimezoneFields.push(
            new TimezoneField({
                dateTimeField: TimezoneField.datetimeFields.endOfProcedureDate,
                timezone: proceduralInformation.timezone,
            })
        );
    }

    return populatedTimezoneFields;
}
