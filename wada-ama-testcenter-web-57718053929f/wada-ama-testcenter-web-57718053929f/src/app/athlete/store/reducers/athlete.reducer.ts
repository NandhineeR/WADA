import { Action, createReducer, on } from '@ngrx/store';
import { IAthleteState, initialAthleteState } from '@athlete/store/states/athlete.state';
import * as fromAthleteActions from '@athlete/store/actions';

const athleteReducer = createReducer(
    initialAthleteState,
    on(fromAthleteActions.GetAthleteSuccess, (state, action) => ({
        ...state,
        athlete: action.athlete,
    })),
    on(fromAthleteActions.GetAthleteError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetAddressesSuccess, (state, action) => ({
        ...state,
        addresses: action.addresses,
    })),
    on(fromAthleteActions.GetAddressesError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetPhonesSuccess, (state, action) => ({
        ...state,
        phones: action.phones,
    })),
    on(fromAthleteActions.GetPhonesError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetSportIdentitiesSuccess, (state, action) => ({
        ...state,
        sportIdentities: action.sportIdentities,
    })),
    on(fromAthleteActions.GetSportIdentitiesError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetCompetitionLevelsSuccess, (state, action) => ({
        ...state,
        competitionLevels: action.competitionLevels,
    })),
    on(fromAthleteActions.GetCompetitionLevelsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetTestPoolsSuccess, (state, action) => ({
        ...state,
        testPools: action.testPools,
    })),
    on(fromAthleteActions.GetTestPoolsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetMajorEventsSuccess, (state, action) => ({
        ...state,
        majorEvents: action.majorEvents,
    })),
    on(fromAthleteActions.GetMajorEventsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetWhereaboutsSuccess, (state, action) => ({
        ...state,
        whereabouts: action.whereabouts,
    })),
    on(fromAthleteActions.GetWhereaboutsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetBloodPassportsSuccess, (state, action) => ({
        ...state,
        bloodPassports: action.bloodPassports,
    })),
    on(fromAthleteActions.GetBloodPassportsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetSteroidPassportsSuccess, (state, action) => ({
        ...state,
        steroidPassports: action.steroidPassports,
    })),
    on(fromAthleteActions.GetSteroidPassportsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetTestingMetadataSuccess, (state, action) => ({
        ...state,
        testingMetadata: action.testingMetadata,
    })),
    on(fromAthleteActions.GetTestingMetadataError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetAthleteAgentsSuccess, (state, action) => ({
        ...state,
        athleteAgents: action.athleteAgents,
    })),
    on(fromAthleteActions.GetAthleteAgentsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetAthleteTestsSuccess, (state, action) => ({
        ...state,
        tests: action.tests,
    })),
    on(fromAthleteActions.GetAthleteTestsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetWhereaboutsFailuresSuccess, (state, action) => ({
        ...state,
        whereaboutsFailures: action.whereaboutsFailures,
    })),
    on(fromAthleteActions.GetWhereaboutsFailuresError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetAthleteTUEsSuccess, (state, action) => ({
        ...state,
        tues: action.tues,
    })),
    on(fromAthleteActions.GetAthleteTUEsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetAthleteADRVsSuccess, (state, action) => ({
        ...state,
        adrvs: action.adrvs,
    })),
    on(fromAthleteActions.GetAthleteADRVsError, (state) => ({
        ...state,
        error: true,
    })),

    on(fromAthleteActions.GetAthleteSanctionsSuccess, (state, action) => ({
        ...state,
        sanctions: action.sanctions,
    })),
    on(fromAthleteActions.GetAthleteSanctionsError, (state) => ({
        ...state,
        error: true,
    }))
);

export function reducer(state: IAthleteState, action: Action): IAthleteState {
    return athleteReducer(state, action);
}
