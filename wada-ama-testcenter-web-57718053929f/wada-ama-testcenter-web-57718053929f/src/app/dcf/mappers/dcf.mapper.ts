import { adjustTimezoneToLocal, propsUndefined, propsUndefinedOrEmpty } from '@shared/utils';
import {
    Address,
    Country,
    FieldsSecurity,
    ListItem,
    Region,
    SportDiscipline,
    StatusEnum,
    TOItem,
    Test,
} from '@shared/models';
import {
    AthleteInformation,
    AuthorizationInformation,
    DCF,
    DCFForm,
    DCFMode,
    DCFStatus,
    NotificationInformation,
    ProceduralInformation,
    SampleInformation,
    Timezone,
    Urine,
} from '@dcf/models';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { mapTestAnalysesToSample, setSpecificGravity } from './section-sample.mapper';
import { statusFromSpecificCode } from './status.mapper';

export function athleteToAthleteInfo(athlete: AthleteInformation | null): AthleteInformation | null {
    if (athlete === null) {
        return null;
    }
    const athleteInfo = new AthleteInformation();
    athleteInfo.id = athlete.id;
    athleteInfo.firstName = athlete.firstName;
    athleteInfo.lastName = athlete.lastName;
    athleteInfo.sex = athlete.sex;
    athleteInfo.adamsId = athlete.adamsId;
    athleteInfo.address = athlete.address ? new Address(athlete.address) : null;
    athleteInfo.email = athlete.email;
    athleteInfo.sportDiscipline =
        athlete.sportDisciplines && athlete.sportDisciplines.length === 1
            ? new SportDiscipline(athlete.sportDisciplines[0])
            : null;
    athleteInfo.sportNationality = athlete.sportNationality;

    return athleteInfo;
}

export function athleteToTOItem(toItems: Array<TOItem>, athlete: AthleteInformation): Array<TOItem> {
    return toItems.map((item) => {
        const toItem = new TOItem(item);
        toItem.athlete = athleteToAthleteInfo(athlete);
        return toItem;
    });
}

function createAthleteClone(athlete: AthleteInformation | null, to: TOItem) {
    const athleteClone = new AthleteInformation(athlete);
    athleteClone.sportDiscipline = to.sportDiscipline;
    athleteClone.athleteLevel = to.athleteLevel;

    if (to.test) {
        athleteClone.coach = to.test.coach;
        athleteClone.doctor = to.test.doctor;
    }

    return athleteClone;
}

function createAthleteInfo(dcf: DCF, to: TOItem | undefined) {
    const athlete = new AthleteInformation(dcf.athlete || to?.athlete);
    if (to?.test) {
        athlete.sportDiscipline = to.sportDiscipline;
        athlete.athleteLevel = to.athleteLevel;
        athlete.coach = to.test.coach;
        athlete.doctor = to.test.doctor;
    }
    return athlete;
}

function createAuthorizationForTO(to: TOItem, dcf: DCF): AuthorizationInformation {
    const authorization = new AuthorizationInformation(dcf.authorization);
    authorization.testingOrderNumber = to.testingOrderNumber;
    authorization.testingOrderId = to.id;
    authorization.adoReferenceNumber = to.adoReferenceNumber || null;
    authorization.testingAuthority = new ListItem(to.testingAuthority);
    authorization.sampleCollectionAuthority = new ListItem(to.sampleCollectionAuthority);
    authorization.resultManagementAuthority = new ListItem(to.resultManagementAuthority);
    authorization.testCoordinator = new ListItem(to.testCoordinator);
    return authorization;
}

function createNotificationForTO(to: TOItem, dcf: DCF): NotificationInformation {
    const notification = new NotificationInformation(dcf.notification);
    notification.country = propsUndefined(to.country) ? null : new Country(to.country);
    notification.region = propsUndefined(to.region) ? null : new Region(to.region);
    notification.city = to.city;
    return notification;
}

function createSampleInformationForTO(to: TOItem, dcf: DCF): SampleInformation {
    const sampleInformation = new SampleInformation(dcf.sampleInformation);
    sampleInformation.testType = to.testType || false;
    sampleInformation.feeForService = to.serviceFee || false;
    return sampleInformation;
}

