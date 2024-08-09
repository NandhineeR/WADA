import { createSelector } from '@ngrx/store';
import { Attachment, AttachmentType, ListItem, Phone, SpecificCode, StatusEnum, TOItem, Test } from '@shared/models';
import { anyErrors } from '@shared/utils';
import {
    athleteToTOItem,
    compareAthleteFields,
    compareAuthorizationFields,
    compareNotificationFields,
    compareSampleFields,
    compareSampleInformationFields,
    dcfToSectionAthlete,
    dcfToSectionAuthorization,
    dcfToSectionNotification,
    dcfToSectionProcedural,
    dcfToSectionSample,
    overwriteTimezoneFields,
    statusFromSpecificCode,
} from '@dcf/mappers';
import * as fromRootStore from '@core/store';
import { ConflictException } from '@core/models';
import { getDCFState } from '@dcf/store/reducers';
import {
    AuthorizationInformation,
    DCF,
    AthleteInformation,
    DCFMode,
    NotificationInformation,
    ProceduralInformation,
    Result,
    Sample,
    SampleInformation,
    StepsErrors,
    NonDCFField,
    StepsSection,
} from '@dcf/models';
import { IDCFState } from '@dcf/store/states/dcf.state';
import { isStepSectionValid, isStepValid } from '@dcf/utils/steps.utils';
import { getAutoCompletesState } from '@autocompletes/store/reducers';
import { IAutoCompletesState } from '@autocompletes/store/states/autocompletes.state';

export const getActivitiesError = createSelector(getDCFState, (state: IDCFState) => state?.activitiesError || false);
export const getAttachments = createSelector(getDCFState, (state: IDCFState) => state?.attachments || []);
export const getConflictException = createSelector(getDCFState, (state: IDCFState) => state.conflictException);
export const getCurrentDCF = createSelector(getDCFState, (state: IDCFState) => state?.currentDcf);
export const getError = createSelector(getDCFState, (state: IDCFState) => state?.error || false);
export const getErrorMessageKey = createSelector(getDCFState, (state: IDCFState) => state.errorMessageKey);
export const getFieldsSecurity = createSelector(getDCFState, (state: IDCFState) => state.fieldsSecurity);
export const getHasBeenDeleted = createSelector(getDCFState, (state: IDCFState) => state?.hasBeenDeleted || false);
export const getHasBeenSaved = createSelector(getDCFState, (state: IDCFState) => state.hasBeenSaved);
export const getIsCurrentStepValid = createSelector(
    getDCFState,
    fromRootStore.getActiveRoute,
    (state: IDCFState, route: fromRootStore.RouterStateUrl) => isStepValid(state, route.data.step as number)
);
export const getIsStepAthleteSectionValid = createSelector(getDCFState, (state: IDCFState) =>
    isStepSectionValid(state, StepsSection.AthleteSection)
);
export const getIsStepAuthorizationSectionValid = createSelector(getDCFState, (state: IDCFState) =>
    isStepSectionValid(state, StepsSection.AuthorizationSection)
);
export const getIsStepNotificationSectionValid = createSelector(getDCFState, (state: IDCFState) =>
    isStepSectionValid(state, StepsSection.NotificationSection)
);
export const getIsUserAnonymous = createSelector(getDCFState, (state: IDCFState) => state.isUserAnonymous);
export const getLabResult = createSelector(getDCFState, (state: IDCFState) => state.labResult);
export const getLoadingPage = createSelector(getDCFState, (state: IDCFState) => state?.loading || false);
export const getLoadingTOs = createSelector(getDCFState, (state: IDCFState) => state.loadingTOs);
export const getMajorEvents = createSelector(getDCFState, (state: IDCFState) => state.majorEvents || []);
export const getMode = createSelector(getDCFState, (state: IDCFState) => state.mode);
export const getNonDCFField = createSelector(getDCFState, (state: IDCFState) => state.nonDCFFields);
export const getOriginalDCF = createSelector(getDCFState, (state: IDCFState) => state.originalDcf);
export const getReloadDCFView = createSelector(getDCFState, (state: IDCFState | null) => state?.reloadDCFView || false);
export const getResetDCF = createSelector(getDCFState, (state: IDCFState) => state.resetDcf);
export const getSample = createSelector(getDCFState, (state: IDCFState) => state.sample);
export const getSampleValidityWasUpdated = createSelector(
    getDCFState,
    (state: IDCFState) => state.sampleValidityWasUpdated
);
export const getSaveError = createSelector(getDCFState, (state: IDCFState) => state.saveError);
export const getSaving = createSelector(getDCFState, (state: IDCFState) => state.saving || false);
export const getStatus = createSelector(getDCFState, (state: IDCFState) =>
    statusFromSpecificCode(state.currentDcf.status)
);

