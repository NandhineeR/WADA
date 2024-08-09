import { TDPMetrics } from './tdp-metrics.model';
import { TDPMMetrics } from './tdpm-metrics.model';

export class DashboardMetrics {
    TDP: TDPMetrics;

    TDPM: TDPMMetrics;

    constructor(metrics?: DashboardMetrics) {
        this.TDP = metrics ? new TDPMetrics(metrics.TDP) : new TDPMetrics();
        this.TDPM = metrics ? new TDPMMetrics(metrics.TDPM) : new TDPMMetrics();
    }
}
