import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { IState } from '@core/store/reducers';
import * as fromAutoCompletesStore from '@autocompletes/store';
import { Go } from '@core/store/actions';
import { SectionAuthorizationAutoCompletes } from '@dcf/models';

@Injectable()
export class DCFRouteGuard implements CanActivate {
    dcfStep1Url = '/dcf/new/step/1';

    constructor(private store: Store<IState>) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.attemptNavigation(state.url, route.queryParams);
    }

    private async attemptNavigation(url: string, athlete: any): Promise<boolean | never> {
        const isStep1 = url.startsWith(this.dcfStep1Url);
        // if user is in step one there is no need to check for autocompletes
        if (!isStep1) {
            // Otherwise, verify if user has already visited Step 1
            const canLoad = await this.canNavigate();
            if (!canLoad) {
                this.store.dispatch(Go({ path: [this.dcfStep1Url], query: athlete }));
            }
        }
        return true;
    }

    // User can navigate to other steps in DCF if autocompletes in step1 are already loaded.
    private canNavigate(): Promise<boolean> {
        const autoCompletesSectionAuthorization$ = this.store.pipe(
            select(fromAutoCompletesStore.getDCFSectionAuthorizationAutoCompletes)
        );
        return autoCompletesSectionAuthorization$
            .pipe(
                take(1),
                map((autocomplete: SectionAuthorizationAutoCompletes) => {
                    return autocomplete.ados.length > 0 || autocomplete.dtps.length > 0;
                })
            )
            .toPromise();
    }
}
