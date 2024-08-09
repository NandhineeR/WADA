import { createSelector } from '@ngrx/store';

import * as fromRoot from '@core/store/reducers';
import { ISportNationalitiesState } from '@core/store/states/sport-nationalities.state';

export const getSportNationalitiesState = (state: fromRoot.IState) => state.sportNationalities;

export const getSportNationalities = createSelector(
    getSportNationalitiesState,
    (state: ISportNationalitiesState) => state.sportNationalities
);

export const getSportNationalitiesLoading = createSelector(
    getSportNationalitiesState,
    (state: ISportNationalitiesState) => state.loading
);

export const getSportNationalitiesError = createSelector(
    getSportNationalitiesState,
    (state: ISportNationalitiesState) => state.error
);
