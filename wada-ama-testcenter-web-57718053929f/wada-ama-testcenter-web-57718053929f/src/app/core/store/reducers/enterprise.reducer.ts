import { Action, createReducer, on } from '@ngrx/store';
import * as fromEnterpriseActions from '@core/store/actions/enterprise.actions';
import { initialEnterpriseState, IEnterpriseState } from '@core/store/states/enterprise.state';
import { convertDateToString } from '@shared/utils';

export const enterpriseReducer = createReducer(
    initialEnterpriseState,
    on(fromEnterpriseActions.GetDcfDataRetentionPeriodSuccess, (state, action) => ({
        ...state,
        dcfRetentionPeriod: action.dcfRetentionPeriod,
        loading: false,
    })),
    on(fromEnterpriseActions.GetDcfDecommissionStartDateError, (state) => ({
        ...state,
        isDCFDecommissioned: false,
        loading: false,
    })),
    on(fromEnterpriseActions.GetDcfDecommissionStartDateSuccess, (state, action) => ({
        ...state,
        isDCFDecommissioned: isDateBeforeOrEqualToday(action.dcfDecommissionStartDate),
        loading: false,
    })),
    on(fromEnterpriseActions.GetMaxMOResultsSuccess, (state, action) => ({
        ...state,
        maxMOResults: action.maxMOResults,
    })),
    on(fromEnterpriseActions.GetMaxNumberAdosError, (state) => ({
        ...state,
        maxNumberAdos: null,
        loading: false,
    })),
    on(fromEnterpriseActions.GetMaxNumberAdosSuccess, (state, action) => ({
        ...state,
        maxNumberAdos: action.maxNumberAdos,
        loading: false,
    })),
    on(fromEnterpriseActions.GetSampleCollectionDateInUtcStartDateError, (state) => ({
        ...state,
        isSampleTimezoneRequired: false,
        loading: false,
    })),
    on(fromEnterpriseActions.GetSampleCollectionDateInUtcStartDateSuccess, (state, action) => ({
        ...state,
        isSampleTimezoneRequired: isDateBeforeToday(action.sampleCollectionDateInUtcStartDate),
        loading: false,
    })),
    on(fromEnterpriseActions.GetToDecommissionStartDateError, (state) => ({
        ...state,
        isTODecommissioned: false,
        loading: false,
    })),
    on(fromEnterpriseActions.GetToDecommissionStartDateSuccess, (state, action) => ({
        ...state,
        isTODecommissioned: isDateBeforeOrEqualToday(action.toDecommissionStartDate),
        loading: false,
    }))
);

export function reducer(state: IEnterpriseState | undefined, action: Action): IEnterpriseState {
    return enterpriseReducer(state, action);
}

function isDateBeforeOrEqualToday(date: string | null) {
    return date !== null
        ? new Date(date || '').valueOf() <= new Date(convertDateToString(new Date())).valueOf()
        : false;
}

function isDateBeforeToday(date: string | null) {
    return date !== null ? new Date(date || '').valueOf() < new Date(convertDateToString(new Date())).valueOf() : false;
}
