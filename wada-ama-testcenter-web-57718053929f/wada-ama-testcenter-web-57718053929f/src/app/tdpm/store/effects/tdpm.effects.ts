import { Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TDPMApiService } from '@tdpm/services';
import { TDPMSheetInfo } from '@tdpm/models';
import { FromToDate } from '@shared/models';
import * as fromRootStore from '@core/store';
import * as TDPMActions from '@tdpm/store/actions/tdpm.actions';
import * as TDPMSelectors from '@tdpm/store/selectors/tdpm-filters.selectors';

@Injectable()
export class TdpmEffects {
    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private tdpmApi: TDPMApiService
    ) {}

    getTDPMTable$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPMActions.getTDPMTable),
            switchMap((action) =>
                this.tdpmApi.getTDPMSheetInfos(
                    action.fromToDate.fromMonth,
                    action.fromToDate.fromYear,
                    action.fromToDate.toMonth,
                    action.fromToDate.toYear
                )
            ),
            map((tdpmSheet: TDPMSheetInfo) => TDPMActions.getTDPMTableSuccess({ tdpmSheet })),
            catchError(() => of(TDPMActions.getTDPMTablesError()))
        )
    );

    changeOrganization$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromRootStore.ChangeOrganizationView),
            withLatestFrom(this.store.pipe(select(TDPMSelectors.getDateRange))),
            map(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_action, date]: [Action, FromToDate]) => TDPMActions.getTDPMTable({ fromToDate: date })
            )
        )
    );
}
