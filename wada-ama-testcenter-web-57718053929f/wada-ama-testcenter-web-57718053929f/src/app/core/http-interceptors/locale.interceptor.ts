import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';
import { environment } from '@env';
import * as fromStore from '@core/store';

@Injectable()
export class LocaleInterceptor implements HttpInterceptor {
    constructor(private store: Store<fromStore.IState>) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request.url.startsWith(environment.clientApiBaseUrl)) {
            return next.handle(request);
        }

        return this.addLocaleToRequest(request).pipe(mergeMap((localeRequest) => next.handle(localeRequest)));
    }

    private addLocaleToRequest(req: HttpRequest<any>): Observable<HttpRequest<any>> {
        return this.store.select(fromStore.getLocale).pipe(
            first(),
            map((locale) => req.clone({ setHeaders: { Language: locale } }))
        );
    }
}
