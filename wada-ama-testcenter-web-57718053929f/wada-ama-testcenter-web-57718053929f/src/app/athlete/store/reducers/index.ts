import { createFeatureSelector } from '@ngrx/store';
import * as fromModels from '@athlete/store/states/athlete.state';
import * as fromAthleteReducer from './athlete.reducer';

export type IAthleteState = fromModels.IAthleteState;

export const getAthleteState = createFeatureSelector<IAthleteState>('athlete');

export const athleteReducers = fromAthleteReducer.reducer;

export * from '@athlete/store/states/athlete.state';
