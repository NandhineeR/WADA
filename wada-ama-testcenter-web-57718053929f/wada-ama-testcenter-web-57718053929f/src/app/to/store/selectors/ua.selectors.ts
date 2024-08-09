import { createSelector } from '@ngrx/store';
import { UA } from '@to/models';
import { isNullOrBlank } from '@shared/utils';
import * as fromFeature from '@to/store/reducers';
import { mapUAFormFromUA } from '@to/mappers';
import { IViewUAState } from '@to/store/states/ua.state';

export const getViewUAState = createSelector(fromFeature.getUAState, (state: fromFeature.IUAState) => state.ua);

export const getUAForm = createSelector(getViewUAState, (state: IViewUAState) => state.uas.map(mapUAFormFromUA));
export const getUAs = createSelector(getViewUAState, (state: IViewUAState) => state.uas);
export const getUASCAId = createSelector(getViewUAState, (state: IViewUAState) => state.scaId);

export const getAutocompleteLoading = createSelector(
    getViewUAState,
    (state: IViewUAState) => state.autoCompleteLoading
);
export const getAutocompleteError = createSelector(getViewUAState, (state: IViewUAState) => state.autocompleteError);
export const getTestsLoading = createSelector(getViewUAState, (state: IViewUAState) => state.testsLoading);
export const getUALoading = createSelector(getViewUAState, (state: IViewUAState) => state.loading || false);
export const getUAError = createSelector(getViewUAState, (state: IViewUAState) => state.error || false);
export const getTestsError = createSelector(getViewUAState, (state: IViewUAState) => state.testsError);

export const getUAErrorMessageKey = createSelector(getViewUAState, (state: IViewUAState) => state.errorMessageKey);

export const getUAHasBeenDeleted = createSelector(
    getViewUAState,
    (state: IViewUAState) => state.hasBeenDeleted || false
);

export const getUAGlobalError = createSelector(
    getUAError,
    getTestsError,
    getAutocompleteError,
    (error: boolean, testError: boolean, autocompleteError: boolean) => error || testError || autocompleteError
);
export const getUAGlobalLoading = createSelector(
    getAutocompleteLoading,
    getTestsLoading,
    getUALoading,
    (autoCompleteLoading: boolean, testLoading: boolean, loading: boolean) =>
        autoCompleteLoading || testLoading || loading
);

export const getUAIds = createSelector(getUAs, (uas: Array<UA>) => {
    return uas.filter((ua) => Boolean(ua.id)).map((ua: UA) => ua.id);
});

export const getResultManagementAuthorities = createSelector(
    getViewUAState,
    (state: IViewUAState) => state.autocompletes?.resultManagementAuthorities || null
);

export const getDopingControlOfficers = createSelector(
    getViewUAState,
    (state: IViewUAState) => state.autocompletes?.dopingControlOfficers || null
);

export const getCountries = createSelector(
    getViewUAState,
    (state: IViewUAState) => state.autocompletes?.countries || null
);

export const getAttemptMethods = createSelector(
    getViewUAState,
    (state: IViewUAState) => state.autocompletes?.attemptMethods || null
);

export const getIsEditMode = createSelector(getUAs, (uas: Array<UA>) => {
    const editUAs = (uas || []).filter((ua: UA) => !isNullOrBlank(ua.id));
    return editUAs.length > 0;
});

export const getSavedUASet = createSelector(getViewUAState, (state: IViewUAState) => state.savedUA);

export const getUATOId = createSelector(getViewUAState, (state: IViewUAState) => state.toId);

export const getIsEveryUASaved = createSelector(getUAs, getSavedUASet, (uas: Array<UA>, savedSet: Set<string>) => {
    return uas.length === savedSet.size;
});

export const getTOIdOrigin = createSelector(getUAs, (uas: Array<UA>) => {
    let id: string | null = null;
    if (uas && uas.length > 0) {
        if (uas[0].test) {
            id = uas[0].test.toId;
        }
    }
    return id;
});

export const getFieldsSecurityByUAId = createSelector(getViewUAState, (state: IViewUAState) => state.fieldsSecurity);
