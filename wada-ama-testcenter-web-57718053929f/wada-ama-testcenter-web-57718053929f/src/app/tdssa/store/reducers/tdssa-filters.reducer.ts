import { Action, createReducer, on } from '@ngrx/store';
import * as fromTDSSAFilters from '@tdssa/store/actions/tdssa-filters.actions';
import { ITDSSAFiltersState, initialTdssaFiltersState } from '@tdssa/store/states/tdssa-filters.state';

export const TdssaFiltersReducer = createReducer(
    initialTdssaFiltersState,
    on(fromTDSSAFilters.ToggleTDSSAFilters, (state) => ({
        ...state,
        isCollapsed: !state.isCollapsed,
    }))
);

export function reducer(state: ITDSSAFiltersState | undefined, action: Action) {
    return TdssaFiltersReducer(state, action);
}
