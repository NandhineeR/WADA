import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable()
export class TimezoneInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const clonedRequest = request.url.startsWith(environment.clientApiBaseUrl)
            ? request.clone({
                  headers: request.headers.set('TimeZone', getTimezoneOffset()),
              })
            : request;
        return next.handle(clonedRequest);
    }
}

function getTimezoneOffset(): string {
    return `GMT${moment().format('Z')}`;
}
