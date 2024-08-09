import { createSelector } from '@ngrx/store';
import { DCF } from '@dcf/models';
import { ConflictException } from '@core/models';
import { mapDCFToDCFForm } from '@dcf/mappers';
import { getMultipleDCFState } from '@dcf/store/reducers';
import { IMultipleDCFState } from '@dcf/store/states/multiple-dcf.state';
import { IAutoCompletesState } from '@autocompletes/store/states/autocompletes.state';
import { getAutoCompletesState } from '@autocompletes/store/reducers';

export const getMultipleDCFAllDCFs = createSelector(getMultipleDCFState, (state: IMultipleDCFState) => state.dcfs);
export const getMultipleDCFAutocompletesError = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.autoCompletesError
);
export const getMultipleDCFConflictException = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.conflictException
);
export const getMultipleDCFError = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.error || false
);
export const getMultipleDCFErrorMessageKey = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.errorMessageKey
);
export const getMultipleDCFFieldsSecurity = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.fieldsSecurity
);
export const getMultipleDCFForm = createSelector(getMultipleDCFState, (state: IMultipleDCFState) =>
    state.dcfs.map((dcf: DCF) => mapDCFToDCFForm(dcf, state.fieldsSecurity))
);
export const getMultipleDCFFormView = createSelector(getMultipleDCFState, (state: IMultipleDCFState) =>
    state.dcfs.map((dcf: DCF) => mapDCFToDCFForm(dcf, state.fieldsSecurity, true))
);
export const getMultipleDCFGlobalTestingOrderId = createSelector(getMultipleDCFState, (state: IMultipleDCFState) => {
    let id = '';
    if (state && state.dcfs[0] && state.dcfs[0].test && state.dcfs[0].test.toId) {
        id = state.dcfs[0].test.toId;
    }
    return id;
});
export const getMultipleDCFLoading = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.loading || false
);
export const getMultipleDCFSCAId = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.scaId?.toString() || ''
);
export const getMultipleDCFSaveError = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.saveError || false
);
export const getMultipleDCFSavedDCF = createSelector(getMultipleDCFState, (state: IMultipleDCFState) => state.savedDCF);
export const getMultipleDCFTestsError = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.testsError
);
export const getMultipleDCFTestsLoading = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.testsLoading
);
export const getMultipleDCFUrineSampleBoundaries = createSelector(
    getMultipleDCFState,
    (state: IMultipleDCFState) => state.urineSampleBoundaries
);

/**
 * getMultipleDCFAllDCFs
 */
export const getMultipleAthleteIds = createSelector(getMultipleDCFAllDCFs, (dcfs: Array<DCF>) => {
    return dcfs.map((dcf: DCF) => dcf.athlete?.id || null).filter((id: number | null) => id !== null) as Array<number>;
});
export const getMultipleDCFAllDCFIds = createSelector(getMultipleDCFAllDCFs, (dcfs: Array<DCF>) => {
    return dcfs.map((dcf: DCF) => dcf.id);
});
export const getMultipleDCFIsEditMode = createSelector(getMultipleDCFAllDCFs, (dcfs: Array<DCF>) => {
    const editDCFs = (dcfs || []).filter((dcf: DCF) => dcf.id !== null);
    return editDCFs.length > 0;
});
export const getMultipleDCFTestingOrderId = createSelector(getMultipleDCFAllDCFs, (dcfs: Array<DCF>) => {
    if (dcfs && dcfs.length > 0) {
        return dcfs[0].authorization && dcfs[0].authorization.testingOrderId;
    }
    return null;
});

/**
 * getMultipleDCFConflictException
 */
export const getMultipleDCFHasSampleCodeError = createSelector(
    getMultipleDCFConflictException,
    (conflictException: ConflictException | null) => conflictException?.hasSampleCodeValidationError() || false
);
export const getMultipleDCFSampleDuplicateException = createSelector(
    getMultipleDCFConflictException,
    (conflictException: ConflictException | null) => conflictException?.conflict?.conflictParameters || null
);

/**
 * Mixte
 */
export const getMultipleDCFGlobalError = createSelector(
    getMultipleDCFError,
    getMultipleDCFTestsError,
    getMultipleDCFAutocompletesError,
    (error, testError, autocompleteError) => error || testError || autocompleteError
);
export const getMultipleDCFGlobalLoading = createSelector(
    getAutoCompletesState,
    getMultipleDCFTestsLoading,
    getMultipleDCFLoading,
    (autoCompletesState: IAutoCompletesState, testLoading, loading: boolean) =>
        autoCompletesState.loading || testLoading || loading
);
export const getMultipleDCFIsAllDCFsSaved = createSelector(
    getMultipleDCFAllDCFs,
    getMultipleDCFSavedDCF,
    (dcfs: Array<DCF>, savedSet: Set<number | null>) => {
        return dcfs.length === savedSet.size;
    }
);
