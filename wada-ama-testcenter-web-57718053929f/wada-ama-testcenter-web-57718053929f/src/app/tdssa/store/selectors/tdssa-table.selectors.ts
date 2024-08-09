import { createSelector } from '@ngrx/store';
import * as fromFeature from '@tdssa/store/reducers';
import { ITDSSATableState, TableFilters } from '@tdssa/store/states/tdssa-table.state';

export const getTDSSATableState = createSelector(
    fromFeature.getTDSSAState,
    (state: fromFeature.ITDSSAState) => state.tdssaTable
);

export const getTDSSASheet = createSelector(getTDSSATableState, (state: ITDSSATableState) => state.tdssaSheet);

export const getTableFilters = createSelector(getTDSSATableState, (state: ITDSSATableState) => state.tableFilters);

export const getMLAMonitoringArrayFilters = createSelector(
    getTableFilters,
    (state: TableFilters) => state.mlaMonitoringArray
);

export const getLoading = createSelector(getTDSSATableState, (state: ITDSSATableState) => state.loading);

export const getError = createSelector(getTDSSATableState, (state: ITDSSATableState) => state.error);
