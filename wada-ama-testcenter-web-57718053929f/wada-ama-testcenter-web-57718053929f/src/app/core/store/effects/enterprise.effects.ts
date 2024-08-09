import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import * as EnterpriseActions from '@core/store/actions/enterprise.actions';
import { Action } from '@ngrx/store';
import { TOApiService } from '@to/services';

@Injectable()
export class EnterpriseEffects {
    getDcfDataRetentionPeriod$ = createEffect(() =>
        this.actions$.pipe(
            ofType(EnterpriseActions.GetDcfDataRetentionPeriod),
            switchMap(() => this.testingOrderService.getEnterpriseProperty('data.retention.test.incomplete')),
            switchMap((enterpriseProperty: any) => [
                EnterpriseActions.GetDcfDataRetentionPeriodSuccess({
                    dcfRetentionPeriod: enterpriseProperty.value,
                }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(EnterpriseActions.GetDcfDataRetentionPeriodError()));
            })
        )
    );

    getDcfDecommissionStartDate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(EnterpriseActions.GetDcfDecommissionStartDate),
            switchMap(() => this.testingOrderService.getEnterpriseProperty('dcf.decommission.start.date')),
            switchMap((enterpriseProperty: any) => [
                EnterpriseActions.GetDcfDecommissionStartDateSuccess({
                    dcfDecommissionStartDate: enterpriseProperty.value,
                }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(EnterpriseActions.GetDcfDecommissionStartDateError()));
            })
        )
    );

    getMaxMOResults$ = createEffect(() =>
        this.actions$.pipe(
            ofType(EnterpriseActions.GetMaxMOResults),
            switchMap((action) => this.testingOrderService.getEnterpriseProperty(action.property)),
            switchMap((enterpriseProperty: any) => [
                EnterpriseActions.GetMaxMOResultsSuccess({ maxMOResults: enterpriseProperty.value }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(EnterpriseActions.GetMaxMOResultsSuccess({ maxMOResults: null })));
            })
        )
    );

    getMaxNumberAdos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(EnterpriseActions.GetMaxNumberAdos),
            switchMap(() => this.testingOrderService.getEnterpriseProperty('max.number.ados')),
            switchMap((enterpriseProperty: any) => [
                EnterpriseActions.GetMaxNumberAdosSuccess({ maxNumberAdos: enterpriseProperty.value }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(EnterpriseActions.GetMaxNumberAdosError()));
            })
        )
    );

    getSampleCollectionDateInUtcStartDate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(EnterpriseActions.GetSampleCollectionDateInUtcStartDate),
            switchMap(() => this.testingOrderService.getEnterpriseProperty('sample.collection.date.in.utc.start.date')),
            switchMap((enterpriseProperty: any) => [
                EnterpriseActions.GetSampleCollectionDateInUtcStartDateSuccess({
                    sampleCollectionDateInUtcStartDate: enterpriseProperty.value,
                }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(EnterpriseActions.GetSampleCollectionDateInUtcStartDateError()));
            })
        )
    );

    getToDecommissionStartDate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(EnterpriseActions.GetToDecommissionStartDate),
            switchMap(() => this.testingOrderService.getEnterpriseProperty('to.decommission.start.date')),
            switchMap((enterpriseProperty: any) => [
                EnterpriseActions.GetToDecommissionStartDateSuccess({
                    toDecommissionStartDate: enterpriseProperty.value,
                }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(EnterpriseActions.GetToDecommissionStartDateError()));
            })
        )
    );

    constructor(private actions$: Actions, private testingOrderService: TOApiService) {}
}
