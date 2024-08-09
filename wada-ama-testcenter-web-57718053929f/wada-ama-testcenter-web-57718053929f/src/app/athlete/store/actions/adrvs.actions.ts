import { createAction, props } from '@ngrx/store';

export const InitADRVs = createAction(
    '[ATHLETE ADRVS] INIT ADRV',

    props<{ athleteId: string }>()
);

export const GetAthleteADRVs = createAction(
    '[ATHLETE ADRVS] GET ATHLETE ADRVS',

    props<{ athleteId: string }>()
);

export const GetAthleteADRVsSuccess = createAction(
    '[ATHLETE ADRVS] GET ATHLETE ADRVS SUCCESS',

    props<{ adrvs: any }>()
);

export const GetAthleteADRVsError = createAction('[ATHLETE ADRVS] GET ATHLETE ADRVS ERROR');
