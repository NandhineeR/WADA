import { Test } from '@to/models';
import { createAction, props } from '@ngrx/store';

export const InitAthleteTests = createAction(
    '[ATHLETE TESTS] INIT ATHLETE TESTS',

    props<{ athleteId: string }>()
);

export const GetAthleteTests = createAction(
    '[ATHLETE TESTS] GET ATHLETE TESTS',

    props<{ athleteId: string }>()
);

export const GetAthleteTestsSuccess = createAction(
    '[ATHLETE TESTS] GET ATHLETE TESTS SUCCESS',

    props<{ tests: Array<Test> }>()
);

export const GetAthleteTestsError = createAction('[ATHLETE TESTS] GET ATHLETE TESTS ERROR');
