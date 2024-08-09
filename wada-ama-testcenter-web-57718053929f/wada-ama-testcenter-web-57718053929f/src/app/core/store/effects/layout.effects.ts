import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromRouter from '@ngrx/router-store';
import { map } from 'rxjs/operators';
import * as LayoutActions from '@core/store/actions/layout.actions';

@Injectable()
export class LayoutEffects {
    navigate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromRouter.ROUTER_NAVIGATION),
            map(() => LayoutActions.CollapseSidebar())
        )
    );

    constructor(private actions$: Actions) {}
}
