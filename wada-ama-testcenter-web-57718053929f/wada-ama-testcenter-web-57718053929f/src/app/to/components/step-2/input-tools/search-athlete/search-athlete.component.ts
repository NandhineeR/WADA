import { ModalComponent } from '@shared/components/modal/modal.component';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { SearchComponent } from '@to/components';
import { Observable, Subscription } from 'rxjs';
import { SearchAthleteResult, SearchAthleteRow } from '@to/models';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { StatusEnum } from '@shared/models';
import { SearchResultsTableComponent } from './search-results-table/search-results-table.component';

type RouterStateUrl = fromRootStore.RouterStateUrl;

@Component({
    selector: 'app-search-athlete',
    templateUrl: './search-athlete.component.html',
    styleUrls: ['./search-athlete.component.scss'],
})
export class SearchAthleteComponent {
    readonly IS_BIND_ATHLETE = 'isBindAthlete';

    @ViewChild('search', { static: true }) set search(template: SearchComponent) {
        this.searchComponent = template;
    }

    @ViewChild(ModalComponent, { static: true }) modal?: ModalComponent;

    @ViewChild('searchResultTable', { static: true })
    searchResultComponent?: SearchResultsTableComponent;

    @Output()
    readonly redirectToDcf: EventEmitter<boolean> = new EventEmitter<boolean>();

    isTOIssued$: Observable<boolean> = this.store.pipe(
        select(fromStore.getTOStatus),
        map((status) => status === StatusEnum.Issued)
    );

    loadingSearch$ = this.store.pipe(select(fromStore.getIsLoadingAthletes));

    searchResult$: Observable<Array<SearchAthleteResult>> = this.store.pipe(select(fromStore.getSearchedAthleteResult));

    sportDisciplines$ = this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesSportDisciplines));

    route$: Observable<RouterStateUrl> = this.store.pipe(select(fromRootStore.getActiveRoute));

    urlWithoutParenthesis$: Observable<string> = this.store.pipe(
        select(fromRootStore.getActiveRouteUrlWithoutParenthesis())
    );

    isBindAthlete = false;

    isModalLocked = true;

    isSearchAthletes = true;

    numberOfAthletesExcess = 0;

    searchAthleteRows: Array<SearchAthleteRow> = [];

    searchComponent: SearchComponent | null = null;

    searchError = false;

    searchLengthError = false;

    searchStringText: string | undefined = undefined;

    selectedTestId = '';

    subscriptions: Subscription = new Subscription();

    constructor(
        private router: Router,
        private store: Store<fromRootStore.IState>,
        public activatedRoute: ActivatedRoute
    ) {
        const { queryParamMap } = this.activatedRoute.snapshot;
        this.isBindAthlete = queryParamMap.has(this.IS_BIND_ATHLETE);
        this.isSearchAthletes = !this.isBindAthlete;
        const navigation = this.router?.getCurrentNavigation() || null;

        if (navigation && navigation.extras && navigation.extras.state) {
            this.selectedTestId = navigation.extras.state.testId;
        }

        this.subscriptions.add(
            this.store.select(fromStore.getAthletesError).subscribe((searchError: boolean) => {
                this.searchError = searchError;
                if (searchError) {
                    this.clearSearch();
                }
            })
        );
    }

    clearSearch(): void {
        if (this.searchResultComponent) {
            this.searchResultComponent.resetSearchAthletesData();
        }
        this.isModalLocked = false;
    }

    closeModal(): void {
        if (this.modal) {
            this.modal.closeModal(true);
        }
    }

    resetResearch(): void {
        this.searchComponent?.resetResearch();
    }

    searchAthlete($event: string): void {
        this.searchStringText = $event;
        this.store.dispatch(fromStore.Step2SearchAthletes({ searchString: $event }));
    }

    setNumberOfAthletesExcess(numberOfAthletesExcess: number): void {
        this.numberOfAthletesExcess = numberOfAthletesExcess;
    }

    showSearchLengthError(searchLengthError: boolean): void {
        this.searchLengthError = searchLengthError;
    }

    get isMaxNumberOfAthletesExceeded(): boolean {
        return this.numberOfAthletesExcess > 0;
    }
}
