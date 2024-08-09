import { createSelector } from '@ngrx/store';
import { AnalysisSample } from '@sampleManagement/models';
import { getSampleManagementState } from '../reducers';
import { ISampleManagementState } from '../states/sample-management.state';

export const getAnalysisSamples = createSelector(
    getSampleManagementState,
    (state: ISampleManagementState) => state.analysisSamples || []
);

export const getSelectedAnalysisSample = (label: string) =>
    createSelector(getAnalysisSamples, (analysisSamples: Array<AnalysisSample | null>) => {
        return analysisSamples.find((item: AnalysisSample | null) => item?.label === label) || null;
    });

export const getTestInformation = createSelector(
    getSampleManagementState,
    (state: ISampleManagementState) => state.samples
);
