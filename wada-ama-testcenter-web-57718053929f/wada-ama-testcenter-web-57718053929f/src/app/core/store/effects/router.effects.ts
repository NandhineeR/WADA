import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { RouterReducerState, RouterStateSerializer } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { RouterStateUrl } from '@core/store/states/router.state';
import * as RouterActions from '@core/store/actions/router.actions';
import { filterUrlChanges } from '@shared/utils';

@Injectable()
export class RouterEffects {
    navigate$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RouterActions.Go),
                tap(({ path, query: queryParams, extras }) => {
                    this.router.navigate(path, { queryParams, ...extras });
                })
            ),
        { dispatch: false }
    );

    navigateBack$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RouterActions.Back),
                tap(() => this.location.back())
            ),
        { dispatch: false }
    );

    navigateForward$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RouterActions.Forward),
                tap(() => this.location.forward())
            ),
        { dispatch: false }
    );

    scrollUpOnFormNavigation$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RouterActions.RouterActive),
                filterUrlChanges(),
                tap(() => window.scrollTo(0, 0))
            ),
        { dispatch: false }
    );

    browserAutoCompleteDisabler$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RouterActions.RouterActive),
                filterUrlChanges(),
                tap(() => {
                    // This function will execute once the page is fully loaded
                    setTimeout(() => {
                        // Change all ids and field names to prevent browser saving meaningful information

                        // Disable for FireFox
                        const formElements = document.getElementsByTagName('form');
                        Array.from(formElements).forEach((element) => {
                            element.setAttribute('autocomplete', 'off');
                        });

                        // Disable for Chrome
                        const inputElements = document.getElementsByTagName('input');
                        Array.from(inputElements).forEach((element) => {
                            element.setAttribute('autocomplete', 'disabled');
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    protected lastRoutesRecognized?: RoutesRecognized;

    constructor(
        private actions$: Actions,
        private router: Router,
        private location: Location,
        stateSerializer: RouterStateSerializer<RouterStateUrl>,
        store: Store<{ router: RouterReducerState<RouterStateUrl> }>
    ) {
        this.router.events.subscribe((e) => {
            if (e instanceof RoutesRecognized) {
                this.lastRoutesRecognized = e;
            }
        });

        this.router.events
            .pipe(
                filter(this.isNavigationEnd),
                withLatestFrom(store.select<RouterReducerState<RouterStateUrl>>((state) => state.router))
            )
            .subscribe(([event, routerState]: [NavigationEnd, RouterReducerState<RouterStateUrl>]) => {
                // when timetraveling the event.id is an old one, but the navigation triggered uses a new id
                // this prevents the dispatch of ROUTER_ACTIVE when the state was changed by dev tools
                if (routerState && routerState.navigationId === event.id) {
                    const routerStateSerialized = stateSerializer.serialize(router.routerState.snapshot);
                    if (this.lastRoutesRecognized) {
                        store.dispatch(
                            RouterActions.RouterActive({
                                routerState: routerStateSerialized,
                                event: new RoutesRecognized(
                                    this.lastRoutesRecognized.id,
                                    this.lastRoutesRecognized.url,
                                    this.lastRoutesRecognized.urlAfterRedirects,
                                    routerStateSerialized as any
                                ),
                            })
                        );
                    }
                }
            });
    }

    protected isNavigationEnd(event: any): event is NavigationEnd {
        return event instanceof NavigationEnd;
    }
}
