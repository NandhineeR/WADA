import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import * as TDPMFiltersActions from '@tdpm/store/actions/tdpm-filters.actions';
import * as TDPMActions from '@tdpm/store/actions/tdpm.actions';
import { TDPMApiService } from '@tdpm/services';
import * as fromRootStore from '@core/store';
import { FromToDate } from '@shared/models';

@Injectable()
export class TdpmFiltersEffects {
    refreshTDPMSportDisciplineFilter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPMActions.getTDPMTable),
            map(() => TDPMActions.searchBarFilterTDPMTable({ query: '' }))
        )
    );

    refreshTDPMTable$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TDPMFiltersActions.setTDPMTablesDate),
            map((action) => action.fromToDate),
            map((date: FromToDate) => TDPMActions.getTDPMTable({ fromToDate: date }))
        )
    );

    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private tdpmApi: TDPMApiService
    ) {}
}
