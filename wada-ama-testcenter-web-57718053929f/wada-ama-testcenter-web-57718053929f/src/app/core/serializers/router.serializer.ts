import { Params, RouterStateSnapshot } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { RouterStateSerializer } from '@ngrx/router-store';
import { Inject, Injectable } from '@angular/core';
import { RouterStateUrl } from '@core/store/states/router.state';

@Injectable()
export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
    constructor(@Inject(APP_BASE_HREF) private baseHref: string) {}

    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        const url = (this.baseHref + routerState.url).replace('//', '/');
        const urlWithoutBaseHref = routerState.url.replace('//', '/');
        const { queryParams } = routerState.root;

        let state = routerState.root;
        let params: Params = { ...state.params };
        let data: any = { ...state.data };

        while (state.firstChild) {
            state = state.firstChild;
            params = { ...params, ...state.params };
            data = { ...data, ...state.data };
        }

        const module =
            (routerState.root.firstChild &&
                routerState.root.firstChild.routeConfig &&
                routerState.root.firstChild.routeConfig.path) ||
            '';

        return { urlWithoutBaseHref, url, queryParams, params, data, module };
    }
}
