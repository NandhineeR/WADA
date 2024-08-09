import { Params } from '@angular/router';

export interface RouterStateUrl {
    url: string;
    urlWithoutBaseHref: string;
    queryParams: Params;
    params: Params;
    data: any;
    module: string;
}

export const initialRouterState: RouterStateUrl = {
    url: '',
    urlWithoutBaseHref: '',
    queryParams: {},
    params: {},
    data: {},
    module: '',
};
