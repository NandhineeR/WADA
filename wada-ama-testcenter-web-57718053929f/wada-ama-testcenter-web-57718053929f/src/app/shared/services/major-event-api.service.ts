import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { ListItem, MajorEvent } from '@shared/models';

@Injectable()
export class MajorEventApiService {
    private endpoint = `${environment.clientApiBaseUrl}/major-events`;

    constructor(private http: HttpClient) {}

    getMajorEvent(majorEventId: string): Observable<MajorEvent> {
        return this.http
            .get<MajorEvent>(`${this.endpoint}/${majorEventId}`)
            .pipe(map((majorEvent: MajorEvent) => new MajorEvent(majorEvent)));
    }

    getMajorEvents(numberPriorMonths: string): Observable<Array<ListItem>> {
        const params = new HttpParams().set('numberPriorMonths', numberPriorMonths);
        return this.http
            .get<Array<ListItem>>(`${this.endpoint}`, { params })
            .pipe(map((majorEvents: Array<ListItem>) => majorEvents.map((majorEvent) => new ListItem(majorEvent))));
    }
}
