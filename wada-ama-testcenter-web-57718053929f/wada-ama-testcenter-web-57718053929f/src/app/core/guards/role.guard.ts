import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    RouterStateSnapshot,
} from '@angular/router';
import { select, Store } from '@ngrx/store';
import { UserRolesEnum } from '@shared/models';
import { skipWhile, switchMap, take } from 'rxjs/operators';
import { Go } from '@core/store/actions';
import { IState } from '@core/store/reducers';
import { getAreRoleLoaded, getHasRole } from '@core/store/selectors';

@Injectable()
export class RoleGuard implements CanLoad, CanActivate, CanActivateChild {
    constructor(private store: Store<IState>) {}

    canLoad(route: Route): Promise<boolean> {
        return this.attemptNavigation(route.data && route.data.role, route.data && route.data.fallback);
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _state: RouterStateSnapshot
    ): Promise<boolean> {
        return this.attemptNavigation(route.data && route.data.role, route.data && route.data.fallback);
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _state: RouterStateSnapshot
    ): Promise<boolean> {
        return this.attemptNavigation(
            childRoute.data && childRoute.data.role,
            childRoute.data && childRoute.data.fallback
        );
    }

    private async attemptNavigation(
        role: UserRolesEnum,
        fallback?: Array<UserRolesEnum> | undefined
    ): Promise<boolean | never> {
        const canLoad = await this.canNavigate(role, fallback);
        if (!canLoad) {
            // only if latest navigation attempt
            setTimeout(() => {
                this.store.dispatch(Go({ path: ['/', 'unauthorized'] }));
            }, 200);

            return false;
        }

        return true;
    }

    private canNavigate(role: UserRolesEnum, fallback?: Array<UserRolesEnum> | undefined): Promise<boolean> {
        const areRolesLoaded = this.store.pipe(select(getAreRoleLoaded));
        const canActivate = this.store.pipe(select(getHasRole(role, fallback)));

        return areRolesLoaded
            .pipe(
                // wait until the roles are loaded before checking if the user can activate the route
                skipWhile((rolesAreLoaded) => !rolesAreLoaded),
                switchMap(() => canActivate),
                take(1)
            )
            .toPromise();
    }
}
