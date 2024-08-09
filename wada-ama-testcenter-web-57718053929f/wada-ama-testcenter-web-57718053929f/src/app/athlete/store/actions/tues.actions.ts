import { createAction, props } from '@ngrx/store';

export const InitTUEs = createAction(
    '[ATHLETE TUES] INIT TUES',

    props<{ athleteId: string }>()
);

export const GetAthleteTUEs = createAction(
    '[ATHLETE TUES] GET ATHLETE TUES',

    props<{ athleteId: string }>()
);

export const GetAthleteTUEsSuccess = createAction(
    '[ATHLETE TUES] GET ATHLETE TUES SUCCESS',

    props<{ tues: any }>()
);

export const GetAthleteTUEsError = createAction('[ATHLETE TUES] GET ATHLETE TUES ERROR');
