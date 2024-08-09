import { createAction, props } from '@ngrx/store';
import { DopingControlPersonnelInformation } from '@to/models';

export const Step3GetAutoCompletes = createAction('[TESTING ORDER STEP3] GET AUTO COMPLETES');

export const Step3GetAutoCompletesError = createAction('[TESTING ORDER STEP3] GET AUTO COMPLETES ERROR');

export const Step3Init = createAction('[TESTING ORDER STEP3] INIT STEP');

export const Step3SubmitForm = createAction(
    '[TESTING ORDER STEP3] SUBMIT FORM',

    props<{ values: DopingControlPersonnelInformation }>()
);
