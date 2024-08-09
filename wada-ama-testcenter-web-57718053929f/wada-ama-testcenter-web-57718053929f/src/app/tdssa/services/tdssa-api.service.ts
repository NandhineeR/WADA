import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDate } from 'ngx-bootstrap/chronos';
import { endpointDateFormat } from '@shared/utils/string-utils';
import { TDSSASheet } from '@tdssa/models';
import { environment } from '@env';
import { ORGANIZATION_ID_PLACEHOLDER } from '@core/http-interceptors/organization-id.interceptor';

@Injectable()
export class TDSSAApiService {
    private baseUrl: string = environment.clientApiBaseUrl;

    constructor(private http: HttpClient) {}

    getTDSSATable(startDate: Date, endDate: Date): Observable<TDSSASheet> {
        const params = new HttpParams()
            .set('startDate', formatDate(startDate, endpointDateFormat))
            .set('endDate', formatDate(endDate, endpointDateFormat));

        return this.http
            .get<TDSSASheet>(`${this.baseUrl}/tdp/tdssa/${ORGANIZATION_ID_PLACEHOLDER}`, { params })
            .pipe(map((sheet: TDSSASheet) => new TDSSASheet(sheet)));
    }
}
