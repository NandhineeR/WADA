import { ActionReducer, ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { IDashboardMetricsState } from '@dashboard/store/states/dashboard.state';
import * as fromDashboard from './dashboard.reducer';

export interface IDashboardState {
    metrics: IDashboardMetricsState;
}

export const reducers: ActionReducerMap<IDashboardState> = {
    metrics: fromDashboard.reducer as ActionReducer<IDashboardMetricsState>,
};

export const getDashboardState = createFeatureSelector<IDashboardState>('dashboard');
