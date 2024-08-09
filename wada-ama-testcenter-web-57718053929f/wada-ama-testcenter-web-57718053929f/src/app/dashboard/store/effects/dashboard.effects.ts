import { Injectable } from '@angular/core';
import { BuildManifest } from '@core/models/build-manifest.model';
import { BuildManifestService } from '@core/services/build-manifest.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DashboardMetrics, TDSSAMetrics } from '@dashboard/models';
import { DashboardApiService } from '@dashboard/services';
import * as DashboardActions from '@dashboard/store/actions/dashboard.actions';

@Injectable()
export class DashboardEffects {
    getDashboard$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.GetDashboard),
            switchMap((action) => this.dashboardApi.getDashboardSheetInfo(action.year)),
            map((metrics: DashboardMetrics) => DashboardActions.GetDashboardSuccess({ metrics })),
            catchError(() => of(DashboardActions.GetDashboardError()))
        )
    );

    getTDSSAMetrics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.GetTDSSAMetrics),
            switchMap((action) => this.dashboardApi.getTDSSAMetricsInfo(action.year)),
            map((tdssaMetrics: TDSSAMetrics) => DashboardActions.GetTDSSAMetricsSuccess({ tdssaMetrics })),
            catchError(() => of(DashboardActions.GetTDSSAMetricsError()))
        )
    );

    getBuildManifest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.GetBuildManifest),
            switchMap(() => this.buildManifestApi.getBuildManifest()),
            map((buildManifest: BuildManifest) => DashboardActions.GetBuildManifestSuccess({ buildManifest })),
            catchError(() => of(DashboardActions.GetBuildManifestError()))
        )
    );

    constructor(
        private dashboardApi: DashboardApiService,
        private buildManifestApi: BuildManifestService,
        private actions$: Actions
    ) {}
}