/**
 * GET ATTACHMENTS
 */
export const getAttachmentsAthletePhoto = createSelector(getAttachments, (attachments: Array<Attachment>) => {
    return attachments.find((attachment: Attachment) => attachment.attachmentType === AttachmentType.ATHLETE_PHOTO);
});
export const getAttachmentsChainOfCustody = createSelector(getAttachments, (attachments: Array<Attachment>) => {
    return attachments.find((attachment: Attachment) => attachment.attachmentType === AttachmentType.CHAIN_OF_CUSTODY);
});
export const getAttachmentsNotification = createSelector(getAttachments, (attachments: Array<Attachment>) => {
    return attachments.find((attachment: Attachment) => attachment.attachmentType === AttachmentType.NOTIFICATION);
});
export const getAttachmentsSignedCopy = createSelector(getAttachments, (attachments: Array<Attachment>) => {
    return attachments.find((attachment: Attachment) => attachment.attachmentType === AttachmentType.SIGNED_DCF);
});

/**
 * STEP ERRORS
 */
export const getSectionAthleteErrors = createSelector(
    getDCFState,
    (state: IDCFState) => state.stepsErrors.athleteSectionErrors
);
export const getSectionAthleteShowErrors = createSelector(
    getDCFState,
    (state: IDCFState) =>
        anyErrors(state.stepsErrors.athleteSectionErrors) && state.hasBeenSubmitted.athleteSectionSubmitted
);
export const getSectionAuthorizationErrors = createSelector(
    getDCFState,
    (state: IDCFState) => state.stepsErrors.authorizationSectionErrors
);
export const getSectionAuthorizationShowErrors = createSelector(
    getDCFState,
    (state: IDCFState) =>
        (anyErrors(state.stepsErrors.authorizationSectionErrors) &&
            state.hasBeenSubmitted.authorizationSectionSubmitted) ||
        anyErrors(state.stepsErrors.sampleSectionErrors)
);
export const getSectionNotificationErrors = createSelector(
    getDCFState,
    (state: IDCFState) => state.stepsErrors.notificationSectionErrors
);
export const getSectionNotificationShowErrors = createSelector(
    getDCFState,
    (state: IDCFState) =>
        anyErrors(state.stepsErrors.notificationSectionErrors) && state.hasBeenSubmitted.notificationSectionSubmitted
);
export const getSectionProceduralShowErrors = createSelector(
    getDCFState,
    (state: IDCFState) =>
        anyErrors(state.stepsErrors.proceduralSectionErrors) && state.hasBeenSubmitted.proceduralSectionSubmitted
);
export const getSectionSampleShowErrors = createSelector(
    getDCFState,
    getAutoCompletesState,
    (dcfState: IDCFState, autoCompletesState: IAutoCompletesState) =>
        !autoCompletesState.loading
            ? anyErrors(dcfState.stepsErrors.sampleSectionErrors) && dcfState.hasBeenSubmitted.sampleSectionSubmitted
            : false
);

export const getSubmitCurrentStep = createSelector(getDCFState, (state: IDCFState) => state.submitCurrentStep);
export const getTO = createSelector(getDCFState, (state: IDCFState) => state.to);
export const getTestingOrderHasChanged = createSelector(
    getDCFState,
    (state: IDCFState) => state.testingOrderHasChanged
);
export const getTimeSlots = createSelector(getDCFState, (state: IDCFState) => state.timeSlots);
export const getUrineSampleBoundaries = createSelector(getDCFState, (state: IDCFState) => state.urineSampleBoundaries);
export const isBoundToTO = createSelector(getDCFState, (state: IDCFState) =>
    Boolean(state.originalDcf.authorization?.testingOrderNumber)
);
export const isEditMode = createSelector(getDCFState, (state: IDCFState) => state.mode === DCFMode.Edit);
export const saveAsDraftDCF = createSelector(
    getDCFState,
    (state: IDCFState) =>
        statusFromSpecificCode(state.currentDcf.status) === StatusEnum.Draft &&
        new StepsErrors(state.stepsErrors).hasMandatoryErrors()
);
export const showSampleMatchingResultConfirmedMessage = createSelector(
    getDCFState,
    (state: IDCFState) => state.showSampleMatchingResultConfirmedMessage
);
export const showSampleMatchingResultRejectedMessage = createSelector(
    getDCFState,
    (state: IDCFState) => state.showSampleMatchingResultRejectedMessage
);

