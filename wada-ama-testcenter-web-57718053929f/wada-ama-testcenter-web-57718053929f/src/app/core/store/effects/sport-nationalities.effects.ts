import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import * as SportNationalitiesActions from '@core/store/actions/sport-nationalities.actions';
import * as SportNationalitiesSelectors from '@core/store/selectors/sport-nationalities.selectors';
import { CoreApiService } from '@core/services/core-api.service';
import { Country } from '@shared/models';
import { Action, Store, select } from '@ngrx/store';

@Injectable()
export class SportNationalitiesEffects {
    getSportNationalities$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SportNationalitiesActions.GetSportNationalities),
            withLatestFrom(this.store.pipe(select(SportNationalitiesSelectors.getSportNationalities))),
            filter(
                ([, sportNationalities]: [Action, Array<Country>]) =>
                    !Array.isArray(sportNationalities) || !sportNationalities.length
            ),
            switchMap(() => this.coreApi.getAllSportNationalities()),
            map((sportNationalities: Array<Country>) =>
                SportNationalitiesActions.GetSportNationalitiesSuccess({
                    sportNationalities,
                })
            ),
            catchError(() => of(SportNationalitiesActions.GetSportNationalitiesError()))
        )
    );

    constructor(
        private coreApi: CoreApiService,
        private actions$: Actions,
        private store: Store<fromRootStore.IState>
    ) {}
}
