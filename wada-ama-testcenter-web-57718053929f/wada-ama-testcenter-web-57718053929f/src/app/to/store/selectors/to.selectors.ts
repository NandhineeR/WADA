import * as fromRootStore from '@core/store';
import { RouterStateUrl } from '@core/store/states/router.state';
import { createSelector } from '@ngrx/store';
import { AttachmentType, Attachment, ListItem, StatusEnum } from '@shared/models';
import { anyErrors } from '@shared/utils/form-util';
import { endpointDateFormat, isNullOrBlank } from '@shared/utils/string-utils';
import { statusFromSpecificCode } from '@to/mappers';
import { Test, TestingOrder } from '@to/models';
import { cloneDeep, find, uniqBy } from 'lodash-es';
import * as fromFeature from '@to/store/reducers';
import { IViewTOState } from '@to/store/states/to.state';
import * as moment from 'moment';
import { getAutoCompletesState } from '@autocompletes/store/reducers';
import { IAutoCompletesState } from '@autocompletes/store/states/autocompletes.state';
import { isStepValid } from '@to/utils/step.utils';
import {
    mapTOtoAthleteAndAnalyses,
    mapTOtoAuthorization,
    mapTOtoDopingControlPersonnel,
    mapTOtoTestRows,
} from '../mapper/selector.mapper';

export const getStep1ShowErrors = createSelector(
    fromFeature.getTOState,
    (state: fromFeature.ITOState) =>
        anyErrors(state.to.stepsErrors.authorizationSectionErrors) &&
        state.to.hasBeenSubmitted.authorizationSectionSubmitted
);
export const getViewTOState = createSelector(fromFeature.getTOState, (state: fromFeature.ITOState) => state.to);

/**
 * GET ViewTOState
 */
