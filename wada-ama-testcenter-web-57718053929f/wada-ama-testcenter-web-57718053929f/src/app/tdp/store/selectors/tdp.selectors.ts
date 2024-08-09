import { createSelector } from '@ngrx/store';
import { PeriodType } from '@tdp/models';
import * as fromRoot from '@core/store';
import * as fromFeature from '@tdp/store/reducers';
import { ITDPTableState } from '@tdp/store/states/tdp-table.state';

export const getTDPTableState = createSelector(
    fromFeature.getTDPState,
    (state: fromFeature.ITDPState) => state.tdpTable
);

export const getTDPSheet = createSelector(getTDPTableState, (state: ITDPTableState) => state.tdpSheet);

export const getTDPSheetUser = createSelector(
    getTDPTableState,
    (state: ITDPTableState) => state.tdpSheet.concurrentUsers
);

export const getTDPFrequencyFilter = createSelector(getTDPTableState, (state: ITDPTableState) => state.frequencyFilter);

export const getTDPYear = createSelector(
    fromRoot.getActiveRoute,
    (state: fromRoot.RouterStateUrl) => state.params.year || new Date().getFullYear()
);

export const getLoading = createSelector(getTDPTableState, (state: ITDPTableState) => state.loading);

export const getGetError = createSelector(getTDPTableState, (state: ITDPTableState) => state.getError);

export const getSaveError = createSelector(getTDPTableState, (state: ITDPTableState) => state.saveError);

export const getDeleteException = createSelector(getTDPTableState, (state: ITDPTableState) => state.deleteException);

export const getSaving = createSelector(getTDPTableState, (state: ITDPTableState) => state.saving);

export const getHighlightedSportDiscipline = createSelector(
    getTDPTableState,
    (state: ITDPTableState) => state.highlightedSportDiscipline
);

export const getCurrentTDPSheetInfo = createSelector(getTDPTableState, (state: ITDPTableState) => {
    switch (state.frequencyFilter.frequency) {
        case PeriodType.Quarterly:
            return state.tdpSheet.quarterly[state.frequencyFilter.quarter];
        case PeriodType.Monthly:
            return state.tdpSheet.monthly[state.frequencyFilter.month];
        case PeriodType.Yearly: // same as default
        default:
            return state.tdpSheet.yearly[0];
    }
});

export const getRequestedYear = createSelector(getTDPTableState, (state: ITDPTableState) => state.requestedYear);

export const hasDirtyCells = createSelector(getTDPTableState, (state: ITDPTableState) => state.dirtyCells.length > 0);
