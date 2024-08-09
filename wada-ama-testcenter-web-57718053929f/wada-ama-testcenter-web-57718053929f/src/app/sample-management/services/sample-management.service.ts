import { AnalysisSample, Sample } from '@sampleManagement/models';
import { environment } from '@env';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class SampleManagementApiService {
    private baseUrl = `${environment.sampleManagementUrl}/api`;

    constructor(private http: HttpClient) {}

    getAnalysisSamples(testingOrderId: string): Observable<Array<AnalysisSample | null>> {
        return this.http
            .get<Array<AnalysisSample>>(`${this.baseUrl}/testingOrder/${testingOrderId}`)
            .pipe(map((object: any) => (object?.analysisSamples || []).map((a: any) => new AnalysisSample(a))));
    }

    getTestInformation(testId: string): Observable<Array<Sample>> {
        return this.http
            .get<any>(`${this.baseUrl}/test/${testId}`)
            .pipe(map((object: any) => (object.samples || []).map((sampleInfo: any) => new Sample(sampleInfo))));
    }

    /**
     * Initiates the synchronization mechanism to keep the Test up to date in the Sample Management platform.
     *
     * @param testId
     * @throws {Error} This request will fail on any local environment.
     */
    notifyTest(testId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/test/${testId}`, { observe: 'response' });
    }

    /**
     * Initiates the synchronization mechanism to keep the Testing Order up to date in the Sample Management platform.
     *
     * @param testingOrderId
     * @throws {Error} This request will fail on any local environment.
     */
    notifyTestingOrder(testingOrderId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/testingOrder/${testingOrderId}`, { observe: 'response' });
    }
}
