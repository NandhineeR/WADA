import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Contract } from '@core/models/contract.model';
import { Store } from '@ngrx/store';
import { DEFAULT_MAX_INTERVAL, DEFAULT_POLLING_INTERVAL, USER_INACTIVITY_TIMEOUT } from '@shared/models';
import { isNullOrBlank } from '@shared/utils';
import { isNotEmpty, isNullOrEmpty } from '@shared/utils/array-util';
import { getLocaleWritingDirection } from '@shared/utils/locale-util';
import { retryBackoff } from 'backoff-rxjs';
import { Observable, of, Subject, Subscription, timer } from 'rxjs';
import { catchError, distinctUntilChanged, first, map, mergeMap, switchMap } from 'rxjs/operators';
import { CoreApiService, TranslationMap, TranslationService } from '@core/services';
import * as fromStore from '@core/store';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    preferencesLoading$: Observable<boolean> = this.store.select(fromStore.getPreferencesLoading);

    backgroundImage = getRandomBackgroundImage();

    routeChangedSubscription?: Subscription;

    timerSubscription?: Subscription;

    userActivitySubscription?: Subscription;

    translations$ = this.translationService.translations$;

    showOverlay = false;

    fibonacci: Array<number> = [];

    selectedContract$: Observable<string | undefined> = this.store.select(fromStore.getSelectedContract);

    selectedContractHasBeenSet$: Observable<boolean> = this.store.select(fromStore.getSelectedContractHasBeenSet);

    getPreferencesLoading$ = this.store.select(fromStore.getPreferencesLoading);

    getContractLoading$ = this.selectedContractHasBeenSet$.pipe(map((hasBeenSet) => !hasBeenSet));

    selectedContractMustBeReset$: Observable<boolean> = this.store.select(fromStore.getSelectedContractMustBeReset);

    userActivityTimer: NodeJS.Timer;

    userBecameInactive: Subject<any> = new Subject();

    isUserActive = true;

    isPollingInProgress = false;

    isWindowFocused = true;

    writingDirection = 'ltr';

    // We only check for changes on the root part of the routes and ignore the subroutes
    routeChanged$ = this.store.select(fromStore.getActiveRouteUrl).pipe(
        map((url: string) => url.split('/')),
        map((parts: Array<string>) => (parts.length > 1 ? parts[1] : '')),
        distinctUntilChanged()
    );

    constructor(
        private store: Store<fromStore.IState>,
        private titleService: Title,
        private translationService: TranslationService,
        private coreService: CoreApiService,
        @Inject(LOCALE_ID) private locale: string
    ) {
        this.userActivityTimer = setTimeout(() => this.userBecameInactive.next(), USER_INACTIVITY_TIMEOUT);
    }

    ngOnInit(): void {
        this.writingDirection = getLocaleWritingDirection(this.locale);

        this.store.dispatch(fromStore.GetSelectedContract());

        this.translations$
            .pipe(
                map(
                    (translations: TranslationMap) => translations[this.translationService.getGlobalKey('title')],
                    first()
                )
            )
            .subscribe((title: string) => this.titleService.setTitle(title));

        this.routeChangedSubscription = this.routeChanged$.subscribe(() => {
            this.backgroundImage = getRandomBackgroundImage();
            window.scrollTo(0, 0);
        });

        this.initializeFibonacci();

        this.retrieveSelectedContract();

        this.userActivitySubscription = this.userBecameInactive.subscribe(() => {
            this.isUserActive = false;
            this.stopPolling();
        });

        window.addEventListener('focus', this.onWindowFocus.bind(this));
        window.addEventListener('blur', this.onWindowBlur.bind(this));
    }

    onWindowFocus(): void {
        this.isWindowFocused = true;
        this.startPolling();
    }

    onWindowBlur(): void {
        this.isWindowFocused = false;
        this.stopPolling();
    }

    setUserActivityTimeout(): void {
        this.userActivityTimer = setTimeout(() => this.userBecameInactive.next(), USER_INACTIVITY_TIMEOUT);
    }

    @HostListener('window:mousemove') refreshUserActivityState(): void {
        // if the user was inactive before, restart the polling
        if (!this.isUserActive && this.isWindowFocused) {
            this.startPolling();
            this.isUserActive = true;
        }

        clearTimeout(this.userActivityTimer);
        this.setUserActivityTimeout();
    }

    initializeFibonacci(): void {
        this.fibonacci[0] = 0;
        this.fibonacci[1] = 1000; // used for delays in ms
        for (let i = 2; i <= 10; i += 1) {
            this.fibonacci[i] = this.fibonacci[i - 2] + this.fibonacci[i - 1];
        }
    }

    // call with backoff mechanism in case of error
    retrieveSelectedContract(): void {
        this.coreService
            .getUserContracts(true)
            .pipe(
                map((selectedContracts: Array<Contract>) => this.initializeSelectedContract(selectedContracts)),
                retryBackoff({
                    initialInterval: DEFAULT_POLLING_INTERVAL,
                    maxInterval: DEFAULT_MAX_INTERVAL,
                    backoffDelay: (iteration: number, initialInterval: number) =>
                        this.getBackoffDelay(iteration, initialInterval),
                    shouldRetry: (err) => err instanceof HttpErrorResponse && this.isUserActive && this.isWindowFocused,
                })
            )
            .subscribe();
    }

    getBackoffDelay(iteration: number, initialInterval: number): number {
        return initialInterval + this.fibonacci[iteration];
    }

    initializeSelectedContract(selectedContracts: Array<Contract>): void {
        this.selectedContractMustBeReset$.subscribe((mustBeReset: boolean) => {
            if (mustBeReset && isNotEmpty(selectedContracts)) {
                this.store.dispatch(
                    fromStore.GetSelectedContractSuccess({
                        selectedContract: selectedContracts[0].organizationId,
                    })
                );
            } else {
                this.handleSelectedContractResponse(selectedContracts);
            }
        });

        this.startPolling();
    }

    handleSelectedContractResponse(selectedContracts: Array<Contract>): void {
        this.selectedContractHasBeenSet$.subscribe((hasBeenSet: boolean) => {
            if (hasBeenSet) {
                this.selectedContractHasChanged(selectedContracts).subscribe((hasChanged: boolean) => {
                    if (hasChanged) {
                        this.handleInvalidContract();
                    }
                });
            }
        });
    }

    selectedContractHasChanged(selectedContractsFromServer: Array<Contract>): Observable<boolean> {
        return this.selectedContract$.pipe(
            map((contractIdInStore: string | undefined) => {
                const isSelectedContractsNullOrEmpty = isNullOrEmpty(selectedContractsFromServer);
                const areBothNullOrEmpty = isNullOrBlank(contractIdInStore) && isSelectedContractsNullOrEmpty;
                // selected contract has changed IF
                // 1. the selected contracts list is null or empty but the selected contract id in store has a value OR
                // 2. the contract in the selected contracts list has a organization id different from the one saved in the store
                return (
                    !areBothNullOrEmpty &&
                    (isSelectedContractsNullOrEmpty || // case 1
                        (isNotEmpty(selectedContractsFromServer) &&
                            selectedContractsFromServer[0].organizationId !== contractIdInStore))
                ); // case 2
            }),
            switchMap((hasChanged: boolean) => of(hasChanged))
        );
    }

    handleSelectedContractError(): void {
        this.stopPolling();
        this.retrieveSelectedContract();
    }

    handleInvalidContract(): void {
        this.showOverlay = true;
        this.stopPolling();
    }

    startPolling(pollingInterval = DEFAULT_POLLING_INTERVAL): void {
        if (!this.isPollingInProgress) {
            this.isPollingInProgress = true;
            this.timerSubscription = timer(0, pollingInterval)
                .pipe(
                    mergeMap(() => this.coreService.getUserContracts(true)),
                    map((selectedContracts: Array<Contract>) => this.handleSelectedContractResponse(selectedContracts)),
                    catchError((err: HttpErrorResponse) => {
                        throw err;
                    })
                )
                .subscribe(
                    () => {
                        // Nothing to do
                    },
                    () => this.handleSelectedContractError()
                );
        }
    }

    stopPolling(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.isPollingInProgress = false;
        }
    }

    ngOnDestroy(): void {
        if (this.routeChangedSubscription) {
            this.routeChangedSubscription.unsubscribe();
        }

        if (this.userActivitySubscription) {
            this.userActivitySubscription.unsubscribe();
        }

        this.stopPolling();
    }
}

function getRandomBackgroundImage(): string {
    const images = [
        'archery.jpg',
        'athletics.jpg',
        'badminton.jpg',
        'baseball.jpg',
        'biathlon.jpg',
        'bobsleigh.jpg',
        'boxing.jpg',
        'canoe.jpg',
        'cricket.jpg',
        'curling.jpg',
        'cycling.jpg',
        'fencing.jpg',
        'football.jpg',
        'golf.jpg',
        'gymnastics.jpg',
        'jumper1.jpg',
        'jumper2.jpg',
        'karate.jpg',
        'para_athletics.jpg',
        'parahockey.jpg',
        'parariders.jpg',
        'pararun.jpg',
        'paraski.jpg',
        'paratennis.jpg',
        'run1.jpg',
        'run5.jpg',
        'sailing.jpg',
        'skating.jpg',
        'skier.jpg',
        'snowboarding.jpg',
        'soccer.jpg',
        'swim.jpg',
        'tabletennis.jpg',
        'tennis.jpg',
        'weight.jpg',
        'wrestling.jpg',
    ];
    return images[Math.floor(images.length * Math.random())]; // NOSONAR
}
