import { createAction, props } from '@ngrx/store';
import { ProceduralInformation } from '@dcf/models';

export const Step3Init = createAction('[DCF STEP3] INIT STEP');

export const Step3GetAutoCompletes = createAction('[DCF STEP3] GET AUTO COMPLETES');

export const Step3GetAutoCompletesError = createAction('[DCF STEP3] GET AUTO COMPLETES ERROR');

export const Step3SectionProceduralSubmitForm = createAction(
    '[DCF STEP3] SUBMIT PROCEDURAL FORM',

    props<{ values: ProceduralInformation }>()
);

export const Step3SubmitForm = createAction(
    '[DCF STEP3] SUBMIT FORM',

    props<{ values: ProceduralInformation }>()
);
