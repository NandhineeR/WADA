import {
    AthleteAndAnalysesInformation,
    AuthorizationInformation,
    StepsErrors,
    StepsSection,
    TestRow,
    TestingOrder,
} from '@to/models';
import { NumberOfErrorsPerCategory, anyErrors } from '@shared/utils/form-util';
import { fieldMissing } from '@shared/utils';
import { Moment } from 'moment';
import * as moment from 'moment';
import { statusFromSpecificCode } from '@to/mappers';
import { IViewTOState } from '@to/store/states/to.state';
import { StatusEnum } from '@shared/models/enums';

export function athleteAndAnalysesSectionMissingFields(
    athleteAndAnalyses: AthleteAndAnalysesInformation | null
): number {
    let missing = 0;
    if (athleteAndAnalyses) {
        athleteAndAnalyses.tests.forEach((testRow: TestRow) => {
            if (testRow.sportDiscipline === null || testRow.sportDiscipline === undefined) missing += 1;
        });
    }

    return missing;
}

function authorizationSectionMissingFields(auth: AuthorizationInformation | null): number {
    return auth !== null
        ? fieldMissing(auth.testType) +
              fieldMissing(auth.startDate) +
              fieldMissing(auth.endDate) +
              fieldMissing(auth.testTiming) +
              fieldMissing(auth.testingAuthority) +
              fieldMissing(auth.feeForService) +
              fieldMissing(auth.sampleCollectionAuthority) +
              fieldMissing(auth.grantSCAWriteAccess) +
              fieldMissing(auth.resultManagementAuthority)
        : 1;
}

/**
 * Calculate the age between the birthday and a given date (current date)
 * @param birthdate: Moment
 * @param dateEnd: Moment
 * @return The age
 */
export function calculateAge(birthdate: Moment | null): string {
    if (birthdate !== null) {
        const birthMoment = moment(birthdate, 'YYYY-MM-DD');
        const currentMoment = moment(moment(), 'YYYY-MM-DD');

        return currentMoment.diff(birthMoment, 'years').toString();
    }

    return '';
}

export function initializeCurrentStepErrors(errors: any, section: StepsSection, stepsErrors: StepsErrors): StepsErrors {
    switch (section) {
        case StepsSection.AthleteAndAnalysesSection:
            return new StepsErrors({
                ...stepsErrors,
                athleteAndAnalysesSectionErrors: errors,
            });
        case StepsSection.AuthorizationSection:
            return new StepsErrors({
                ...stepsErrors,
                authorizationSectionErrors: errors,
            });
        case StepsSection.DopingControlPersonelSection:
            return new StepsErrors({
                ...stepsErrors,
                dopingControlPersonelSectionErrors: errors,
            });
        case StepsSection.TestParticipantsSection:
            return new StepsErrors({
                ...stepsErrors,
                testParticipantsSectionErrors: errors,
            });
        default:
            return stepsErrors;
    }
}

export function initializeErrors(to: TestingOrder): StepsErrors {
    if (!to) {
        return new StepsErrors();
    }

    const authorizationSectionErrors = {
        MandatoryDraft: authorizationSectionMissingFields((to as unknown) as AuthorizationInformation),
        mandatory: 0,
    };
    const athleteAndAnalysesSectionErrors = {
        MandatoryDraft: athleteAndAnalysesSectionMissingFields((to as unknown) as AthleteAndAnalysesInformation),
        mandatory: 0,
    };

    return new StepsErrors({ authorizationSectionErrors, athleteAndAnalysesSectionErrors });
}

function isSectionValid(sectionErrors: NumberOfErrorsPerCategory, status: any): boolean {
    if (!anyErrors(sectionErrors)) {
        return true;
    }

    const hasFormatErrors = sectionErrors.Format && sectionErrors.Format > 0;
    const hasBusinessErrors = sectionErrors.Business && sectionErrors.Business > 0;
    const hasMandatoryDraftErrors = sectionErrors.MandatoryDraft && sectionErrors.MandatoryDraft > 0;

    const isIssuedOrInCreation =
        statusFromSpecificCode(status) === StatusEnum.Issued ||
        statusFromSpecificCode(status) === StatusEnum.InCreation;

    if (!isIssuedOrInCreation) return true;

    return Boolean(hasFormatErrors || hasBusinessErrors || hasMandatoryDraftErrors);
}

/**
 * Check if the step has errors or specifics status to return the validity
 * @param state: IViewTOState {@link fromTO.IViewTOState}
 * @param step: The step that is being verified
 * @return The validity
 */
export function isStepValid(state: IViewTOState, step: number): boolean {
    if (state.resetTO) return true;

    const stepsErrors = new StepsErrors(state.stepsErrors);
    const status = state.to.testingOrderStatus;

    switch (step) {
        case 1:
            return isSectionValid(stepsErrors.authorizationSectionErrors, status);
        case 2:
            return isSectionValid(stepsErrors.athleteAndAnalysesSectionErrors, status);
        case 3:
            return isSectionValid(stepsErrors.dopingControlPersonelSectionErrors, status);
        case 4:
            return isSectionValid(stepsErrors.testParticipantsSectionErrors, status);
        default:
            return false;
    }
}
