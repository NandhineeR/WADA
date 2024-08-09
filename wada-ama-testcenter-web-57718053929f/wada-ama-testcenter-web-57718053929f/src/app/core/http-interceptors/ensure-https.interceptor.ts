import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { AbstractTemplateInterceptor } from './abstract-template.interceptor';

@Injectable()
export class EnsureHttpsInterceptor extends AbstractTemplateInterceptor implements HttpInterceptor {
    placeholder = 'http://';

    replaceBy = 'https://';

    shouldInterceptByUrl(): boolean {
        return false;
    }

    protected shouldInterceptByParams(): boolean {
        return false;
    }
}
