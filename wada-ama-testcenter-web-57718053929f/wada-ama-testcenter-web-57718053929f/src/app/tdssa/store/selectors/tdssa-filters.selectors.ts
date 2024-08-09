import { createSelector } from '@ngrx/store';
import { ITDSSAState, getTDSSAState } from '@tdssa/store/reducers';
import { ITDSSAFiltersState } from '@tdssa/store/states/tdssa-filters.state';

export const getTDSSAFiltersState = createSelector(getTDSSAState, (state: ITDSSAState) => state.tdssaFilters);

export const getIsCollapsed = createSelector(getTDSSAFiltersState, (state: ITDSSAFiltersState) => state.isCollapsed);
