import { Action, createReducer, on } from '@ngrx/store';
import * as fromSportDisciplines from '@core/store/actions/sport-disciplines.actions';
import { initialSportDisciplineState, ISportDisciplinesState } from '@core/store/states/sport-disciplines.state';

export const sportDisciplinesReducer = createReducer(
    initialSportDisciplineState,
    on(fromSportDisciplines.GetSportDisciplines, (state) => ({
        ...state,
        loading: true,
        error: false,
    })),
    on(fromSportDisciplines.GetSportDisciplinesSuccess, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        sportDisciplines: action.sportDisciplines,
    })),
    on(fromSportDisciplines.GetSportDisciplinesError, (state) => ({
        ...state,
        loading: false,
        error: true,
        sportDisciplines: [],
    }))
);

export function reducer(state: ISportDisciplinesState | undefined, action: Action): ISportDisciplinesState {
    return sportDisciplinesReducer(state, action);
}
