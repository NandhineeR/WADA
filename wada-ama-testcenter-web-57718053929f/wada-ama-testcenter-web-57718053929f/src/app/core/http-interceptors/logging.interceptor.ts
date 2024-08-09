import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const started = Date.now();
        let ok: string;

        // extend server response observable with logging
        return next.handle(req).pipe(
            tap(
                (event) => {
                    ok = event instanceof HttpResponse ? 'succeeded' : '';
                },
                () => {
                    ok = 'failed';
                }
            ),
            finalize(() => {
                // log when response observable either completes or errors
                const elapsed = Date.now() - started;
                const msg = `${req.method} "${req.urlWithParams}" ${ok} in ${elapsed} ms.`;
                console.log(msg);
            })
        );
    }
}