import { Action, createReducer, on } from '@ngrx/store';
import * as fromSampleManagementState from '@sampleManagement/store/states/sample-management.state';
import * as fromSampleManagement from '@sampleManagement/store/actions';
import { ISampleManagementState } from '../states/sample-management.state';

export const sampleManagementReducer = createReducer(
    fromSampleManagementState.initialSampleManagementState,
    on(fromSampleManagement.GetAnalysisSamples, (state) => ({
        ...state,
        loading: true,
    })),
    on(fromSampleManagement.GetAnalysisSamplesError, (state) => ({
        ...state,
        analysisSamples: [],
        error: true,
        loading: false,
    })),
    on(fromSampleManagement.GetAnalysisSamplesSuccess, (state, action) => ({
        ...state,
        analysisSamples: action.object,
        error: false,
        loading: false,
    })),
    on(fromSampleManagement.GetTestInformation, (state) => ({
        ...state,
        loading: true,
        error: false,
        samples: [],
    })),
    on(fromSampleManagement.GetTestInformationError, (state) => ({
        ...state,
        loading: false,
        error: true,
        samples: [],
    })),
    on(fromSampleManagement.GetTestInformationSuccess, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        samples: action.samples,
    }))
);

export function reducer(state: ISampleManagementState | undefined, action: Action): ISampleManagementState {
    return sampleManagementReducer(state, action);
}
