import { createFeatureSelector } from '@ngrx/store';
import * as fromAutoCompletesReducer from './autocompletes.reducer';
import { IAutoCompletesState } from '../states/autocompletes.state';

export const getAutoCompletesState = createFeatureSelector<IAutoCompletesState>('autoCompletes');

export const autoCompletesReducers = fromAutoCompletesReducer.reducer;
