import { Participant, StatusEnum } from '@shared/models';
import {
    AuthorizationInformation,
    DCF,
    AthleteInformation,
    NonDCFField,
    NotificationInformation,
    ProceduralInformation,
    SampleInformation,
    StepsErrors,
    StepsSection,
    Sample,
    UrineUtils,
    BloodUtils,
    BloodPassportUtils,
    DriedBloodSpotUtils,
} from '@dcf/models';
import { NumberOfErrorsPerCategory, anyErrors, fieldMissing, isEmpty } from '@shared/utils';
import { statusFromSpecificCode } from '@dcf/mappers/status.mapper';
import { IDCFState } from '../store/states/dcf.state';
import { SampleFactory } from './base-sample/sample.factory';

export function initializeCurrentStepErrors(errors: any, section: StepsSection, stepsErrors: StepsErrors): StepsErrors {
    switch (section) {
        case StepsSection.AthleteSection:
            return new StepsErrors({
                ...stepsErrors,
                athleteSectionErrors: errors,
            });
        case StepsSection.AuthorizationSection:
            return new StepsErrors({
                ...stepsErrors,
                authorizationSectionErrors: errors,
            });
        case StepsSection.NotificationSection:
            return new StepsErrors({
                ...stepsErrors,
                notificationSectionErrors: errors,
            });
        case StepsSection.ProceduralSection:
            return new StepsErrors({
                ...stepsErrors,
                proceduralSectionErrors: errors,
            });
        case StepsSection.SampleSection:
            return new StepsErrors({
                ...stepsErrors,
                sampleSectionErrors: errors,
            });
        default:
            return stepsErrors;
    }
}

export function initializeStepsErrors(dcf: DCF, state: IDCFState): StepsErrors {
    if (!dcf) {
        return new StepsErrors();
    }

    const stepsErrors = new StepsErrors(state.stepsErrors);

    const { athlete = new AthleteInformation() } = dcf;
    const athleteSectionErrors = isEmpty(stepsErrors.athleteSectionErrors)
        ? { Mandatory: athleteSectionMissingFields(athlete, state.nonDCFFields) }
        : stepsErrors.athleteSectionErrors;

    const { authorization = new AuthorizationInformation() } = dcf;
    const authorizationSectionErrors = isEmpty(stepsErrors.authorizationSectionErrors)
        ? { MandatoryDraft: authorizationSectionMissingFields(authorization) }
        : stepsErrors.authorizationSectionErrors;

    const { notification = new NotificationInformation() } = dcf;
    const notificationSectionErrors = isEmpty(stepsErrors.notificationSectionErrors)
        ? { Mandatory: notificationSectionMissingFields(notification) }
        : stepsErrors.notificationSectionErrors;

    const { proceduralInformation = new ProceduralInformation() } = dcf;
    const proceduralSectionErrors = isEmpty(stepsErrors.proceduralSectionErrors)
        ? { Mandatory: proceduralSectionMissingFields(proceduralInformation) }
        : stepsErrors.proceduralSectionErrors;

    const { sampleInformation = new SampleInformation() } = dcf;
    const sampleSectionErrors = isEmpty(stepsErrors.sampleSectionErrors)
        ? { Mandatory: sampleSectionMissingFields(sampleInformation) }
        : stepsErrors.sampleSectionErrors;

    return new StepsErrors({
        athleteSectionErrors,
        authorizationSectionErrors,
        notificationSectionErrors,
        proceduralSectionErrors,
        sampleSectionErrors,
    });
}

export function isStepSectionValid(state: IDCFState, section: StepsSection): boolean {
    if (state.resetDcf) return true;

    const stepsErrors = new StepsErrors(state.stepsErrors);
    const { status } = state.currentDcf;
    switch (section) {
        case StepsSection.AthleteSection:
            return isSectionValid(stepsErrors.athleteSectionErrors, status);
        case StepsSection.AuthorizationSection:
            return isSectionValid(stepsErrors.authorizationSectionErrors, state.currentDcf.status);
        case StepsSection.NotificationSection:
            return isSectionValid(stepsErrors.notificationSectionErrors, state.currentDcf.status);
        case StepsSection.ProceduralSection:
            return isSectionValid(stepsErrors.proceduralSectionErrors, status);
        case StepsSection.SampleSection:
            return isSectionValid(stepsErrors.sampleSectionErrors, status);
        default:
            return false;
    }
}