function getDCOFromTO(to: TOItem) {
    if (to.test) {
        if (to.athlete) {
            if (to.test.dopingControlOfficer == null) {
                return to.leadDopingControlOfficer;
            }

            return to.test.dopingControlOfficer;
        }

        return to.test.dopingControlOfficer;
    }

    return null;
}

function isSampleInformationFilled(sampleInformation: SampleInformation): boolean {
    if (!sampleInformation.samples.length) return false;
    return sampleInformation.samples.length > 1
        ? true
        : Boolean(
              sampleInformation.samples[0].results ||
                  sampleInformation.samples[0].collectionDate ||
                  sampleInformation.samples[0].sampleCode ||
                  sampleInformation.samples[0].laboratory ||
                  sampleInformation.samples[0].chainOfCustody
          );
}

/**
 * Build the dcf back from the fields of the form and the current dcf(the fields that are not in the form)
 * @param form: the form that is being modified by the user
 * @param currentDCF: the dcf that is being created or modified
 */
export function mapDCFFromForm(form: DCFForm, currentDCF: DCF | null): DCF {
    const dcf = new DCF(currentDCF);
    dcf.id = form.id;
    setTestFieldsFromForm(dcf, form);
    setAthleteFieldsFromForm(dcf, form);
    setNotificationFieldsFromForm(dcf, form);
    setSampleInformationFieldsFromForm(dcf, form);
    setProceduralInformationFieldsFromForm(dcf, form);
    const dcfStatus = new DCFStatus();
    dcfStatus.specificCode = form.status || dcf.status?.specificCode || '';
    dcf.status = dcfStatus;

    return dcf;
}

/**
 * Used in multiple-dcf, create a list of dcf from a list of tests
 * @param tests: list of test
 */
export function mapDCFFromTest(tests: Array<Test>): Array<DCF> {
    return tests.map((test) => {
        const athlete = test.athlete || new AthleteInformation();
        let dcf = new DCF();
        dcf = mergeAthleteToDCF(athlete, dcf);
        dcf.test = test;
        dcf.testId = parseInt(test.id, 10);
        if (dcf.athlete) {
            if (test.athlete) {
                dcf.athlete.id = test.athlete.id;
                dcf.athlete.coach = test.coach;
                dcf.athlete.doctor = test.doctor;
            }
            dcf.athlete.sportDiscipline = test.sportDiscipline;
            dcf.athlete.athleteLevel = test.athleteLevel;
        }
        if (!dcf.authorization) {
            dcf.authorization = new AuthorizationInformation();
            dcf.authorization.sampleCollectionAuthority = test.sampleCollectionAuthority;
            dcf.authorization.resultManagementAuthority = test.resultManagementAuthority;
            dcf.authorization.testingAuthority = test.testingAuthority;
        }
        if (!dcf.notification) {
            dcf.notification = new NotificationInformation();
            dcf.notification.country = test.country;
            dcf.notification.notifyingChaperone = test.notifyingChaperone;
        }
        if (!dcf.sampleInformation) {
            dcf.sampleInformation = new SampleInformation();
            dcf.sampleInformation.testType = test.testType || false;
            dcf.sampleInformation.samples = mapTestAnalysesToSample(test);
        } else {
            dcf.sampleInformation.testType = test.testType || false;
            dcf.sampleInformation.samples = mapTestAnalysesToSample(test);
        }
        if (dcf.proceduralInformation) {
            dcf.proceduralInformation.dco = test.dopingControlOfficer;
        }
        return dcf;
    });
}

/**
 * Mapping a dcf to a dcf form which is used for multiple dcf
 * @param dcf: a DCF
 * @param fields: The available dcf fields
 * @param actions: The available actions
 */
export function mapDCFToDCFForm(dcf: DCF, fieldsSecurity: Map<string, FieldsSecurity>, fromView = false): DCFForm {
    const form = new DCFForm();
    form.id = dcf.id;
    setAthleteFieldsOnForm(form, dcf);
    setTestFieldsOnForm(form, dcf);
    setNotificationFieldsOnForm(form, dcf);
    setSampleInformationFieldsOnForm(form, dcf, fromView);
    setProceduralInformationFieldsOnForm(form, dcf);

    form.status = StatusEnum[statusFromSpecificCode(dcf.status)];
    if (fieldsSecurity) {
        const singleDCFFields = fieldsSecurity.get(dcf.id?.toString() || '');
        if (singleDCFFields) {
            form.fieldsSecurity = singleDCFFields;
        }
    }
    return form;
}

