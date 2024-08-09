import { Action, createReducer, on } from '@ngrx/store';
import * as fromSportNationality from '@core/store/actions/sport-nationalities.actions';
import { initialSportNationalitiesState, ISportNationalitiesState } from '@core/store/states/sport-nationalities.state';

export const sportNationalitesReducer = createReducer(
    initialSportNationalitiesState,
    on(fromSportNationality.GetSportNationalities, (state) => ({
        ...state,
        loading: true,
        error: false,
    })),
    on(fromSportNationality.GetSportNationalitiesSuccess, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        sportNationalities: action.sportNationalities,
    })),
    on(fromSportNationality.GetSportNationalitiesError, (state) => ({
        ...state,
        loading: false,
        error: true,
        sportNationalities: [],
    }))
);

export function reducer(state: ISportNationalitiesState | undefined, action: Action): ISportNationalitiesState {
    return sportNationalitesReducer(state, action);
}