/**
 * GET currentDCF
 */
export const getAthlete = createSelector(getCurrentDCF, (dcf: DCF) => dcf.athlete);
export const getAuthorization = createSelector(getCurrentDCF, (dcf: DCF) => dcf.authorization);
export const getCreationInfo = createSelector(getCurrentDCF, (dcf: DCF) => dcf.creationInfo);
export const getDCFId = createSelector(getCurrentDCF, (dcf: DCF | undefined) => dcf?.id || null);
export const getHasStatusChanged = createSelector(getCurrentDCF, (state: DCF) => state.hasStatusChangedSinceLastSave);
export const getNotification = createSelector(getCurrentDCF, (dcf: DCF) => dcf.notification);
export const getProceduralInformation = createSelector(getCurrentDCF, (dcf: DCF) => dcf.proceduralInformation);
export const getSampleInformation = createSelector(getCurrentDCF, (dcf: DCF) => dcf.sampleInformation);
export const getSectionAthleteFormValues = createSelector(getCurrentDCF, (dcf: DCF) => dcfToSectionAthlete(dcf));
export const getSectionAuthorizationFormValues = createSelector(getCurrentDCF, (dcf: DCF) =>
    dcfToSectionAuthorization(dcf)
);
export const getSectionNotificationFormValues = createSelector(getCurrentDCF, (dcf: DCF) =>
    dcfToSectionNotification(dcf)
);
export const getSectionProceduralFormValues = createSelector(getCurrentDCF, (dcf: DCF) => dcfToSectionProcedural(dcf));
export const getSectionSampleFormValues = createSelector(getCurrentDCF, (dcf: DCF) => dcfToSectionSample(dcf));
export const getTest = createSelector(getCurrentDCF, (dcf: DCF) => dcf.test);
export const getTestCompetitionName = createSelector(getCurrentDCF, (dcf: DCF) => dcf?.test?.competitionName || '');
export const getTestId = createSelector(getCurrentDCF, (dcf: DCF) => dcf?.test?.id || '');
export const getTestMajorEvent = createSelector(getCurrentDCF, (dcf: DCF) => dcf?.test?.majorEvent || null);
export const getTestMajorEventId = createSelector(getCurrentDCF, (dcf: DCF) => dcf?.test?.majorEvent?.id || '');
export const getTestType = createSelector(getCurrentDCF, (dcf: DCF) => dcf?.sampleInformation?.testType || false);
export const getUpdateInfo = createSelector(getCurrentDCF, (dcf: DCF) => dcf.updateInfo);

/**
 * GET nonDCFFields
 */
export const getEmailNotProvided = createSelector(getNonDCFField, (nonDCF: NonDCFField) => nonDCF.emailNotProvided);
export const getGenericActivities = createSelector(
    getNonDCFField,
    (nonDCFFields: NonDCFField) => nonDCFFields.genericActivities
);
export const getHasEmailAddress = createSelector(getNonDCFField, (nonDCF: NonDCFField) => nonDCF.athleteHasEmail);
export const getSourceAthlete = createSelector(getNonDCFField, (nonDCFField: NonDCFField) => nonDCFField.athlete);
export const getSourceTest = createSelector(getNonDCFField, (nonDCFField: NonDCFField) => nonDCFField.test);
export const getTempLoggerStatus = createSelector(
    getNonDCFField,
    (nonDCFField: NonDCFField) => nonDCFField.tempLoggerStatus
);

/**
 * GET TO
 */
export const getTOId = createSelector(getTO, (to: TOItem | undefined) => to?.id || '');

/**
 * GET athlete
 */
export const getAthleteAddress = createSelector(
    getAthlete,
    (athlete: AthleteInformation | null) => athlete?.address || null
);
export const getAthleteId = createSelector(
    getAthlete,
    (athlete: AthleteInformation | null) => athlete?.id?.toString() || null
);
export const getAthleteIsNewPhone = createSelector(
    getAthlete,
    (athlete: AthleteInformation | null) => athlete?.phone?.isNewPhone || null
);

/**
 * GET authorization
 */
