import { Action, createReducer, on } from '@ngrx/store';
import * as fromTDSSATable from '@tdssa/store/actions/tdssa-table.actions';
import { MLA } from '@tdssa/models';
import { initialTdssaState, ITDSSATableState } from '@tdssa/store/states/tdssa-table.state';

export const TdssaTableReducer = createReducer(
    initialTdssaState,
    on(fromTDSSATable.GetTDSSATable, (state) => ({
        ...state,
        loading: true,
        error: false,
    })),
    on(fromTDSSATable.GetTDSSATableSuccess, (state, action) => {
        const tdssaSheet = action.sheet;
        const mlaArray = new Array<MLA>(tdssaSheet.totals.analyses.length);
        mlaArray.fill(MLA.All);
        return {
            ...state,
            loading: false,
            error: false,
            tdssaSheet,
            tableFilters: {
                ...state.tableFilters,
                mlaMonitoringArray: mlaArray,
            },
        };
    }),
    on(fromTDSSATable.GetTDSSATableError, (state) => ({
        ...state,
        loading: false,
        error: true,
    })),
    on(fromTDSSATable.SearchBarFilterTDSSATable, (state, action) => ({
        ...state,
        tableFilters: {
            ...state.tableFilters,
            search: action.query,
        },
    })),
    on(fromTDSSATable.MlaMonitoringFilterTDSSATable, (state, action) => ({
        ...state,
        tableFilters: {
            ...state.tableFilters,
            mlaMonitoringArray: [
                ...state.tableFilters.mlaMonitoringArray.slice(0, action.mla.index),
                action.mla.value,
                ...state.tableFilters.mlaMonitoringArray.slice(action.mla.index + 1),
            ],
        },
    }))
);

export function reducer(state: ITDSSATableState | undefined, action: Action) {
    return TdssaTableReducer(state, action);
}
