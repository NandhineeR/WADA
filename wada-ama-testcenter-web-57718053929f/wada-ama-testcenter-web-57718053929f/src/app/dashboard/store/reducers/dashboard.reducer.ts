import { Action, createReducer, on } from '@ngrx/store';
import * as fromDashboardActions from '@dashboard/store/actions/dashboard.actions';
import { IDashboardMetricsState, initialDashboardState } from '@dashboard/store/states/dashboard.state';

export const dashboardReducer = createReducer(
    initialDashboardState,
    on(fromDashboardActions.GetDashboard, (state) => ({
        ...state,
        loading: true,
        error: state.errorTDSSAMetrics,
        loadingTDPMetrics: true,
        errorTDPMetrics: false,
    })),
    on(fromDashboardActions.GetDashboardSuccess, (state, { metrics }) => ({
        ...state,
        loading: state.loadingTDSSAMetrics,
        error: state.errorTDSSAMetrics,
        loadingTDPMetrics: false,
        errorTDPMetrics: false,
        metrics,
    })),
    on(fromDashboardActions.GetDashboardError, (state) => ({
        ...state,
        loading: state.loadingTDSSAMetrics,
        error: true,
        loadingTDPMetrics: false,
        errorTDPMetrics: true,
    })),
    on(fromDashboardActions.GetTDSSAMetrics, (state) => ({
        ...state,
        loading: true,
        error: state.errorTDPMetrics,
        loadingTDSSAMetrics: true,
        errorTDSSAMetrics: false,
    })),
    on(fromDashboardActions.GetTDSSAMetricsSuccess, (state, { tdssaMetrics }) => ({
        ...state,
        loading: state.loadingTDPMetrics,
        error: state.errorTDPMetrics,
        loadingTDSSAMetrics: false,
        errorTDSSAMetrics: false,
        tdssaMetrics,
    })),
    on(fromDashboardActions.GetTDSSAMetricsError, (state) => ({
        ...state,
        loading: state.loadingTDPMetrics,
        error: true,
        loadingTDSSAMetrics: false,
        errorTDSSAMetrics: true,
    })),

    on(fromDashboardActions.GetBuildManifest, (state) => ({
        ...state,
        error: false,
    })),
    on(fromDashboardActions.GetBuildManifestSuccess, (state, { buildManifest }) => ({
        ...state,
        error: false,
        buildManifest,
    })),
    on(fromDashboardActions.GetBuildManifestError, (state) => ({
        ...state,
        error: true,
    }))
);

export function reducer(state: IDashboardMetricsState | undefined, action: Action): IDashboardMetricsState {
    return dashboardReducer(state, action);
}
