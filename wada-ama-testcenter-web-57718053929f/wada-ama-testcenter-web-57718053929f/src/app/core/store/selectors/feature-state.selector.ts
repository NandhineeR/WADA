import { createFeatureSelector } from '@ngrx/store';

export const getLoadingState = createFeatureSelector<boolean>('loading');
export const getErrorState = createFeatureSelector<boolean>('error');
