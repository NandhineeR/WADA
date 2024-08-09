import { AnalysisSample, Sample } from '@sampleManagement/models';
import { IFeatureState } from '@core/store';

export interface ISampleManagementState extends IFeatureState {
    analysisSamples: Array<AnalysisSample | null>;
    error: boolean;
    loading: boolean;
    samples: Array<Sample>;
}

export const initialSampleManagementState: ISampleManagementState = {
    analysisSamples: [],
    error: false,
    loading: false,
    samples: [],
};
