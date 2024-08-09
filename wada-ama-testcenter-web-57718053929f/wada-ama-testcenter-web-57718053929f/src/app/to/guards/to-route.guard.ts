import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { IState } from '@core/store/reducers';
import { Go } from '@core/store/actions';
import * as fromAutoCompletesStore from '@autocompletes/store';
import { combineLatest } from 'rxjs';
import { ListItem } from '@shared/models';

@Injectable()
export class TORouteGuard implements CanActivate {
    constructor(private store: Store<IState>) {}

    canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.attemptNavigation(state.url);
    }

    /**
     * User can navigate to other steps in Testing Order if autocompletes in section authorization are already loaded.
     */
    private areSectionAuthorizationAutoCompletesLoaded(): Promise<boolean> {
        return combineLatest([
            this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesAdos), take(1)),
            this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesDtps), take(1)),
        ])
            .pipe(
                map(([ados, dtps]: [Array<ListItem>, Array<ListItem>]) => {
                    return ados.length > 0 && dtps.length > 0;
                })
            )
            .toPromise();
    }

    private async attemptNavigation(url: string): Promise<boolean | never> {
        // When creating a TO, check if step 1 autocompletes have already been loaded
        if (this.isCreating(url) && !this.isOnStep1(url)) {
            const canLoad = await this.areSectionAuthorizationAutoCompletesLoaded();
            if (!canLoad) {
                /**
                 * If not, swap whatever step number in the url to redirect the user to step 1
                 * So first, move the index to the end of the search string
                 */
                const index = url.indexOf('/step/') + 6;
                const step1URL = url.substring(0, index) + 1 + url.substring(index + 1);
                this.store.dispatch(Go({ path: [step1URL] }));
            }
        }

        return true;
    }

    private isCreating(url: string): boolean {
        return url.startsWith('/to/new');
    }

    private isOnStep1(url: string): boolean {
        return url.includes('/step/1');
    }
}