export const getSampleCollectionAuthority = createSelector(
    getAuthorization,
    (auth: AuthorizationInformation | null) => auth?.sampleCollectionAuthority || null
);
export const getTestingOrderId = createSelector(
    getAuthorization,
    (authorization: AuthorizationInformation | null) => authorization?.testingOrderId || ''
);
export const getTestingOrderNumber = createSelector(
    getAuthorization,
    (auth: AuthorizationInformation | null) => auth?.testingOrderNumber || ''
);

/**
 * GET sourceAthlete
 */
export const getAthleteAccessible = createSelector(
    getSourceAthlete,
    (athlete: AthleteInformation) => athlete?.accessible || false
);
export const getAthleteFirstName = createSelector(
    getSourceAthlete,
    (athlete: AthleteInformation) => athlete?.firstName || undefined
);
export const getAthleteFullName = createSelector(
    getSourceAthlete,
    (athlete: AthleteInformation) => athlete?.getAthleteFullName() || undefined
);
export const getAthleteGender = createSelector(
    getSourceAthlete,
    (athlete: AthleteInformation) => athlete?.sex || undefined
);
export const getAthleteLastName = createSelector(
    getSourceAthlete,
    (athlete: AthleteInformation) => athlete?.lastName || undefined
);
export const getAthletePhoneNumbers = createSelector(
    getSourceAthlete,
    (athlete: AthleteInformation) => athlete?.phoneNumbers || []
);
export const getDefaultAthletePhone = createSelector(
    getAthletePhoneNumbers,
    (phones: Array<Phone>) => phones.find((phone) => phone.isPrimaryPhone) || phones[0]
);
export const getDefaultAthletePhoneCountry = createSelector(
    getDefaultAthletePhone,
    (defaultPhone: Phone) => defaultPhone?.country || undefined
);

/**
 * GET sampleInformation
 */
export const getArrivalDate = createSelector(
    getSampleInformation,
    (sampleInfo: SampleInformation | null) => (sampleInfo && sampleInfo.arrivalDate) || undefined
);
export const getCompetitionName = createSelector(
    getSampleInformation,
    (sampleInfo: SampleInformation | null) => sampleInfo?.competitionName || ''
);
export const getMajorEvent = createSelector(
    getSampleInformation,
    (sampleInfo: SampleInformation | null) => sampleInfo?.majorEvent || null
);
export const getSampleFromUrl = createSelector(
    getSampleInformation,
    fromRootStore.getActiveRoute,
    (sampleInfo: SampleInformation | null, route: fromRootStore.RouterStateUrl) =>
        sampleInfo?.samples.find((sample) => sample.id != null && +sample.id === +route.params.sampleId) || undefined
);
export const getSamples = createSelector(
    getSampleInformation,
    (sampleInfo: SampleInformation | null) => sampleInfo?.samples || []
);
export const matchingResultType1Ids = createSelector(getSampleInformation, (sampleInfo: SampleInformation | null) =>
    (sampleInfo?.samples || [])
        .filter(
            (s) =>
                (s || []).results.filter(
                    (r) => r.matchingResultStatus?.specificCode === SpecificCode.AutomaticMatchType1
                ).length > 0
        )
        .map((s) => s.id?.toString() || '')
);
export const matchingResultType2or1Ids = createSelector(getSampleInformation, (sampleInfo: SampleInformation | null) =>
    (sampleInfo?.samples || [])
        .filter(
            (s) =>
                s?.results.filter(
                    (r) =>
                        r.matchingResultStatus?.specificCode === SpecificCode.AutomaticMatchType1 ||
                        r.matchingResultStatus?.specificCode === SpecificCode.AutomaticMatchType2
                ).length > 0
        )
        .map((s) => s.id?.toString() || '')
);
export const matchingResultType3or2or1Ids = createSelector(
    getSampleInformation,
    (sampleInfo: SampleInformation | null) =>
        (sampleInfo?.samples || [])
            .filter(
                (s) =>
                    s?.results.filter(
                        (r) =>
                            r.matchingResultStatus?.specificCode === SpecificCode.AutomaticMatchType1 ||
                            r.matchingResultStatus?.specificCode === SpecificCode.AutomaticMatchType2 ||
                            r.matchingResultStatus?.specificCode === SpecificCode.AutomaticMatchType3
                    ).length > 0
            )
            .map((s) => s.id?.toString() || '')
);

/**
 * Else
 */
