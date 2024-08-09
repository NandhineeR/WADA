import { Component, OnInit } from '@angular/core';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { isNullOrBlank } from '@shared/utils';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Component({
    selector: 'app-account-management',
    templateUrl: 'account-management.component.html',
})
export class AccountManagementComponent implements OnInit {
    athleteId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        this.athleteId$
            .pipe(
                filter((id: string) => !isNullOrBlank(id)),
                take(1)
            )
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .subscribe((_id: string) => {
                // Not yet implemented
            });
    }
}
