import { ActionReducer, ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { ITDPMTableState } from '@tdpm/store/states/tdpm.state';
import { ITDPMFiltersState } from '@tdpm/store/states/tdpmFilter.state';
import * as fromFilters from './tdpm-filters.reducer';
import * as fromTable from './tdpm.reducer';

export interface ITDPMState {
    filters: ITDPMFiltersState;
    tdpmTable: ITDPMTableState;
}

export const reducers: ActionReducerMap<ITDPMState> = {
    filters: fromFilters.reducer as ActionReducer<ITDPMFiltersState>,
    tdpmTable: fromTable.reducer as ActionReducer<ITDPMTableState>,
};

export const getTDPMState = createFeatureSelector<ITDPMState>('tdpm');
export { TdpmFilterReducer } from './tdpm-filters.reducer';
export { TdpmReducer } from './tdpm.reducer';
