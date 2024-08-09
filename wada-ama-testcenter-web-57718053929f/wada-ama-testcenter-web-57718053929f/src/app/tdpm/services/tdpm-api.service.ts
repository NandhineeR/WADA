import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TDPMSheetInfo } from '@tdpm/models';
import { environment } from '@env';
import { ORGANIZATION_ID_PLACEHOLDER } from '@core/http-interceptors/organization-id.interceptor';

/**
 * CAPI TDPM endpoints documentation:
 *
 * Get TDPM:
 *     GET /tdpm?orgId={orgId}&year={year}
 *     Body: nothing
 *     Return: TDPMSheetInfo
 */

@Injectable()
export class TDPMApiService {
    private endpoint = `${environment.clientApiBaseUrl}/tdp-monitoring`;

    constructor(private http: HttpClient) {}

    getTDPMSheetInfos(fromMonth: number, fromYear: number, toMonth: number, toYear: number): Observable<TDPMSheetInfo> {
        const params = new HttpParams()
            .set('orgId', ORGANIZATION_ID_PLACEHOLDER)
            .set('fromYearMonth', `${fromYear}-${fromMonth + 1}`)
            .set('toYearMonth', `${toYear}-${toMonth + 1}`);

        return this.http
            .get<TDPMSheetInfo>(this.endpoint, { params })
            .pipe(map((sheet: TDPMSheetInfo) => new TDPMSheetInfo(sheet)));
    }
}
