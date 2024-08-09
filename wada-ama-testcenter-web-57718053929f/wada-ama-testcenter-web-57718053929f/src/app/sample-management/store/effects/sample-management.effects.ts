import { Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, Observable } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, take } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import { isNullOrBlank } from '@shared/utils';
import * as DCFSelectors from '@dcf/store/selectors/dcf.selectors';
import * as SampleManagementActions from '@sampleManagement/store/actions';
import * as TestingOrderSelectors from '@to/store/selectors';
import { SampleManagementApiService } from '@sampleManagement/services';
import { Sample } from '@sampleManagement/models';
import { Test } from '@shared/models';

/**
 * NOTE:
 * The objective of sample management is to utilize endpoints within the Sample Management module in Mendix.
 */
@Injectable()
export class SampleManagementEffects {
    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private sampleManagementService: SampleManagementApiService
    ) {}

    getAnalysisSamples$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SampleManagementActions.GetAnalysisSamples),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(
                        select(TestingOrderSelectors.getTOId),
                        map((testingOrderId) => testingOrderId?.toString() || '')
                    ),
                ])
            ),
            filter(([testingOrderId]: [any]) => !isNullOrBlank(testingOrderId)),
            switchMap(([testingOrderId]: [string]) => this.sampleManagementService.getAnalysisSamples(testingOrderId)),
            map((object) => SampleManagementActions.GetAnalysisSamplesSuccess({ object })),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(SampleManagementActions.GetAnalysisSamplesError()));
            })
        )
    );

    getTestInformation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SampleManagementActions.GetTestInformation),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(
                        select(DCFSelectors.getTest),
                        map((test: Test | null) => test?.id.toString() || '')
                    ),
                ])
            ),
            filter(([testId]: [any]) => !isNullOrBlank(testId)),
            switchMap(([testId]: [string]) => this.sampleManagementService.getTestInformation(testId)),
            map((samples: Array<Sample>) => SampleManagementActions.GetTestInformationSuccess({ samples })),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(SampleManagementActions.GetTestInformationError()));
            })
        )
    );

    /**
     * Given that the sync process relies on samples, it's unnecessary to notify the Sample Management Platform
     * if there are no samples in the DCF.
     */
    notifyTest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SampleManagementActions.NotifyTest),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(select(DCFSelectors.getTestId), take(1)),
                    this.store.pipe(select(DCFSelectors.getSamples), take(1)),
                ])
            ),
            filter(([testId, samples]: [any, any]) => !isNullOrBlank(testId) && samples.length > 0),
            switchMap(([testId]: [string, any]) => this.sampleManagementService.notifyTest(testId)),
            switchMap(() => []),
            catchError((error: any, effect: Observable<Action>) => {
                console.log(error);
                return effect.pipe(startWith(SampleManagementActions.NotifyTestError()));
            })
        )
    );

    /**
     * Given that the sync process relies on analyses, it's unnecessary to notify the Sample Management Platform
     * if there are no analyses in the Testing Order.
     */
    notifyTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SampleManagementActions.NotifyTestingOrder),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(
                        select(TestingOrderSelectors.getTOId),
                        map((testingOrderId) => testingOrderId?.toString() || '')
                    ),
                    this.store.pipe(select(TestingOrderSelectors.getTOAllAnalyses), take(1)),
                ])
            ),
            filter(
                ([testingOrderId, analyses]: [string, any]) => !isNullOrBlank(testingOrderId) && analyses.length > 0
            ),
            switchMap(([testingOrderId]: [string, any]) =>
                this.sampleManagementService.notifyTestingOrder(testingOrderId)
            ),
            switchMap(() => []),
            catchError((error: any, effect: Observable<Action>) => {
                console.log(error);
                return effect.pipe(startWith(SampleManagementActions.NotifyTestingOrderError()));
            })
        )
    );
}
