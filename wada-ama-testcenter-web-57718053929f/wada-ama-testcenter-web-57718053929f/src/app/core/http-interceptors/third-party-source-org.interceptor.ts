import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as fromStore from '@core/store';

@Injectable()
export class ThirdPartySourceOrgInterceptor implements HttpInterceptor {
    constructor(private store: Store<fromStore.IState>) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request.url.startsWith(environment.clientApiBaseUrl)) {
            return next.handle(request);
        }

        return this.addThirdPartySourceOrgHeaderToRequest(request).pipe(
            switchMap((clonedRequest) => next.handle(clonedRequest))
        );
    }

    private addThirdPartySourceOrgHeaderToRequest(request: HttpRequest<any>): Observable<HttpRequest<any>> {
        return this.store.select(fromStore.getSelectedContract).pipe(
            map((selectedContract) => {
                const formattedSelectedContract = selectedContract || '';
                const clonedRequest = request.clone({
                    headers: request.headers.set('ThirdPartySourceOrg', formattedSelectedContract),
                });
                return selectedContract ? clonedRequest : request;
            })
        );
    }
}
