import { createSelector } from '@ngrx/store';
import * as fromRoot from '@core/store/reducers';
import { RouterStateUrl } from '@core/store/states/router.state';

export const getActiveRoute = (state: fromRoot.IState) => state.activeRoute;

export const getActiveRouteUrl = createSelector(getActiveRoute, (route: RouterStateUrl) => route.url);

export const getActiveRouteUrlWithoutParenthesis = (baseHref?: string) =>
    createSelector(getActiveRoute, (route: RouterStateUrl) =>
        route && route.urlWithoutBaseHref ? removeParenthesisFromUrl(baseHref || '', route.urlWithoutBaseHref) : ''
    );

export const getActiveRouteFirstUrlFragment = createSelector(
    getActiveRoute,
    (route: RouterStateUrl) => route.url.split('#')[0]
);

export const getActiveRouteData = createSelector(getActiveRoute, (route: RouterStateUrl) => route.data);

export const getActiveRouteParams = createSelector(getActiveRoute, (route: RouterStateUrl) => route.params);

export const getActiveRouteQueryParams = createSelector(getActiveRoute, (route: RouterStateUrl) => route.queryParams);

function removeParenthesisFromUrl(baseUrl: string, currentUrl: string): string {
    let urlRefactored = '';
    if (currentUrl && currentUrl.indexOf('(')) {
        urlRefactored = currentUrl.substring(baseUrl.length, currentUrl.indexOf('('));
    }
    return urlRefactored;
}
