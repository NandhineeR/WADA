import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 } from 'uuid';
import { environment } from '@env';

@Injectable()
export class XCorrelationIDInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const clonedRequest = request.url.startsWith(environment.clientApiBaseUrl)
            ? request.clone({
                  headers: request.headers.set('X-Correlation-ID', v4()),
              })
            : request;
        return next.handle(clonedRequest);
    }
}
