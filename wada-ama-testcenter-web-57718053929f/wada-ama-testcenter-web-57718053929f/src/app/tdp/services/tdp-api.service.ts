import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { TDPSheet } from '@tdp/models';
import { environment } from '@env';
import { ORGANIZATION_ID_PLACEHOLDER } from '@core/http-interceptors/organization-id.interceptor';
import { ISportDisciplineDescription } from '@core/models';
import { TestPlanning } from '@tdp/models/test-planning.model';
import { TestPlanningWrapper } from '@tdp/models/test-planning-wrapper.model';

/**
 * CAPI TDP endpoints documentation:
 *
 * Get TDP:
 *     GET /tdp?orgId={orgId}&year={year}
 *     Body: nothing
 *     Return: TDPSheet
 *
 * Save TDP:
 *    PUT /tdp?orgId={orgId}
 *    Body: TDPSheet with cells and subRows to be updated marked as dirty
 *    Return: updated TDPSheet
 *
 * Add discipline to TDP:
 *    PUT /tdp/add-disciplines?orgId={orgId}
 *    Body: TDPSheet with added disciplines marked as dirty at the subRow level
 *    Return: updated TDPSheet
 *
 * Delete discipline in TDP:
 *    PUT /tdp/remove-disciplines?orgId={orgId}
 *    Body: TDPSheet with disciplines to be removed marked as dirty at the subRow level
 *    Return: updated TDPSheet
 */

@Injectable()
export class TDPApiService {
    private endpoint = `${environment.clientApiBaseUrl}/tdp`;

    private currentYear = new Date().getFullYear();

    constructor(private http: HttpClient) {}

    getTDPSheet(year: number, userId: string): Observable<TDPSheet> {
        const params = new HttpParams()
            .set('year', year.toString())
            .set('orgId', ORGANIZATION_ID_PLACEHOLDER)
            .set('userId', userId);

        return this.http
            .get<TDPSheet>(this.endpoint, { params })
            .pipe(map((sheet: TDPSheet) => new TDPSheet(sheet)));
    }

    saveTDPSheet(testPlanningList: Array<TestPlanning>, tdpSheet: TDPSheet): Observable<TestPlanningWrapper> {
        if (!tdpSheet || tdpSheet.yearly[0].year < this.currentYear || !tdpSheet.concurrentUsers) {
            return throwError("Can't modify a TDPSheet from a previous year or that you have no concurrent access to.");
        }

        const params = new HttpParams()
            .set('orgId', ORGANIZATION_ID_PLACEHOLDER)
            .set('lastUpdatedTime', tdpSheet.concurrentUsers.lastUpdate.toString());

        return this.http
            .put<TestPlanningWrapper>(this.endpoint, testPlanningList, {
                params,
            })
            .pipe(map((testPlanningWrapper: TestPlanningWrapper) => new TestPlanningWrapper(testPlanningWrapper)));
    }

    addRowToTDPSheet(sportDiscipline: ISportDisciplineDescription, year: number): Observable<TDPSheet> {
        if (!sportDiscipline || year < this.currentYear) {
            return throwError("Can't modify a TDPSheet from a previous year");
        }

        const params = new HttpParams().set('orgId', ORGANIZATION_ID_PLACEHOLDER).set('year', year.toString());

        return this.http
            .put<TDPSheet>(`${this.endpoint}/add-disciplines`, sportDiscipline, { params })
            .pipe(map((sheet: TDPSheet) => new TDPSheet(sheet)));
    }

    removeRowFromTDPSheet(sportDisciplineId: number, year: number): Observable<TDPSheet> {
        if (year < this.currentYear) {
            return throwError("Can't modify a TDPSheet from a previous year");
        }

        const params = new HttpParams()
            .set('organizationId', ORGANIZATION_ID_PLACEHOLDER)
            .set('sportDisciplineId', String(sportDisciplineId))
            .set('year', String(year));

        return this.http
            .delete<TDPSheet>(`${this.endpoint}`, { params })
            .pipe(map((sheet: TDPSheet) => new TDPSheet(sheet)));
    }
}