export function mergeAthleteExtraFromTOFieldsToDCF(athlete: AthleteInformation, dcfInput: DCF, mode: DCFMode): DCF {
    const dcf = dcfInput || new DCF();
    if (athlete && mode !== DCFMode.Edit) {
        const athleteInfo = new AthleteInformation();
        athleteInfo.address = athlete.address;
        athleteInfo.adamsId = athlete.adamsId;
        athleteInfo.bpNumber = athlete.bpNumber;
        athleteInfo.email = athlete.email;
        athleteInfo.dateOfBirth = athlete.dateOfBirth;
        if (dcf.athlete) {
            return {
                ...dcf,
                athlete: new AthleteInformation({
                    ...dcf.athlete,
                    address: athlete.address,
                    adamsId: athlete.adamsId,
                    bpNumber: athlete.bpNumber,
                    email: athlete.email,
                    dateOfBirth: athlete.dateOfBirth,
                    sportNationality: athlete.sportNationality,
                }),
            };
        }
        const sampleInformation = new SampleInformation();
        sampleInformation.testType = true;
        sampleInformation.feeForService = false;

        return { ...dcf, athlete: athleteInfo, sampleInformation };
    }
    return dcf;
}

export function mergeAthleteToDCF(athlete: AthleteInformation, dcfInput: DCF): DCF {
    const dcf = dcfInput || new DCF();
    if (athlete) {
        const notification = new NotificationInformation();
        const sampleInformation = new SampleInformation();
        const proceduralInformation = new ProceduralInformation();
        sampleInformation.testType = true;
        sampleInformation.feeForService = false;
        sampleInformation.samples = [];
        const sample = new Urine();
        sampleInformation.samples.push(sample);

        const dcfAthlete = athleteToAthleteInfo(athlete);
        if (dcfAthlete) {
            return {
                ...dcf,
                athlete: dcfAthlete,
                notification,
                sampleInformation,
                proceduralInformation,
            };
        }
        return { ...dcf, notification, sampleInformation, proceduralInformation };
    }
    return dcf;
}

export function mergeTOWithDCF(to: TOItem | undefined, dcf: DCF): DCF {
    if (to) {
        const authorization = createAuthorizationForTO(to, dcf);
        const notification = createNotificationForTO(to, dcf);
        const sampleInformation = createSampleInformationForTO(to, dcf);

        const test = new Test(to.test);
        if (to.test !== null && to.test.id !== '' && !(dcf.id && !isSampleInformationFilled(sampleInformation))) {
            sampleInformation.samples = mapTestAnalysesToSample(test);
        }

        const proceduralInformation = new ProceduralInformation();

        if (to.test) {
            notification.notifyingChaperone = to.test.notifyingChaperone;
            proceduralInformation.athleteRepresentative = to.test.athleteRepresentative;
            proceduralInformation.dco = getDCOFromTO(to);
        }

        if (to.athlete) {
            const athlete = createAthleteInfo(dcf, to);

            return {
                ...dcf,
                authorization,
                notification,
                athlete,
                sampleInformation,
                test,
                proceduralInformation,
            };
        }

        const athleteClone = createAthleteClone(dcf.athlete, to);

        return {
            ...dcf,
            authorization,
            notification,
            athlete: athleteClone,
            sampleInformation,
            test,
            proceduralInformation,
        };
    }

    return {
        ...dcf,
        authorization: null,
        notification: null,
        test: null,
    };
}

function setAthleteFieldsFromForm(dcf: DCF, form: DCFForm) {
    if (dcf.athlete) {
        dcf.athlete.email = form.email;
        dcf.athlete.emailNotProvided = form.emailNotProvided;
        dcf.athlete.sportDiscipline = form.sportDiscipline;
        dcf.athlete.address = form.address || new Address();
        dcf.athlete.coach = form.coachNotApplicable ? null : form.coach;
        dcf.athlete.doctor = form.doctorNotApplicable ? null : form.doctor;
        dcf.athlete.coachNotApplicable = form.coachNotApplicable;
        dcf.athlete.doctorNotApplicable = form.doctorNotApplicable;
    }
}

