import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TDSSASheet } from '@tdssa/models';
import { Daterange } from '@shared/models';
import { TDSSAApiService } from '@tdssa/services';
import * as fromRootStore from '@core/store';
import * as TDSSAActions from '@tdssa/store/actions/tdssa-table.actions';
import * as TDSSAFormSelectors from '@tdssa/store/selectors/tdssa-form.selectors';

@Injectable()
export class TdssaEffects {
    getTDSSATable$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDSSAActions.GetTDSSATable),
            switchMap((action) => this.tdssaApi.getTDSSATable(action.startDate, action.endDate)),
            switchMap((tdssaSheet: TDSSASheet) => [
                TDSSAActions.SearchBarFilterTDSSATable({ query: '' }),
                TDSSAActions.GetTDSSATableSuccess({ sheet: tdssaSheet }),
            ]),
            catchError(() => of(TDSSAActions.GetTDSSATableError()))
        )
    );

    changeOrganizationView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromRootStore.ChangeOrganizationView),
            withLatestFrom(this.store.pipe(select(TDSSAFormSelectors.getDaterange))),
            map(([, dates]: [Action, Daterange]) =>
                TDSSAActions.GetTDSSATable({
                    startDate: new Date(dates.from),
                    endDate: new Date(dates.to),
                })
            )
        )
    );

    constructor(
        private store: Store<fromRootStore.IState>,
        private tdssaApi: TDSSAApiService,
        private actions$: Actions
    ) {}
}
