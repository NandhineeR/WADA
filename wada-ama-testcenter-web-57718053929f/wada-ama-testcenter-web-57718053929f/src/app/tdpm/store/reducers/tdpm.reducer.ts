import { Action, createReducer, on } from '@ngrx/store';
import * as fromTDPMTable from '@tdpm/store/actions/tdpm.actions';
import { initialTdpmState, ITDPMTableState } from '@tdpm/store/states/tdpm.state';

export const TdpmReducer = createReducer(
    initialTdpmState,
    on(fromTDPMTable.getTDPMTable, (state) => ({
        ...state,
        loading: true,
        getError: false,
    })),
    on(fromTDPMTable.getTDPMTableSuccess, (state, { tdpmSheet }) => ({
        ...state,
        loading: false,
        getError: false,
        tdpmSheetInfo: tdpmSheet,
    })),
    on(fromTDPMTable.getTDPMTablesError, (state) => ({
        ...state,
        loading: false,
        getError: true,
    })),
    on(fromTDPMTable.searchBarFilterTDPMTable, (state, { query }) => ({
        ...state,
        search: query,
    }))
);

export function reducer(state: ITDPMTableState | undefined, action: Action) {
    return TdpmReducer(state, action);
}
