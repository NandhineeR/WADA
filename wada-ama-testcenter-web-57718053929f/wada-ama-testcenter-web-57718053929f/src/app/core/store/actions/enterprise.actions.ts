import { createAction, props } from '@ngrx/store';

export const GetDcfDataRetentionPeriod = createAction('[ENTERPRISE] GET DCF RETENTION PERIOD');

export const GetDcfDataRetentionPeriodSuccess = createAction(
    '[ENTERPRISE] GET DCF RETENTION PERIOD SUCCESS',
    props<{ dcfRetentionPeriod: string | null }>()
);

export const GetDcfDataRetentionPeriodError = createAction('[ENTERPRISE] GET DCF RETENTION PERIOD ERROR');

export const GetDcfDecommissionStartDate = createAction('[ENTERPRISE] GET DCF DECOMMISSION START DATE');

export const GetDcfDecommissionStartDateError = createAction('[ENTERPRISE] GET DCF DECOMMISSION START DATE ERROR');

export const GetDcfDecommissionStartDateSuccess = createAction(
    '[ENTERPRISE] GET DCF DECOMMISSION START DATE SUCCESS',

    props<{ dcfDecommissionStartDate: string | null }>()
);

export const GetMaxMOResults = createAction(
    '[ENTERPRISE] GET MAX MO RESULTS',

    props<{ property: string }>()
);
export const GetMaxMOResultsSuccess = createAction(
    '[ENTERPRISE] GET MAX MO RESULTS SUCCESS',

    props<{ maxMOResults: number | null }>()
);

export const GetMaxNumberAdos = createAction('[ENTERPRISE] GET MAX NUMBER ADOS');

export const GetMaxNumberAdosError = createAction('[ENTERPRISE] GET MAX NUMBER ADOS ERROR');

export const GetMaxNumberAdosSuccess = createAction(
    '[ENTERPRISE] GET MAX NUMBER ADOS SUCCESS',

    props<{ maxNumberAdos: number | null }>()
);

export const GetSampleCollectionDateInUtcStartDate = createAction(
    '[ENTERPRISE] GET SAMPLE COLLECTION DATE IN UTC START DATE'
);

export const GetSampleCollectionDateInUtcStartDateError = createAction(
    '[ENTERPRISE] GET SAMPLE COLLECTION DATE IN UTC START DATE ERROR'
);

export const GetSampleCollectionDateInUtcStartDateSuccess = createAction(
    '[ENTERPRISE] GET SAMPLE COLLECTION DATE IN UTC START DATE SUCCESS',
    props<{ sampleCollectionDateInUtcStartDate: string | null }>()
);

export const GetToDecommissionStartDate = createAction('[ENTERPRISE] GET TO DECOMMISSION START DATE');

export const GetToDecommissionStartDateError = createAction('[ENTERPRISE] GET TO DECOMMISSION START DATE ERROR');

export const GetToDecommissionStartDateSuccess = createAction(
    '[ENTERPRISE] GET TO DECOMMISSION START DATE SUCCESS',

    props<{ toDecommissionStartDate: string | null }>()
);
