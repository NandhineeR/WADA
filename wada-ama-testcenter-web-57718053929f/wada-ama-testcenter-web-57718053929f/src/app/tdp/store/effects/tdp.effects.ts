import { Injectable } from '@angular/core';
import * as UserInfoSelectors from '@core/store/selectors/user-info.selectors';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromRouter from '@ngrx/router-store';
import { Action, select, Store } from '@ngrx/store';
import { Observable, of, timer } from 'rxjs';
import {
    catchError,
    concatMap,
    distinctUntilChanged,
    filter,
    first,
    map,
    mapTo,
    merge,
    mergeMap,
    startWith,
    switchMap,
    switchMapTo,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { ISportDisciplineDescription, IUser, SportDisciplineDescription } from '@core/models';
import * as fromRootStore from '@core/store';
import { mapTDPSheetInfoToTestPlanning, testPlanningToTDPSheet } from '@tdp/mappers/test-planning.mapper';
import { ISportDisciplineId, TDPSheet, TDPSheetInfo, Year } from '@tdp/models';
import { TestPlanningWrapper } from '@tdp/models/test-planning-wrapper.model';
import { TDPApiService } from '@tdp/services';
import * as TDPActions from '@tdp/store/actions/tdp.actions';
import * as TDPSelectors from '@tdp/store/selectors/tdp.selectors';

@Injectable()
export class TdpEffects {
    getSportDisciplinesIfEmpty$ = createEffect(() =>
        this.store.select(fromRootStore.getSportDisciplines).pipe(
            filter((sportDisciplines: Array<SportDisciplineDescription>) => sportDisciplines.length === 0),
            first(),
            mapTo(fromRootStore.GetSportDisciplines())
        )
    );

    changeOrganization$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromRootStore.ChangeOrganizationView),
            withLatestFrom(this.store.pipe(select(TDPSelectors.getRequestedYear))),
            map(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_action, currentYear]: [Action, number]) => {
                    return TDPActions.GetTDPTable({ year: currentYear });
                }
            )
        )
    );

    setTDPTableYear$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.SetTDPTableYear),
            map((action) => {
                const { year } = action;
                let yearOffset = 0;
                if (year === Year.Last) yearOffset = -1;
                if (year === Year.Next) yearOffset = 1;
                const yearValue = new Date().getFullYear() + yearOffset;
                return fromRootStore.Go({ path: ['tdp', yearValue] });
            })
        )
    );

    getTDPTable$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.GetTDPTable),
            mergeMap((action) => {
                // Dispatch a set requested year action followed by a polling of the GET endpoint.
                // The polling is reset each time a Get action is received or navigation occurs
                return of(TDPActions.SetTDPRequestedYear({ year: action.year })).pipe(
                    merge(
                        timer(0, 120 * 1000).pipe(
                            switchMapTo(this.store.select(TDPSelectors.getSaveError)),
                            switchMap((saveError: boolean) => {
                                return !saveError
                                    ? this.store.select(UserInfoSelectors.getUserProfile).pipe(
                                          switchMap((profile: IUser) =>
                                              this.tdpApi.getTDPSheet(action.year, profile.userId).pipe(
                                                  map((tdpSheet: TDPSheet) =>
                                                      TDPActions.GetTDPTableSuccess({
                                                          sheet: tdpSheet.initialize(),
                                                      })
                                                  ),
                                                  catchError((_error: any, effect: Observable<Action>) =>
                                                      effect.pipe(startWith(TDPActions.GetTDPTablesError()))
                                                  )
                                              )
                                          )
                                      )
                                    : [];
                            }),
                            takeUntil(this.actions$.pipe(ofType(TDPActions.GetTDPTable, fromRouter.ROUTER_NAVIGATION)))
                        )
                    )
                );
            })
        )
    );

    attemptSaveTDPTable$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.AttemptSaveTDPTable),
            switchMapTo(this.store.select(TDPSelectors.hasDirtyCells)),
            switchMap((isDirty: boolean) => {
                // Trigger the Save TDP Action only if there are dirty cells
                return isDirty ? [TDPActions.SaveTDPTable()] : [];
            })
        )
    );

    saveTable$ = createEffect(() =>
        this.store
            .pipe(
                select(TDPSelectors.getTDPSheet),
                distinctUntilChanged((prev: TDPSheet, curr: TDPSheet) => prev === curr)
            )
            .pipe(
                first(),
                map((dirtyTDPSheet: TDPSheet) => dirtyTDPSheet.clone()),
                tap((dirtyTDPSheetClone: TDPSheet) => dirtyTDPSheetClone.resetOverlappingValues()),
                withLatestFrom(this.store.select(TDPSelectors.hasDirtyCells)),
                filter(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([_dirtyTDPSheetClone, hasDirtyCell]: [TDPSheet, boolean]) => hasDirtyCell === true
                ),
                switchMap(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([dirtyTDPSheetClone, _hasDirtyCell]: [TDPSheet, boolean]) => {
                        return this.tdpApi.saveTDPSheet(
                            mapTDPSheetInfoToTestPlanning(dirtyTDPSheetClone),
                            dirtyTDPSheetClone
                        );
                    }
                )
            )
            .pipe(
                take(1),
                withLatestFrom(this.store.select(TDPSelectors.getTDPSheet)),
                map(([testPlanningWrapper, tdpSheet]: [TestPlanningWrapper, TDPSheet]) => {
                    return TDPActions.SaveTDPTableSuccess({
                        sheet: testPlanningToTDPSheet(tdpSheet, testPlanningWrapper),
                    });
                }),
                startWith(TDPActions.InitialTDPSaving())
            )
    );

    saveTDPTable$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.SaveTDPTable),
            concatMap(() => this.saveTable$),
            catchError((error, effect: Observable<Action>) => {
                return effect.pipe(startWith(TDPActions.SaveTDPTableError({ error: error.status })));
            })
        )
    );

    polling$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.SaveTDPTableError),
            switchMap(() =>
                timer(0, 15 * 1000).pipe(
                    switchMapTo(this.store.select(TDPSelectors.getSaveError)),
                    filter((error: boolean) => error),
                    withLatestFrom(this.store.select(TDPSelectors.getTDPSheet)),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    switchMap(([_saveError, tdpSheet]: [boolean, TDPSheet]) => {
                        return [TDPActions.SaveTDPTablePolling({ sheet: tdpSheet })];
                    }),
                    takeUntil(
                        this.actions$.pipe(
                            ofType(
                                TDPActions.SaveTDPTablePollingSuccess,
                                TDPActions.SaveTDPTableSuccess,
                                fromRouter.ROUTER_NAVIGATION
                            )
                        )
                    )
                )
            )
        )
    );

    pollingSave$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.SaveTDPTablePolling),
            switchMap((action) => this.tdpApi.saveTDPSheet(mapTDPSheetInfoToTestPlanning(action.sheet), action.sheet)),
            withLatestFrom(this.store.select(TDPSelectors.getTDPSheet)),
            map(([testPlanningWrapper, tdpSheet]: [TestPlanningWrapper, TDPSheet]) => {
                return TDPActions.SaveTDPTablePollingSuccess({
                    sheet: testPlanningToTDPSheet(tdpSheet, testPlanningWrapper),
                });
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(TDPActions.SaveTDPTablePollingError()))
            )
        )
    );

    addSportDiscipline$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.AddSportDiscipline),
            map((action) => action.sportDiscipline),
            withLatestFrom(this.store.select(TDPSelectors.getTDPSheet)),
            mergeMap(
                ([sportDiscipline, tdpSheet]: [ISportDisciplineDescription, TDPSheet]): Observable<Action> => {
                    const dirtyTDPSheet = tdpSheet.clone();
                    dirtyTDPSheet.resetOverlappingValues();

                    if (!dirtyTDPSheet.yearly[0].addSportDiscipline(sportDiscipline)) {
                        return of(
                            TDPActions.AddSportDisciplineSuccess({
                                sportDiscipline: {
                                    sportId: sportDiscipline.sportId,
                                    disciplineId: sportDiscipline.disciplineId,
                                },
                            })
                        );
                    }
                    dirtyTDPSheet.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) =>
                        tdpSheetInfo.addSportDiscipline(sportDiscipline)
                    );
                    dirtyTDPSheet.monthly.forEach((tdpSheetInfo: TDPSheetInfo) =>
                        tdpSheetInfo.addSportDiscipline(sportDiscipline)
                    );

                    return this.tdpApi.addRowToTDPSheet(sportDiscipline, dirtyTDPSheet.yearly[0].year).pipe(
                        switchMap((updatedTdpSheet: TDPSheet) => [
                            TDPActions.GetTDPTableSuccess({
                                sheet: updatedTdpSheet.initialize(),
                            }),
                            TDPActions.AddSportDisciplineSuccess({
                                sportDiscipline: {
                                    sportId: sportDiscipline.sportId,
                                    disciplineId: sportDiscipline.disciplineId,
                                },
                            }),
                        ]),
                        catchError((_error, effect: Observable<Action>) =>
                            effect.pipe(startWith(TDPActions.AddSportDisciplineError()))
                        )
                    );
                }
            )
        )
    );

    deleteSportDiscipline$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPActions.DeleteSportDiscipline),
            map((action) => action.sportDiscipline),
            withLatestFrom(this.store.select(TDPSelectors.getTDPSheet), this.store.select(TDPSelectors.getTDPYear)),
            mergeMap(
                ([sportDiscipline, tdpSheet, year]: [ISportDisciplineId, TDPSheet, number]): Observable<Action> => {
                    const dirtyTDPSheet: TDPSheet = tdpSheet.clone();
                    dirtyTDPSheet.resetOverlappingValues();

                    if (!dirtyTDPSheet.yearly[0].removeSportDiscipline(sportDiscipline)) {
                        return of(TDPActions.DeleteSportDisciplineError());
                    }
                    dirtyTDPSheet.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) =>
                        tdpSheetInfo.removeSportDiscipline(sportDiscipline)
                    );
                    dirtyTDPSheet.monthly.forEach((tdpSheetInfo: TDPSheetInfo) =>
                        tdpSheetInfo.removeSportDiscipline(sportDiscipline)
                    );

                    return this.tdpApi.removeRowFromTDPSheet(sportDiscipline.disciplineId, year).pipe(
                        switchMap((updatedTdpSheet: TDPSheet) => [
                            TDPActions.GetTDPTableSuccess({
                                sheet: updatedTdpSheet.initialize(),
                            }),
                            TDPActions.DeleteSportDisciplineSuccess({
                                sportDiscipline,
                            }),
                        ]),
                        catchError(() => of(TDPActions.DeleteSportDisciplineError()))
                    );
                }
            )
        )
    );

    constructor(private store: Store<fromRootStore.IState>, private tdpApi: TDPApiService, private actions$: Actions) {}
}
