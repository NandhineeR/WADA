import { ActionReducer, ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { ITDSSATableState } from '@tdssa/store/states/tdssa-table.state';
import { ITDSSAFiltersState } from '@tdssa/store/states/tdssa-filters.state';
import { ITDSSAFormState } from '../states/tdssa-form.state';
import * as fromTable from './tdssa-table.reducer';
import * as fromFilters from './tdssa-filters.reducer';
import * as fromForms from './tdssa-form.reducer';

export interface ITDSSAState {
    tdssaTable: ITDSSATableState;
    tdssaFilters: ITDSSAFiltersState;
    tdssaForm: ITDSSAFormState;
}

export const reducers: ActionReducerMap<ITDSSAState> = {
    tdssaTable: fromTable.reducer as ActionReducer<ITDSSATableState>,
    tdssaFilters: fromFilters.reducer as ActionReducer<ITDSSAFiltersState>,
    tdssaForm: fromForms.reducer as ActionReducer<ITDSSAFormState>,
};

export const getTDSSAState = createFeatureSelector<ITDSSAState>('tdssa');

export { TdssaFiltersReducer } from './tdssa-filters.reducer';
export { TdssaFormReducer } from './tdssa-form.reducer';
export { TdssaTableReducer } from './tdssa-table.reducer';
