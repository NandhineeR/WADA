import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { ObservableInput } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DEFAULT_ORGANIZATION_ID } from '@core/store/states/user-info.state';
import { IState } from '@core/store/reducers';
import { getOrganizationViewId } from '@core/store/selectors';
import { AbstractTemplateInterceptor } from './abstract-template.interceptor';

export const ORGANIZATION_ID_PLACEHOLDER = '{orgId}';

@Injectable()
export class OrganizationIdInterceptor extends AbstractTemplateInterceptor implements HttpInterceptor {
    replaceBy: ObservableInput<string>;

    placeholder = ORGANIZATION_ID_PLACEHOLDER;

    constructor(store: Store<IState>) {
        super();
        this.replaceBy = store.pipe(
            select(getOrganizationViewId),
            filter((orgId) => orgId !== DEFAULT_ORGANIZATION_ID),
            map((value) => value.toString())
        );
    }
}
