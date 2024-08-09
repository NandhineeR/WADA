import { WhereaboutsFailure } from '@athlete/models';
import { createAction, props } from '@ngrx/store';

export const InitWhereabouts = createAction(
    '[ATHLETE WHEREABOUTS] INIT WHEREABOUTS',

    props<{ athleteId: string }>()
);

export const GetWhereaboutsFailures = createAction(
    '[ATHLETE WHEREABOUTS] GET WHEREABOUTS FAILURES',

    props<{ athleteId: string }>()
);

export const GetWhereaboutsFailuresSuccess = createAction(
    '[ATHLETE WHEREABOUTS] GET WHEREABOUTS FAILURES SUCCESS',

    props<{ whereaboutsFailures: Array<WhereaboutsFailure> }>()
);

export const GetWhereaboutsFailuresError = createAction('[ATHLETE WHEREABOUTS] GET WHEREABOUTS FAILURES ERROR');
