import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { DashboardMetrics, TDSSAMetrics } from '@dashboard/models';
import { ORGANIZATION_ID_PLACEHOLDER } from '@core/http-interceptors/organization-id.interceptor';

@Injectable()
export class DashboardApiService {
    private endpoint = `${environment.clientApiBaseUrl}/dashboard`;

    constructor(private http: HttpClient) {}

    getDashboardSheetInfo(year: number): Observable<DashboardMetrics> {
        const params = new HttpParams().set('orgId', ORGANIZATION_ID_PLACEHOLDER).set('year', year.toString());

        return this.http
            .get<DashboardMetrics>(this.endpoint, { params })
            .pipe(map((metrics: DashboardMetrics) => new DashboardMetrics(metrics)));
    }

    getTDSSAMetricsInfo(year: number): Observable<TDSSAMetrics> {
        const params = new HttpParams().set('orgId', ORGANIZATION_ID_PLACEHOLDER).set('year', year.toString());

        return this.http
            .get<TDSSAMetrics>(`${this.endpoint}/tdssa-metrics`, { params })
            .pipe(map((tdssaMetrics: TDSSAMetrics) => new TDSSAMetrics(tdssaMetrics)));
    }
}
