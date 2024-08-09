import { NavigationExtras, RoutesRecognized } from '@angular/router';
import { createAction, props } from '@ngrx/store';
import { RouterStateUrl } from '@core/store/states/router.state';

export const Go = createAction(
    '[ROUTER] GO',

    props<{
        path: Array<any>;
        query?: any;
        extras?: NavigationExtras;
    }>()
);

export const Back = createAction('[ROUTER] BACK');

export const Forward = createAction('[ROUTER] FORWARD');

export const RouterActive = createAction(
    '[ROUTER] ROUTER ACTIVE',

    props<{ routerState: RouterStateUrl; event: RoutesRecognized }>()
);
