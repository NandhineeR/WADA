import { createSelector } from '@ngrx/store';
import { SportIdentity } from '@athlete/models/sport-identity.model';
import { getAthleteState } from '@athlete/store/reducers';
import { IAthleteState } from '@athlete/store/states/athlete.state';

export const getAthlete = createSelector(getAthleteState, (state: IAthleteState) => state.athlete);

export const getSportIdentities = createSelector(getAthleteState, (state: IAthleteState) => state.sportIdentities);

export const getSportDisciplines = createSelector(getSportIdentities, (state: Array<SportIdentity>) => {
    return state.map((sportIdentity: SportIdentity) => sportIdentity.sportDiscipline);
});
