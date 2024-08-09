import { createSelector } from '@ngrx/store';

import * as fromRoot from '@core/store/reducers';
import { ISportDisciplinesState } from '@core/store/states/sport-disciplines.state';

export const getSportDisciplinesState = (state: fromRoot.IState) => state.sportDisciplines;

export const getSportDisciplines = createSelector(
    getSportDisciplinesState,
    (state: ISportDisciplinesState) => state.sportDisciplines
);

export const getSportDisciplinesLoading = createSelector(
    getSportDisciplinesState,
    (state: ISportDisciplinesState) => state.loading
);

export const getSportDisciplinesError = createSelector(
    getSportDisciplinesState,
    (state: ISportDisciplinesState) => state.error
);
