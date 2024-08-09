import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import * as fromRootStore from '@core/store';

@Component({
    selector: 'app-add-athlete',
    templateUrl: './add-athlete.component.html',
})
export class AddAthleteComponent implements OnInit, OnDestroy {
    route: fromRootStore.RouterStateUrl | null = null;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.store
                .pipe(select(fromRootStore.getActiveRoute), first())
                .subscribe((route: fromRootStore.RouterStateUrl) => {
                    if (this.route === null) {
                        this.route = route;
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
