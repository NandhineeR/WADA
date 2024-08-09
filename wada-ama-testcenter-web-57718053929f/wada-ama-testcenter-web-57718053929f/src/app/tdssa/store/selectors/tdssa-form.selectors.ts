import { createSelector } from '@ngrx/store';
import * as fromFeature from '@tdssa/store/reducers';
import { unbox } from 'ngrx-forms';
import { ITDSSAFormState } from '../states/tdssa-form.state';

export const getFormState = createSelector(
    fromFeature.getTDSSAState,
    (state: fromFeature.ITDSSAState) => state.tdssaForm
);

export const getDaterange = createSelector(getFormState, (formState: ITDSSAFormState) => unbox(formState.daterange));
