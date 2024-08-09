import { createFeatureSelector } from '@ngrx/store';
import { IDCFState } from '@dcf/store/states/dcf.state';
import { IMultipleDCFState } from '@dcf/store/states/multiple-dcf.state';
import * as fromDCFReducer from './dcf.reducer';
import * as fromMultipleDCFReducer from './multiple-dcf.reducer';

export const getDCFState = createFeatureSelector<IDCFState>('dcf');
export const getMultipleDCFState = createFeatureSelector<IMultipleDCFState>('multiple-dcf');

export const dcfReducers = fromDCFReducer.reducer;
export const dcfMultipleReducers = fromMultipleDCFReducer.reducer;
