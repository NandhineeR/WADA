import { BuildManifest } from '@core/models/build-manifest.model';
import { createAction, props } from '@ngrx/store';
import { DashboardMetrics, TDSSAMetrics } from '@dashboard/models';

export const GetDashboard = createAction('[DASHBOARD] GET_DASHBOARD', props<{ year: number }>());

export const GetDashboardSuccess = createAction(
    '[DASHBOARD] GET_DASHBOARD_SUCCESS',
    props<{ metrics: DashboardMetrics }>()
);

export const GetDashboardError = createAction('[DASHBOARD] GET_DASHBOARD_ERROR');

export const GetTDSSAMetrics = createAction('[DASHBOARD] GET_TDSSA_METRICS', props<{ year: number }>());

export const GetTDSSAMetricsSuccess = createAction(
    '[DASHBOARD] GET_TDSSA_METRICS_SUCCESS',

    props<{ tdssaMetrics: TDSSAMetrics }>()
);

export const GetTDSSAMetricsError = createAction('[DASHBOARD] GET_TDSSA_METRICS_ERROR');

export const GetBuildManifest = createAction('[DASHBOARD] GET_BUILD_MANIFEST');

export const GetBuildManifestSuccess = createAction(
    '[DASHBOARD] GET_BUILD_MANIFEST_SUCCESS',

    props<{ buildManifest: BuildManifest }>()
);

export const GetBuildManifestError = createAction('[DASHBOARD] GET_BUILD_MANIFEST_ERROR');
