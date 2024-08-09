import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { GenericActivity } from '@shared/models/generic-activity.model';
import { ActivatedRoute } from '@angular/router';
import { isNullOrBlank } from '@shared/utils';

class HttpOptions {
    headers?: HttpHeaders;

    params?: HttpParams;
}

@Injectable()
export class GenericActivityApiService {
    private baseUrl = `${environment.clientApiBaseUrl}/activity`;

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    getGenericActivities(activityType: string, ownerType: string, ownerId: string): Observable<Array<GenericActivity>> {
        const params = new HttpParams().set('activityType', activityType);
        let options: HttpOptions = { params };
        const abpAccess = this.route?.snapshot?.queryParams?.abpAccess || '';
        if (!isNullOrBlank(abpAccess)) {
            const headers = new HttpHeaders().set('X-ABP-ACCESS', abpAccess);
            options = { headers, params };
        }

        return this.http
            .get<Array<GenericActivity>>(`${this.baseUrl}/ownerType/${ownerType}/ownerId/${ownerId}`, options)
            .pipe(
                map((genericActivities) =>
                    genericActivities.map((genericActivity) => new GenericActivity(genericActivity))
                )
            );
    }
}
