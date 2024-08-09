import { createSelector } from '@ngrx/store';
import * as fromFeature from '@tdpm/store/reducers';
import { ITDPMFiltersState } from '@tdpm/store/states/tdpmFilter.state';

type ITDPMState = fromFeature.ITDPMState;

export const getTDPMFilterState = createSelector(fromFeature.getTDPMState, (state: ITDPMState) => state.filters);

export const getIsCollapsed = createSelector(getTDPMFilterState, (state: ITDPMFiltersState) => state.isCollapsed);

export const getShowTestType = createSelector(getTDPMFilterState, (state: ITDPMFiltersState) => state.showTestType);

export const getDateRange = createSelector(getTDPMFilterState, (state: ITDPMFiltersState) => state.dateRange);
