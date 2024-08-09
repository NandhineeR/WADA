import { Action, createReducer, on } from '@ngrx/store';
import * as fromViewTDSSAFormState from '@tdssa/store/states/tdssa-form.state';
import * as fromTDSSAForm from '@tdssa/store/actions';
import { Country } from '@shared/models';

type ITDSSAFormState = fromViewTDSSAFormState.ITDSSAFormState;

export const TdssaFormReducer = createReducer(
    fromViewTDSSAFormState.initialState,
    on(fromTDSSAForm.ResetTDSSAForm, () => {
        return {
            daterange: {
                from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                to: new Date().toISOString(),
                quickFilter: {
                    value: 'yearToDate',
                    displayName: 'Year to Date',
                },
            },
            athleteInternational: true,
            athleteNational: true,
            athleteOther: false,
            testTypeInCompetition: true,
            testTypeOutCompetition: true,
            sportNationality: new Array<Country>(),
        };
    }),
    on(fromTDSSAForm.SetTDSSAFormAthleteInternational, (state, action) => ({
        ...state,
        athleteInternational: action.value,
    })),
    on(fromTDSSAForm.SetTDSSAFormAthleteNational, (state, action) => ({
        ...state,
        athleteNational: action.value,
    })),
    on(fromTDSSAForm.SetTDSSAFormAthleteOther, (state, action) => ({
        ...state,
        athleteOther: action.value,
    })),
    on(fromTDSSAForm.SetTDSSAFormDateRange, (state, action) => ({
        ...state,
        daterange: action.value,
    })),
    on(fromTDSSAForm.SetTDSSAFormSportNationality, (state, action) => ({
        ...state,
        sportNationality: action.value,
    })),
    on(fromTDSSAForm.SetTDSSAFormTestTypeInCompetition, (state, action) => ({
        ...state,
        testTypeInCompetition: action.value,
    })),
    on(fromTDSSAForm.SetTDSSAFormTestTypeOutCompetition, (state, action) => ({
        ...state,
        testTypeOutCompetition: action.value,
    }))
);

export function reducer(state: ITDSSAFormState | undefined, action: Action): ITDSSAFormState {
    return TdssaFormReducer(state, action);
}
