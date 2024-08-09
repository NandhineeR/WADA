import { createSelector } from '@ngrx/store';
import * as fromFeature from '@tdpm/store/reducers';
import { TDPMRow, TDPMSheetInfo, TDPMSubRow } from '@tdpm/models';
import { ITDPMTableState } from '@tdpm/store/states/tdpm.state';

export const getTDPMTableState = createSelector(
    fromFeature.getTDPMState,
    (state: fromFeature.ITDPMState) => state.tdpmTable
);

export const getTDPMSheetInfo = createSelector(getTDPMTableState, (state: ITDPMTableState) => {
    return filterTDPMSheetInfo(state.tdpmSheetInfo, state.search);
});

export const getLoading = createSelector(getTDPMTableState, (state: ITDPMTableState) => state.loading);

export const getError = createSelector(getTDPMTableState, (state: ITDPMTableState) => state.getError);

function filterTDPMSheetInfo(tdpmSheetInfo: TDPMSheetInfo, tableFilters: string): TDPMSheetInfo {
    const tdpmSheetInfoUpdated: TDPMSheetInfo = tdpmSheetInfo.clone();

    tdpmSheetInfoUpdated.rows.forEach((row: TDPMRow) => {
        row.subRows = row.subRows.filter((subRow: TDPMSubRow) => {
            return (
                subRow.disciplineName.toLocaleLowerCase().includes(tableFilters.toLocaleLowerCase()) ||
                row.sportName.toLocaleLowerCase().includes(tableFilters.toLocaleLowerCase())
            );
        });
    });
    tdpmSheetInfoUpdated.rows = tdpmSheetInfoUpdated.rows.filter((row: TDPMRow) => row.subRows.length > 0);
    tdpmSheetInfoUpdated.updateTotals();

    return tdpmSheetInfoUpdated;
}
