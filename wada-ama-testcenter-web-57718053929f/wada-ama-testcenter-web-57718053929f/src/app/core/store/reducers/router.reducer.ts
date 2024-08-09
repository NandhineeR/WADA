import { Action, createReducer, on } from '@ngrx/store';
import { initialRouterState, RouterStateUrl } from '@core/store/states/router.state';
import * as fromRouterActions from '@core/store/actions/router.actions';

export const routerReducer = createReducer(
    initialRouterState,
    on(fromRouterActions.RouterActive, (state, action) => ({
        ...state,
        ...action.routerState,
    }))
);

export function reducer(state: RouterStateUrl | undefined, action: Action): RouterStateUrl {
    return routerReducer(state, action);
}
