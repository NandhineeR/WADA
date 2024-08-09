import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from, Observable, ObservableInput, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export abstract class AbstractTemplateInterceptor implements HttpInterceptor {
    abstract placeholder: string;

    abstract replaceBy: string | ObservableInput<string>;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.shouldIntercept(req)) return next.handle(req);
        return this.getReplaceByAsObservable().pipe(
            map((newValue) => this.replaceTemplates(req, newValue)),
            switchMap((request) => next.handle(request))
        );
    }

    protected shouldIntercept(req: HttpRequest<any>): boolean {
        return this.shouldInterceptByUrl(req) || this.shouldInterceptByParams(req);
    }

    protected shouldInterceptByParams(req: HttpRequest<any>): boolean {
        return req.params
            .keys()
            .reduce((acc: Array<string>, key: string) => acc.concat(req.params.get(key) || ''), [])
            .some((param) => `${param}`.includes(this.placeholder));
    }

    protected shouldInterceptByUrl(req: HttpRequest<any>): boolean {
        return req.url.includes(this.placeholder);
    }

    private getReplaceByAsObservable(): Observable<string> {
        return typeof this.replaceBy === 'string' ? of(this.replaceBy) : from(this.replaceBy);
    }

    private replaceTemplates(request: HttpRequest<any>, newValue: string): HttpRequest<any> {
        const url = request.url.includes(this.placeholder)
            ? request.url.replace(this.placeholder, newValue)
            : request.url;
        const updatedParams = this.updateParams(request, newValue);

        return request.clone({
            url,
            setParams: updatedParams,
        });
    }

    private updateParams(request: HttpRequest<any>, newValue: string): { [key: string]: string } {
        const updatedParams: { [key: string]: string } = {};
        request.params.keys().forEach((requestParam) => {
            const paramValue: string | null = request.params.get(requestParam);
            if (paramValue) {
                updatedParams[requestParam] = paramValue.includes(this.placeholder)
                    ? paramValue.replace(this.placeholder, newValue)
                    : paramValue;
            }
        });
        return updatedParams;
    }
}
