import { createAction, props } from '@ngrx/store';

export const InitSanctions = createAction(
    '[ATHLETE SANCTIONS] INIT SANCTIONS',

    props<{ athleteId: string }>()
);

export const GetAthleteSanctions = createAction(
    '[ATHLETE SANCTIONS] GET ATHLETE SANCTIONS',

    props<{ athleteId: string }>()
);

export const GetAthleteSanctionsSuccess = createAction(
    '[ATHLETE SANCTIONS] GET ATHLETE SANCTIONS SUCCESS',

    props<{ sanctions: any }>()
);

export const GetAthleteSanctionsError = createAction('[ATHLETE SANCTIONS] GET ATHLETE SANCTIONS ERROR');
