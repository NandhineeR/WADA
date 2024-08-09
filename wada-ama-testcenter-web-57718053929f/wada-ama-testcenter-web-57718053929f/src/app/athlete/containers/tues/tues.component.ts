import { Component, OnInit } from '@angular/core';
import { isNullOrBlank } from '@shared/utils';
import { filter, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@athlete/store';

@Component({
    selector: 'app-tues',
    templateUrl: 'tues.component.html',
})
export class TUEsComponent implements OnInit {
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
            .subscribe((id: string) => {
                this.store.dispatch(fromStore.InitTUEs({ athleteId: id }));
            });
    }
}
