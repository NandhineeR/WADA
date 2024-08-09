import { createAction, props } from '@ngrx/store';
import { AnalysisSample, Sample } from '@sampleManagement/models';

export const GetAnalysisSamples = createAction('[SAMPLE MANAGEMENT] GET ANALYSES SAMPLES');

export const GetAnalysisSamplesError = createAction('[SAMPLE MANAGEMENT] GET ANALYSES SAMPLES ERROR');

export const GetAnalysisSamplesSuccess = createAction(
    '[SAMPLE MANAGEMENT] GET ANALYSES SAMPLES SUCCESS',

    props<{
        object: Array<AnalysisSample | null>;
    }>()
);

export const GetTestInformation = createAction('[SAMPLE MANAGEMENT] GET TEST INFORMATION');

export const GetTestInformationError = createAction('[SAMPLE MANAGEMENT] GET TEST INFORMATION ERROR');

export const GetTestInformationSuccess = createAction(
    '[SAMPLE MANAGEMENT] GET TEST INFORMATION SUCCESS',

    props<{ samples: Array<Sample> }>()
);

export const NotifyTest = createAction('[SAMPLE MANAGEMENT] NOTIFY TEST');

export const NotifyTestError = createAction('[SAMPLE MANAGEMENT] NOTIFY TEST ERROR');

export const NotifyTestingOrder = createAction('[SAMPLE MANAGEMENT] NOTIFY TESTING ORDER');

export const NotifyTestingOrderError = createAction('[SAMPLE MANAGEMENT] NOTIFY TESTING ORDER ERROR');
