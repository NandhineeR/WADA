import { ActionReducer, ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { ITDPTableState } from '@tdp/store/states/tdp-table.state';
import * as fromTDPTable from './tdp.reducer';

export interface ITDPState {
    tdpTable: ITDPTableState;
}

export const reducers: ActionReducerMap<ITDPState> = {
    tdpTable: fromTDPTable.reducer as ActionReducer<ITDPTableState>,
};

export const getTDPState = createFeatureSelector<ITDPState>('tdp');
