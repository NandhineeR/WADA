import { createFeatureSelector } from '@ngrx/store';
import * as fromSampleManagementReducer from './sample-management.reducer';
import { ISampleManagementState } from '../states/sample-management.state';

export const getSampleManagementState = createFeatureSelector<ISampleManagementState>('sampleManagement');

export const sampleManagementReducers = fromSampleManagementReducer.reducer;
