import { createAction, props } from '@ngrx/store';

export const InitDashboard = createAction(
    '[ATHLETE DASHBOARD] INIT DASHBOARD',

    props<{ athleteId: string }>()
);

export const GetTestingMetadata = createAction(
    '[ATHLETE DASHBOARD] GET TESTING METADATA',

    props<{ athleteId: string }>()
);

export const GetTestingMetadataSuccess = createAction(
    '[ATHLETE DASHBOARD] GET TESTING METADATA SUCCESS',

    props<{ testingMetadata: any }>()
);

export const GetTestingMetadataError = createAction('[ATHLETE DASHBOARD] GET TESTING METADATA ERROR');
