import { Component, OnDestroy, OnInit } from '@angular/core';
import { AthleteActivePage } from '@athlete/models';
import { filter, map, take } from 'rxjs/operators';
import { isNullOrBlank } from '@shared/utils';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { Athlete, SportDiscipline } from '@shared/models';
import * as fromRootStore from '@core/store';
import * as fromStore from '@athlete/store';
import { urlToActivePage } from '@athlete/utils';

@Component({
    selector: 'app-athlete-page',
    templateUrl: './athlete-page.component.html',
    styleUrls: ['./athlete-page.component.scss'],
})
export class AthletePageComponent implements OnInit, OnDestroy {
    athlete$: Observable<Athlete | null> = this.store.pipe(select(fromStore.getAthlete));

    athleteId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    sportDisciplines$: Observable<Array<SportDiscipline | null>> = this.store.pipe(
        select(fromStore.getSportDisciplines)
    );

    urlWithoutParenthesis$: Observable<string> = this.store.pipe(select(fromRootStore.getActiveRouteUrl));

    activePage = AthleteActivePage;

    currentDate = new Date();

    currentPage: AthleteActivePage | null = null;

    pageHasBeenLoaded = true;

    subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.urlWithoutParenthesis$.subscribe((url: string) => {
                this.currentPage = urlToActivePage(url);
            })
        );

        this.athleteId$
            .pipe(
                filter((id: string) => !isNullOrBlank(id)),
                take(1)
            )
            .subscribe((id: string) => {
                this.store.dispatch(fromStore.InitAthletePage({ athleteId: id }));
            });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Opens popup so user can upload image to profile from local storage
     */
    uploadImage(): void {}
}
