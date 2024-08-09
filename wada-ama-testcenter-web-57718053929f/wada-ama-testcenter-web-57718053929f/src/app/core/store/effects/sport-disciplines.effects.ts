import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as SportDisciplinesActions from '@core/store/actions/sport-disciplines.actions';
import { SportDisciplineDescription } from '@core/models';
import { CoreApiService } from '@core/services/core-api.service';

@Injectable()
export class SportDisciplinesEffects {
    getSportDisciplines$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SportDisciplinesActions.GetSportDisciplines),
            mergeMap(() => {
                return this.coreApi.getAllDisciplines(new Date().getFullYear()).pipe(
                    map((sportDisciplines: Array<SportDisciplineDescription>) =>
                        SportDisciplinesActions.GetSportDisciplinesSuccess({ sportDisciplines })
                    ),
                    catchError(() => of(SportDisciplinesActions.GetSportDisciplinesError()))
                );
            })
        )
    );

    constructor(private coreApi: CoreApiService, private actions$: Actions) {}
}
