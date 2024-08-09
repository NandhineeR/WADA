import { ActionReducer, ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { IViewUAState } from '@to/store/states/ua.state';
import { IViewTOState } from '@to/store/states/to.state';
import * as fromTO from './to.reducer';
import * as fromUA from './ua.reducer';

export interface ITOState {
    to: IViewTOState;
}
export const getTOState = createFeatureSelector<ITOState>('to');

export interface IUAState {
    ua: IViewUAState;
}

export const getUAState = createFeatureSelector<IUAState>('ua');

export const toReducers: ActionReducerMap<ITOState> = {
    to: fromTO.reducer as ActionReducer<IViewTOState>,
};

export const uaReducers: ActionReducerMap<IUAState> = {
    ua: fromUA.reducer as ActionReducer<IViewUAState>,
};
