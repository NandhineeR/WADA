import { Action, createReducer, on } from '@ngrx/store';
import * as fromTDPMFilters from '@tdpm/store/actions/tdpm-filters.actions';
import { initialTdpmFilterState, ITDPMFiltersState } from '@tdpm/store/states/tdpmFilter.state';

export const TdpmFilterReducer = createReducer(
    initialTdpmFilterState,
    on(fromTDPMFilters.toggleTDPMFilters, (state) => ({
        ...state,
        isCollapsed: !state.isCollapsed,
    })),
    on(fromTDPMFilters.setTDPMTablesShowType, (state, { showType }) => ({
        ...state,
        showTestType: showType,
    })),
    on(fromTDPMFilters.getTDPMTablesShowType, (state, { showType }) => ({
        ...state,
        showTestType: showType,
    })),
    on(fromTDPMFilters.setTDPMTablesDate, (state, { fromToDate }) => ({
        ...state,
        dateRange: fromToDate,
    }))
);

export function reducer(state: ITDPMFiltersState | undefined, action: Action) {
    return TdpmFilterReducer(state, action);
}
