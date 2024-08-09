import { createSelector } from '@ngrx/store';
import * as fromFeature from '@dashboard/store/reducers';
import { IDashboardMetricsState } from '@dashboard/store/states/dashboard.state';

export const getDashboardMetricsState = createSelector(
    fromFeature.getDashboardState,
    (state: fromFeature.IDashboardState) => state.metrics
);

export const getDashboardMetrics = createSelector(
    getDashboardMetricsState,
    (state: IDashboardMetricsState) => state.metrics
);

export const getLoading = createSelector(getDashboardMetricsState, (state: IDashboardMetricsState) => state.loading);

export const getError = createSelector(getDashboardMetricsState, (state: IDashboardMetricsState) => state.error);

export const canShowMetrics = createSelector(
    getDashboardMetricsState,
    (state: IDashboardMetricsState) => !state.error && !state.loading
);

export const getTDSSAMetrics = createSelector(
    getDashboardMetricsState,
    (state: IDashboardMetricsState) => state.tdssaMetrics
);

export const canShowTDSSAMetrics = createSelector(
    getDashboardMetricsState,
    (state: IDashboardMetricsState) => !state.errorTDSSAMetrics && !state.loadingTDSSAMetrics
);

export const getBuildManifest = createSelector(
    getDashboardMetricsState,
    (state: IDashboardMetricsState) => state.buildManifest
);
