import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BuildManifest } from '@core/models/build-manifest.model';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dashboard/store';
import { DashboardMetrics, TDSSAMetrics } from '@dashboard/models';

@Component({
    selector: 'app-dashboard-monitoring',
    templateUrl: './dashboard-monitoring.component.html',
    styleUrls: ['./dashboard-monitoring.component.scss', './dashboard-monitoring.component.ie.scss'],
})
export class DashboardMonitoringComponent {
    metrics$: Observable<DashboardMetrics> = this.store.select(fromStore.getDashboardMetrics);

    canShowMetrics$: Observable<boolean> = this.store.select(fromStore.canShowMetrics);

    tdssaMetrics$: Observable<TDSSAMetrics> = this.store.select(fromStore.getTDSSAMetrics);

    canShowTDSSAMetrics$: Observable<boolean> = this.store.select(fromStore.canShowTDSSAMetrics);

    validOrg$: Observable<boolean> = this.store.select(fromRootStore.getIsOnlyNadoOrRado);

    buildManifest$: Observable<BuildManifest> = this.store.select(fromStore.getBuildManifest);

    currentYear = new Date().getFullYear();

    afterOctober = new Date().getMonth() >= 9;

    isIE = /msie\s|trident\//i.test(window.navigator.userAgent);

    constructor(private store: Store<fromRootStore.IState>) {
        this.store.dispatch(fromStore.GetTDSSAMetrics({ year: new Date().getFullYear() }));
        this.store.dispatch(fromStore.GetDashboard({ year: new Date().getFullYear() }));
        this.store.dispatch(fromStore.GetBuildManifest());
    }
}
