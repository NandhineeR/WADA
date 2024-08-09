import { createAction, props } from '@ngrx/store';
import { TestParticipantsInformation } from '@to/models';

export const Step4GetAutoCompletes = createAction('[TESTING ORDER STEP4] GET AUTO COMPLETES');

export const Step4GetAutoCompletesError = createAction('[TESTING ORDER STEP4] GET AUTO COMPLETES ERROR');

export const Step4Init = createAction('[TESTING ORDER STEP4] INIT STEP');

export const Step4SubmitForm = createAction(
    '[TESTING ORDER STEP4] SUBMIT FORM',

    props<{ values: TestParticipantsInformation }>()
);
