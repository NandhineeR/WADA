import { Component, OnInit } from '@angular/core';
import { filter, map, take } from 'rxjs/operators';
import { isNullOrBlank } from '@shared/utils';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { SportIdentity } from '@athlete/models';
import * as fromRootStore from '@core/store';
import * as fromStore from '@athlete/store';
import { Athlete } from '@shared/models';

@Component({
    selector: 'app-step-1',
    templateUrl: './athlete-dashboard.component.html',
    styleUrls: ['./athlete-dashboard.component.scss'],
})
export class AthleteDashboardComponent implements OnInit {
    athlete$: Observable<Athlete | null> = this.store.pipe(select(fromStore.getAthlete));

    athleteId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    sportIdentities$: Observable<Array<SportIdentity>> = this.store.pipe(select(fromStore.getSportIdentities));

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        this.athleteId$
            .pipe(
                filter((id: string) => !isNullOrBlank(id)),
                take(1)
            )
            .subscribe((id: string) => {
                this.store.dispatch(fromStore.InitDashboard({ athleteId: id }));
            });
    }
}