function setAthleteFieldsOnForm(form: DCFForm, dcf: DCF) {
    if (dcf.athlete) {
        const { athlete } = dcf;
        form.athleteId = athlete.id?.toString() || '';
        form.email = athlete.email;
        form.emailNotProvided = athlete.emailNotProvided;
        form.sportDiscipline = athlete.sportDiscipline;
        form.name =
            athlete.firstName && athlete.lastName
                ? `${athlete.firstName}, ${athlete.lastName}`
                : athlete.firstName || athlete.lastName;
        form.address = athlete.address;
        form.doctor = athlete.doctor;
        form.coach = athlete.coach;
        form.athleteLevel = athlete.athleteLevel;
        form.coachNotApplicable = athlete.coachNotApplicable || false;
        form.doctorNotApplicable = athlete.doctorNotApplicable || false;
        form.sportDiscipline = athlete.sportDiscipline;
    }
}

function setNotificationFieldsFromForm(dcf: DCF, form: DCFForm) {
    if (dcf.notification) {
        dcf.notification.advanceNotice = form.advanceNotice;
        dcf.notification.notificationDate = form.notificationDate;
        dcf.notification.timezone = form.notificationTimezone;
        dcf.notification.notifyingChaperone = form.notifyingChaperone;
    }
}

function setNotificationFieldsOnForm(form: DCFForm, dcf: DCF) {
    if (dcf.notification) {
        const { notification } = dcf;
        form.advanceNotice = notification.advanceNotice;
        form.notificationDate = adjustTimezoneToLocal(notification.notificationDate);
        form.notificationTimezone =
            notification.timezone && !propsUndefinedOrEmpty(notification.timezone)
                ? new Timezone(notification.timezone)
                : null;
        form.notifyingChaperone = notification.notifyingChaperone;
    }
}

function setProceduralInformationFieldsFromForm(dcf: DCF, form: DCFForm) {
    if (dcf.proceduralInformation) {
        dcf.proceduralInformation.dco = form.dco || null;
        dcf.proceduralInformation.consentForResearch = form.consentForResearch || false;
        dcf.proceduralInformation.endOfProcedureDate = form.endOfProcedureDate || null;
        dcf.proceduralInformation.timezone = form.endOfProcedureTimezone || null;
        dcf.proceduralInformation.declarationOfSupplements = form.declarationOfSupplements || null;
    }
}

function setProceduralInformationFieldsOnForm(form: DCFForm, dcf: DCF) {
    if (dcf.proceduralInformation) {
        form.dco = dcf.proceduralInformation.dco;
        form.consentForResearch = dcf.proceduralInformation.consentForResearch;
        form.declarationOfSupplements = dcf.proceduralInformation.declarationOfSupplements;
        form.endOfProcedureDate = dcf.proceduralInformation.endOfProcedureDate;
    }
}

function setSampleInformationFieldsFromForm(dcf: DCF, form: DCFForm) {
    if (dcf.sampleInformation) {
        dcf.sampleInformation.feeForService = form.feeForService;
        dcf.sampleInformation.arrivalDate = form.arrivalDate;
        dcf.sampleInformation.timezone = form.arrivalTimezone;
        const samples = form.samples
            .filter((sample) => sample !== null)
            .map((sample) => SampleFactory.createSample(sample));
        dcf.sampleInformation.samples = setSpecificGravity(samples, true);
    }
}

function setSampleInformationFieldsOnForm(form: DCFForm, dcf: DCF, fromView: boolean) {
    if (dcf.sampleInformation) {
        const { sampleInformation } = dcf;
        form.feeForService = sampleInformation.feeForService;
        form.arrivalDate = adjustTimezoneToLocal(sampleInformation.arrivalDate);
        form.arrivalTimezone =
            sampleInformation.timezone && !propsUndefinedOrEmpty(sampleInformation.timezone)
                ? new Timezone(sampleInformation.timezone)
                : null;
        const samples = sampleInformation.samples
            .filter((sample) => sample !== null)
            .map((sample) => SampleFactory.createSample(sample));
        form.samples = fromView ? samples : setSpecificGravity(samples, false);
    }
}

function setTestFieldsFromForm(dcf: DCF, form: DCFForm) {
    if (form.testId) {
        dcf.testId = parseInt(form.testId, 10);
    }
}

function setTestFieldsOnForm(form: DCFForm, dcf: DCF) {
    if (dcf.test) {
        form.testId = dcf.test.id;
    }
}