export const getActivitiesError = createSelector(
    getViewTOState,
    (state: IViewTOState) => state?.activitiesError || false
);
export const getAthleteGroups = createSelector(getViewTOState, (state: IViewTOState) => state.athleteGroups);
export const getAthletesError = createSelector(getViewTOState, (state: IViewTOState) => state.athletesError);
export const getAttachments = createSelector(getViewTOState, (state: IViewTOState) => state.attachments || []);
export const getCanBeSaved = createSelector(
    getViewTOState,
    fromRootStore.getActiveRoute,
    (state: IViewTOState, route: RouterStateUrl) => isStepValid(state, route.data.step as number)
);
export const getCancelledTests = createSelector(getViewTOState, (state: IViewTOState) => state.cancelledTests);
export const getClosedAnalysis = createSelector(getViewTOState, (state: IViewTOState) => state.closedAnalysis);
export const getClosedTests = createSelector(getViewTOState, (state: IViewTOState) => state.closedTests);
export const getConflictException = createSelector(getViewTOState, (state: IViewTOState) => state.conflictException);
export const getDcoAttachement = createSelector(getViewTOState, (state: IViewTOState) => {
    return state.attachments.find((attachment: Attachment) => attachment.attachmentType === AttachmentType.DCO_REPORT);
});
// Gets Laboratory from selected Major Event in Step 1
export const getDefaultLaboratory = createSelector(
    getViewTOState,
    (state: IViewTOState) => state.majorEvent && state.majorEvent.laboratory
);
export const getError = createSelector(getViewTOState, (state: IViewTOState | null) => state?.error || null);
export const getErrorMessageKey = createSelector(getViewTOState, (state: IViewTOState) => state.errorMessageKey);
export const getFieldsSecurity = createSelector(getViewTOState, (state: IViewTOState) => state.fieldsSecurity);
export const getGenericActivities = createSelector(getViewTOState, (state: IViewTOState) => state.genericActivities);
export const getGlobalError = createSelector(getViewTOState, (state: IViewTOState) => state.error);
export const getHasBeenCancelled = createSelector(
    getViewTOState,
    (state: IViewTOState) =>
        state.hasBeenCancelled && statusFromSpecificCode(state.to.testingOrderStatus) === StatusEnum.Cancelled
);
export const getHasBeenCompleted = createSelector(getViewTOState, (state: IViewTOState) => state.hasBeenCompleted);
export const getHasBeenDeleted = createSelector(getViewTOState, (state: IViewTOState) => state.hasBeenDeleted || false);
export const getHasBeenIssued = createSelector(getViewTOState, (state: IViewTOState) => state.hasBeenIssued);
export const getHasBeenSaved = createSelector(getViewTOState, (state: IViewTOState) => state.hasBeenSaved);
// Loops thorough tests in a TO to find the first occurrence of a test with a status equals to Closed Sample Not Collected
export const getHasClosedStatus = createSelector(getViewTOState, (state: IViewTOState) => {
    const firstTest = find(state.to.tests, (test: Test) => test.isStatusClosed());
    return firstTest !== undefined;
});
// Loops thorough tests in a TO to find the first occurrence of a test with a dcf
export const getHasDCF = createSelector(getViewTOState, (state: IViewTOState) => {
    const firstTest = find(state.to.tests, (test: Test) => !isNullOrBlank(test.dcfId));
    return firstTest !== undefined;
});
// Loops thorough tests in a TO to find the first occurrence of a test with an Unsuccessful Attempt
export const getHasUA = createSelector(getViewTOState, (state: IViewTOState) => {
    const firstTest = find(state.to.tests, (test: Test) => test.unsuccessfulAttemptSummaries.length > 0);
    return firstTest !== undefined;
});
export const getIncompatibleTestParticipants = createSelector(
    getViewTOState,
    (state: IViewTOState) => state.incompatibleTestParticipants
);
export const getIsCurrentStepValid = createSelector(
    getViewTOState,
    fromRootStore.getActiveRoute,
    (state: IViewTOState, route: RouterStateUrl) => isStepValid(state, route.data.step as number)
);
export const getIsDraft = createSelector(getViewTOState, (state: IViewTOState) => {
    return (
        statusFromSpecificCode(state.to.testingOrderStatus) === StatusEnum.Draft ||
        statusFromSpecificCode(state.to.testingOrderStatus) === StatusEnum.InCreation
    );
});
export const getIsIssued = createSelector(getViewTOState, (state: IViewTOState) => {
    return statusFromSpecificCode(state.to.testingOrderStatus) === StatusEnum.Issued;
});
export const getIsLoadingAthletes = createSelector(getViewTOState, (state: IViewTOState) => state.loadingAthletes);
export const getLoading = createSelector(getViewTOState, (state: IViewTOState) => state.loading || false);
export const getLoadingTestingOrders = createSelector(
    getViewTOState,
    (state: IViewTOState) => state.loadingTestingOrders
);
export const getMajorEvent = createSelector(getViewTOState, (state: IViewTOState) => state.majorEvent);
export const getMajorEvents = createSelector(getViewTOState, (state: IViewTOState) => state.majorEvents);
export const getMode = createSelector(getViewTOState, (toState: IViewTOState) => toState.mode);
export const getSaveError = createSelector(getViewTOState, (state: IViewTOState) => state.saveError);
export const getSaving = createSelector(getViewTOState, (state: IViewTOState) => state.saving);
export const getSearchedAthleteResult = createSelector(
    getViewTOState,
    (state: IViewTOState) => state.searchAthleteResult
);
export const getSubmitCurrentStep = createSelector(getViewTOState, (state: IViewTOState) => state.submitCurrentStep);
export const getTO = createSelector(getViewTOState, (state: IViewTOState) => state.to);
export const getTemporaryTests = createSelector(getViewTOState, (state: IViewTOState) =>
    mapTOtoTestRows(state.tempTests)
);
export const getTestStatuses = createSelector(getViewTOState, (state: IViewTOState) => state.testStatuses);
export const getStatusUpdateError = createSelector(getViewTOState, (state: IViewTOState) => state.statusUpdateError);
export const getTestingOrderItems = createSelector(getViewTOState, (state: IViewTOState) => state.testingOrders);
export const getTestingOrderRows = createSelector(getViewTOState, (state: IViewTOState) => state.testingOrderRows);
export const getTestsHaveBeenMoved = createSelector(
    getViewTOState,
    (state: IViewTOState) => state.testsHaveBeenMoved || false
);
export const getUnprocessableEntityError = createSelector(
    getViewTOState,
    (state: IViewTOState | null) => state?.unprocessableEntityError || null
);

/**
 * GET TO
 */