export const getEndOfProcedureDate = createSelector(
    getProceduralInformation,
    (proceduralInformation: ProceduralInformation | null) => proceduralInformation?.endOfProcedureDate || null
);
export const getMatchingResultFromUrl = createSelector(
    getSampleFromUrl,
    fromRootStore.getActiveRoute,
    (sample: Sample | null | undefined, route: fromRootStore.RouterStateUrl) =>
        sample && sample.results.find((result: Result) => +result.id === +route.params.matchingResultId)
);
export const getMatchingResultStatusFromUrl = createSelector(
    getMatchingResultFromUrl,
    (matchingResult: Result | null | undefined) => matchingResult && matchingResult.matchingResultStatus
);
export const getLabResultId = createSelector(
    getMatchingResultFromUrl,
    (matchingResult: Result | null | undefined) => matchingResult && matchingResult.labResultId
);
export const getNotificationDate = createSelector(
    getNotification,
    (notification: NotificationInformation | null) => notification?.notificationDate || null
);
export const getSourceTestAthlete = createSelector(getSourceTest, (test: Test) => test.athlete);
export const getSourceTestAthleteId = createSelector(
    getSourceTestAthlete,
    (athlete: AthleteInformation | null) => athlete?.id || null
);
export const getSampleCollectionAuthorityId = createSelector(
    getSampleCollectionAuthority,
    (item: ListItem | null) => item?.id?.toString() || null
);
export const getUnmatchedLabReults = createSelector(getSamples, (samples) =>
    [].concat(...samples.map((s: any) => s.results))
);
export const hasSampleValidationError = createSelector(
    getConflictException,
    (conflictException: ConflictException | null) => conflictException?.hasSampleCodeValidationError() || false
);
export const isMatchingResultType1 = createSelector(matchingResultType1Ids, (ids: Array<string>) =>
    Boolean(ids.length > 0)
);
export const isMatchingResultType2or1 = createSelector(matchingResultType2or1Ids, (ids: Array<string>) =>
    Boolean(ids.length > 0)
);
export const isMatchingResultType3or2or1 = createSelector(matchingResultType3or2or1Ids, (ids: Array<string>) =>
    Boolean(ids.length > 0)
);

/**
 * Mixte
 */
export const getGlobalError = createSelector(
    getError,
    getSaveError,
    (saveError: boolean, dcfError: boolean) => saveError || dcfError
);
export const getGlobalLoading = createSelector(
    getSaving,
    getSubmitCurrentStep,
    (saving: boolean, submitCurrentStep: boolean) => saving || submitCurrentStep
);
export const getLoadingStep1 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingDCFStep1();
    }
);
export const getLoadingStep2 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingDCFStep2();
    }
);
export const getLoadingStep3 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingDCFStep3();
    }
);
export const getRequestActive = createSelector(
    getSubmitCurrentStep,
    getLoadingPage,
    getSaveError,
    getSaving,
    (submitStep: boolean, loading: boolean, error: boolean, savingDCF: boolean) =>
        loading || submitStep || error || savingDCF
);
export const getDisableSaving = createSelector(
    hasSampleValidationError,
    getDCFState,
    getIsCurrentStepValid,
    (sampleError: boolean, state: IDCFState, isCurrentStepValid: boolean) =>
        sampleError || state.hasABPErrors || !isCurrentStepValid
);
export const getSampleToLabResultMismatches = createSelector(
    getLabResult,
    getSampleFromUrl,
    getCurrentDCF,
    getAthleteGender,
    (labResult, sample, dcf, athleteGender) => {
        let fieldsMismatches: Array<string> = [];

        if (labResult && sample) {
            fieldsMismatches = fieldsMismatches.concat(compareSampleFields(labResult, sample));
            fieldsMismatches = fieldsMismatches.concat(compareSampleInformationFields(labResult, dcf));
            fieldsMismatches = fieldsMismatches.concat(compareAthleteFields(labResult, dcf, athleteGender));
            fieldsMismatches = fieldsMismatches.concat(compareNotificationFields(labResult, dcf));
            fieldsMismatches = fieldsMismatches.concat(compareAuthorizationFields(labResult, dcf));
        }

        return fieldsMismatches;
    }
);
export const getTestingOrders = createSelector(
    getDCFState,
    getNonDCFField,
    (state: IDCFState, nonDCFFields: NonDCFField) => athleteToTOItem(state.tos, nonDCFFields.athlete)
);
export const getTimezoneFields = createSelector(
    getSampleInformation,
    getSamples,
    getProceduralInformation,
    (sampleInformation, samples, proceduralInformation) => {
        return overwriteTimezoneFields(sampleInformation, samples, proceduralInformation);
    }
);