export function isStepValid(state: IDCFState, step: number): boolean {
    if (state.resetDcf) return true;

    const stepsErrors = new StepsErrors(state.stepsErrors);
    const { status } = state.currentDcf;
    switch (step) {
        case 1:
            return (
                isSectionValid(stepsErrors.athleteSectionErrors, status) &&
                isSectionValid(stepsErrors.authorizationSectionErrors, state.currentDcf.status) &&
                isSectionValid(stepsErrors.notificationSectionErrors, state.currentDcf.status)
            );
        case 2:
            return isSectionValid(stepsErrors.sampleSectionErrors, status);
        case 3:
            return isSectionValid(stepsErrors.proceduralSectionErrors, status);
        default:
            return false;
    }
}

function athleteSectionMissingFields(athlete: AthleteInformation | null, non: NonDCFField): number {
    if (athlete !== null) {
        return (
            (athlete.address ? fieldMissing(athlete.address.country) + fieldMissing(athlete.address.city) : 0) +
            fieldMissing(athlete.email) * (non.emailNotProvided ? 0 : 1) +
            fieldMissing(athlete.sportDiscipline) +
            fieldMissing(athlete.athleteLevel) +
            participantFieldsMissing(athlete.coach) * (non.coachNotApplicable ? 1 : 0) +
            participantFieldsMissing(athlete.doctor) * (non.doctorNotApplicable ? 1 : 0)
        );
    }
    return 1;
}

function authorizationSectionMissingFields(auth: AuthorizationInformation | null): number {
    return auth !== null
        ? fieldMissing(auth.testingAuthority) +
              fieldMissing(auth.sampleCollectionAuthority) +
              fieldMissing(auth.resultManagementAuthority)
        : 1;
}

function isSectionValid(sectionErrors: NumberOfErrorsPerCategory, status: any): boolean {
    if (!anyErrors(sectionErrors)) {
        return true;
    }

    const isDraft = statusFromSpecificCode(status) === StatusEnum.Draft;

    const hasFormatErrors = sectionErrors.Format && sectionErrors.Format > 0;
    const hasBusinessErrors = sectionErrors.Business && sectionErrors.Business > 0;
    const hasMandatoryDraftErrors = sectionErrors.MandatoryDraft && sectionErrors.MandatoryDraft > 0;
    if (isDraft) {
        return !(hasFormatErrors || hasBusinessErrors || hasMandatoryDraftErrors);
    }

    /**
     * If the DCF is marked as completed and there are any errors, the navigation between steps should be disabled.
     */
    const hasMandatoryErrors = sectionErrors.Mandatory && sectionErrors.Mandatory > 0;
    return !(hasFormatErrors || hasBusinessErrors || hasMandatoryDraftErrors || hasMandatoryErrors);
}

function notificationSectionMissingFields(notification: NotificationInformation | null): number {
    if (notification !== null) {
        return (
            fieldMissing(notification.advanceNotice) +
            fieldMissing(notification.advanceNoticeReason) * (notification.advanceNotice ? 1 : 0) +
            fieldMissing(notification.notificationDate) +
            fieldMissing(notification.timezone) +
            participantFieldsMissing(notification.notifyingChaperone)
        );
    }
    return 1;
}

function proceduralSectionMissingFields(proceduralInformation: ProceduralInformation | null): number {
    return proceduralInformation !== null
        ? fieldMissing(proceduralInformation.consentForResearch) + participantFieldsMissing(proceduralInformation.dco)
        : 1;
}

function participantFieldsMissing(participant: Participant | null | undefined): number {
    return participant !== null && participant
        ? fieldMissing(participant.firstName) + fieldMissing(participant.lastName)
        : 2;
}

function sampleSectionMissingFields(sampleInformation: SampleInformation | null): number {
    return sampleInformation !== null
        ? fieldMissing(sampleInformation.arrivalDate) +
              fieldMissing(sampleInformation.timezone) +
              fieldMissing(sampleInformation.testType) +
              fieldMissing(sampleInformation.feeForService) +
              fieldMissingForSamples(sampleInformation.samples)
        : 1;
}

function fieldMissingForSamples(samples: Array<Sample> | null): number {
    return samples && samples.length > 0
        ? samples
              .map((s) => {
                  if (SampleFactory.isUrine(s)) {
                      return UrineUtils.missingFields(s).size;
                  }
                  if (SampleFactory.isBlood(s)) {
                      return BloodUtils.missingFields(s).size;
                  }
                  if (SampleFactory.isBloodPassport(s)) {
                      return BloodPassportUtils.missingFields(s).size;
                  }
                  if (SampleFactory.isDriedBloodSpot(s)) {
                      return DriedBloodSpotUtils.missingFields(s).size;
                  }
                  return 1;
              })
              .reduce((accumulator, currentValue) => accumulator + currentValue, 0) || 0
        : 1;
}
