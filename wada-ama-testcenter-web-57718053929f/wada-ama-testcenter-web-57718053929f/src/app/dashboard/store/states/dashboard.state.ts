import { BuildManifest } from '@core/models/build-manifest.model';
import { IFeatureState } from '@core/store';
import { DashboardMetrics, TDSSAMetrics } from 'app/dashboard/models';

export interface IDashboardMetricsState extends IFeatureState {
    loading: boolean;
    error: boolean;
    loadingTDPMetrics: boolean;
    errorTDPMetrics: boolean;
    loadingTDSSAMetrics: boolean;
    errorTDSSAMetrics: boolean;
    metrics: DashboardMetrics;
    tdssaMetrics: TDSSAMetrics;
    buildManifest: BuildManifest;
}

export const initialDashboardState: IDashboardMetricsState = {
    loading: false,
    error: false,
    loadingTDPMetrics: false,
    errorTDPMetrics: false,
    loadingTDSSAMetrics: false,
    errorTDSSAMetrics: false,
    metrics: new DashboardMetrics(),
    tdssaMetrics: new TDSSAMetrics(),
    buildManifest: new BuildManifest(),
};
