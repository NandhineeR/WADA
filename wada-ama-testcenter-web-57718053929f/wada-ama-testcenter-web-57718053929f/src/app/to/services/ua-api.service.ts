import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { UA, UAAutoCompletes, UATest } from '@to/models';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SecurityWrapper } from '@shared/models';

@Injectable()
export class UAApiService {
    private endpoint = `${environment.clientApiBaseUrl}/unsuccessful-attempt`;

    constructor(private http: HttpClient) {}

    deleteUA(testId: string, unsuccessfulAttemptId: string, reason: string): Observable<string> {
        const encodedReason = btoa(reason);
        return this.http
            .delete<void>(`${this.endpoint}/tests/${testId}/unsuccessful-attempts/${unsuccessfulAttemptId}`, {
                headers: { 'x-wada-note': encodedReason },
            })
            .pipe(map(() => unsuccessfulAttemptId));
    }

    getUATests(ids: Array<string>): Observable<Array<UATest>> {
        const paramValue = Array.isArray(ids) ? ids.join() : ids;
        const params = new HttpParams().set('ids', paramValue);

        return this.http
            .get<Array<UATest>>(`${this.endpoint}/tests`, { params })
            .pipe(map((ua) => ua.map((test) => new UATest(test))));
    }

    getUAs(ids: Array<string>): Observable<Array<SecurityWrapper<UA>>> {
        const paramValue = Array.isArray(ids) ? ids.join() : ids;
        const params = new HttpParams().set('ids', paramValue);

        return this.http
            .get<Array<SecurityWrapper<UA>>>(`${this.endpoint}/uas`, { params })
            .pipe(map((uas: Array<SecurityWrapper<UA>>) => uas.map((ua) => this.setUAWrapper(ua))));
    }

    getAutoCompletes(organizationId: number): Observable<UAAutoCompletes> {
        const params = new HttpParams().set('organizationId', organizationId.toString());
        return this.http
            .get<UAAutoCompletes>(`${this.endpoint}/autocompletes`, { params })
            .pipe(map((autocomplete: UAAutoCompletes) => new UAAutoCompletes(autocomplete)));
    }

    saveUA(uas: UA): Observable<UA> {
        return this.http
            .put<UA>(`${this.endpoint}/save`, { uas })
            .pipe(map((unsuccessfulAttempt: UA) => new UA(unsuccessfulAttempt)));
    }

    saveUAAll(uas: Array<UA>): Observable<Array<UA>> {
        const savedUA: Array<Observable<UA>> = uas.map((ua) => this.saveUA(ua));
        return combineLatest(savedUA);
    }

    private setUAWrapper(wrapper: SecurityWrapper<UA>): SecurityWrapper<UA> {
        return {
            fields: new Map(Object.entries(wrapper.fields)),
            actions: [...wrapper.actions],
            data: new UA(wrapper.data),
        };
    }
}