export const getTOAllAnalyses = createSelector(getTO, (to: TestingOrder | null) =>
    (to?.tests || []).reduce((acc: any, t) => acc.concat(t?.analyses || []), [])
);
export const getTOAthleteAndAnalyses = createSelector(getTO, (to: TestingOrder | null) =>
    cloneDeep(mapTOtoAthleteAndAnalyses(to))
);
export const getTOAuthorization = createSelector(getTO, (to: TestingOrder | null) => mapTOtoAuthorization(to));
export const getTOBehalfOfSCA = createSelector(getTO, (to: TestingOrder | undefined) => to?.behalfOfSCA || null);
export const getTOCopiedTestingOrderNumber = createSelector(getTO, (to: TestingOrder | undefined) =>
    to ? to.copiedTestingOrderNumber : null
);
export const getTOCreationInfo = createSelector(getTO, (to: TestingOrder | null) => to?.creationInfo || null);
export const getTOCreator = createSelector(getTO, (to: TestingOrder | undefined) => to?.owner || new ListItem());
export const getTODcpParticipants = createSelector(
    getTO,
    (to: TestingOrder | null) => to && cloneDeep(to.dcpParticipants)
);
export const getTODopingControlPersonnel = createSelector(getTO, (to: TestingOrder | null) =>
    mapTOtoDopingControlPersonnel(to)
);
export const getTOEndDate = createSelector(getTO, (to: TestingOrder | undefined) =>
    to && to.endDate ? moment(to.endDate).format(endpointDateFormat) : ''
);
export const getTOId = createSelector(getTO, (to: TestingOrder | null | undefined) => to?.id || null);
export const getTOInstructions = createSelector(getTO, (to: TestingOrder | null) => to && cloneDeep(to.instructions));
export const getTOLaboratoryNotes = createSelector(
    getTO,
    (to: TestingOrder | null) => to && cloneDeep(to.laboratoryNotes)
);
export const getTOMajorEventId = createSelector(getTO, (to: TestingOrder) => to.majorGameEvent?.id || '');
export const getTOSampleCollectionAuthority = createSelector(
    getTO,
    (to: TestingOrder | null) => to && to.sampleCollectionAuthority
);
export const getSampleCollectionAuthorityId = createSelector(
    getTO,
    (to: TestingOrder | null) => to && to.sampleCollectionAuthority && to.sampleCollectionAuthority.id
);
export const getTOSelectedTests = (tempIds: Array<string>) =>
    createSelector(getTO, (to: TestingOrder | null) => {
        const selectedState = to && to.tests.filter((test: Test) => tempIds.includes(test.tempId));
        return mapTOtoTestRows(selectedState);
    });
export const getTOStartDate = createSelector(getTO, (to: TestingOrder | undefined) =>
    to && to.startDate ? moment(to.startDate).format(endpointDateFormat) : ''
);
export const getTOStatus = createSelector(getTO, (to: TestingOrder) => statusFromSpecificCode(to.testingOrderStatus));
export const getTOStatusDescription = createSelector(
    getTO,
    (to: TestingOrder) => to.testingOrderStatus && to.testingOrderStatus.description
);
export const getTOTestParticipants = createSelector(
    getTO,
    (to: TestingOrder | null) => to && cloneDeep(to.testParticipants)
);
export const getTOTestRows = createSelector(getTO, (to: TestingOrder | null) => to && mapTOtoTestRows(to.tests));
export const getTOTestingAuthority = createSelector(getTO, (to: TestingOrder | null) => to && to.testingAuthority);
export const getTOTests = createSelector(getTO, (to: TestingOrder | undefined) => to?.tests || []);
export const getTOTestsCount = createSelector(getTO, (to: TestingOrder | undefined) => to?.tests.length || 0);
export const getTOTestsWithDCF = createSelector(getTO, (to: TestingOrder | null) => {
    const tests = to?.tests || [];
    const testsWithDCF = tests.filter((test: Test) => !isNullOrBlank(test.dcfId));
    return uniqBy(testsWithDCF, 'athlete.id');
});
export const getTOUpdateInfo = createSelector(getTO, (to: TestingOrder | null) => to?.updateInfo || null);

/**
 * Mixte
 */
export const getGlobalLoading = createSelector(getSaving, getLoading, (saving: boolean, loading: boolean) => {
    return saving || loading;
});
export const getLoadingStep1 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingTestingOrderStep1();
    }
);
export const getLoadingStep2 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingTestingOrderStep2();
    }
);
export const getLoadingStep3 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingTestingOrderStep3();
    }
);
export const getLoadingStep4 = createSelector(
    getGlobalLoading,
    getAutoCompletesState,
    (globalLoading: boolean, autoCompletesState: IAutoCompletesState) => {
        return globalLoading || autoCompletesState.loadingSteps.isLoadingTestingOrderStep4();
    }
);
export const shouldSavingBeDisabled = createSelector(
    getViewTOState,
    getAutoCompletesState,
    (testingOrderstate: IViewTOState, autoCompletesState: IAutoCompletesState) =>
        testingOrderstate.disableSaving || autoCompletesState.loading
);
