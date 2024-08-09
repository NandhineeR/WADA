import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { LocalizedEntity, SecurityWrapper } from '@shared/models';
import { mapUAFromUAForm } from '@to/mappers';
import { UA, UAAutoCompletes, UAForm, UATest } from '@to/models/unsuccessful-attempt';
import { UAApiService } from '@to/services';
import { NEVER, Observable } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';
import { NavigationExtras } from '@angular/router';
import * as fromRootStore from '@core/store';
import * as UASelectors from '@to/store/selectors/ua.selectors';
import * as UAActions from '@to/store/actions';
import { ConflictException } from '@core/models';
import { Exception } from '@core/models/exception';

@Injectable()
export class UAEffects {
    getAutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.GetAutoCompletes),
            withLatestFrom(this.store.pipe(select(UASelectors.getUASCAId))),
            filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_action, scaId]: [Action, any]) => scaId !== null
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            switchMap(([_action, scaId]: [Action, number]) => this.uaApi.getAutoCompletes(scaId)),
            map((autocomplete: UAAutoCompletes) => UAActions.GetAutoCompletesSuccess({ autocomplete })),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(UAActions.GetAutoCompletesError()));
            })
        )
    );

    getTests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.GetTests),
            switchMap((action) => this.uaApi.getUATests(action.ids)),
            switchMap((tests: Array<UATest>) => [UAActions.GetTestsSuccess({ tests }), UAActions.GetAutoCompletes()]),
            catchError((_error: any, effect: Observable<Action>) => {
                const exception = this.handleUAError(_error.error);
                return effect.pipe(startWith(UAActions.GetTestsError({ error: exception })));
            })
        )
    );

    getUAs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.GetUAs),
            switchMap((action) => this.uaApi.getUAs(action.ids)),
            switchMap((uaSecurityWrappers: Array<SecurityWrapper<UA>>) => [
                UAActions.GetUAsSuccess({ uas: uaSecurityWrappers }),
                UAActions.GetAutoCompletes(),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                const exception = this.handleUAError(_error.error);
                return effect.pipe(startWith(UAActions.GetUAsError({ error: exception })));
            })
        )
    );

    goToTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.GoToTestingOrder),
            tap(() => this.store.dispatch(UAActions.ResetUA())),
            map((action) => fromRootStore.Go({ path: ['to', 'view', action.id] }))
        )
    );

    goToViewUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.GoToViewUA),
            withLatestFrom(this.store.pipe(select(UASelectors.getUAIds))),
            filter(([, ids]: [any, Array<string>]) => ids.length > 0),
            switchMap(([, ids]: [any, Array<string>]) => {
                const navigationExtras: NavigationExtras = {
                    queryParams: { id: ids.toString() },
                };

                return [
                    fromRootStore.Go({
                        path: ['to', 'ua', 'view'],
                        extras: navigationExtras,
                    }),
                ];
            })
        )
    );

    initCreateUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.InitCreateUA),
            switchMap((action) => [UAActions.GetTests({ ids: action.ids })])
        )
    );

    initEditUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.InitEditUA),
            switchMap((action) => [UAActions.GetUAs({ ids: action.ids })])
        )
    );

    initViewUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.InitViewUA),
            switchMap((action) => [UAActions.GetUAs({ ids: action.ids })])
        )
    );

    saveAllUAs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.SaveAllUAs),
            withLatestFrom(
                this.store.pipe(
                    select(UASelectors.getAttemptMethods),
                    map((localizedEntities: LocalizedEntity[] | null) => localizedEntities?.filter(Boolean) || [])
                )
            ),
            switchMap(([action, attempts]: [any, Array<LocalizedEntity>]) =>
                this.uaApi.saveUAAll(
                    action.data.map((item: { uaForm: UAForm; ua: UA }) =>
                        mapUAFromUAForm(item.uaForm, attempts, item.ua)
                    )
                )
            ),
            map((uas: Array<UA>) => UAActions.SaveAllUAsSuccess({ uas })),
            catchError((_error: any, effect: Observable<Action>) => {
                const exception = this.handleUAError(_error.error);
                return effect.pipe(startWith(UAActions.SaveAllUAsError({ error: exception })));
            })
        )
    );

    redirectToViewUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.SaveAllUAsSuccess),
            switchMapTo(this.store.pipe(select(UASelectors.getIsEveryUASaved))),
            switchMap((allSaved: boolean) => {
                if (allSaved) {
                    return [UAActions.GoToViewUA()];
                }
                return NEVER;
            })
        )
    );

    cancelUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.CancelUA),
            withLatestFrom(this.store.select(UASelectors.getIsEditMode)),
            switchMap(([, isEditMode]: [any, boolean]) => {
                if (isEditMode) {
                    return [UAActions.GoToViewUA()];
                }
                return [UAActions.BackToTestingOrder()];
            })
        )
    );

    backToTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.BackToTestingOrder),
            withLatestFrom(this.store.pipe(select(UASelectors.getTOIdOrigin))),
            map(([, id]: [any, string | null]) => id || ''),
            switchMap((id: string) => [UAActions.GoToTestingOrder({ id })])
        )
    );

    deleteUA$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UAActions.DeleteUA),
            switchMap((action) => this.uaApi.deleteUA(action.testId, action.unsuccessfulAttemptId, action.reason)),
            map((unsuccessfulAttemptId: string) => UAActions.DeleteUASuccess({ unsuccessfulAttemptId })),
            catchError((effect: Observable<Action>) => effect.pipe(startWith(UAActions.DeleteUAError())))
        )
    );

    constructor(private store: Store<fromRootStore.IState>, private uaApi: UAApiService, private actions$: Actions) {}

    private handleUAError(error: any): Exception {
        if (error.status === 409) return new ConflictException(error);
        return new Exception(error.status, error.code, error.message, error.messageKey);
    }
}
