import { createAction, props } from '@ngrx/store';
import { UA, UAAutoCompletes, UAForm, UATest } from '@to/models/unsuccessful-attempt';
import { Exception } from '@core/models/exception';
import { SecurityWrapper } from '@shared/models';

export const BackToTestingOrder = createAction('[UA] BACK TO TESTING ORDER');

export const CancelUA = createAction('[UA] CANCEL UA');

export const DeleteUA = createAction(
    '[UA] DELETE UA',

    props<{
        testId: string;
        unsuccessfulAttemptId: string;
        reason: string;
    }>()
);

export const DeleteUAError = createAction('[UA] DELETE UA ERROR');

export const DeleteUASuccess = createAction(
    '[UA] DELETE UA SUCCESS',

    props<{ unsuccessfulAttemptId: string }>()
);

export const GetAutoCompletes = createAction('[UA] GET AUTO COMPLETES');

export const GetAutoCompletesError = createAction('[UA] GET AUTO COMPLETES ERROR');

export const GetAutoCompletesSuccess = createAction(
    '[UA] GET AUTO COMPLETES SUCCESS',

    props<{ autocomplete: UAAutoCompletes }>()
);

export const GetTests = createAction(
    '[UA] GET TESTS',

    props<{ ids: Array<string> }>()
);

export const GetTestsError = createAction(
    '[UA] GET TESTS ERROR',

    props<{ error: Exception }>()
);

export const GetTestsSuccess = createAction(
    '[UA] GET TESTS SUCCESS',

    props<{ tests: Array<UATest> }>()
);

export const GetUAs = createAction(
    '[UA] GET UAS',

    props<{ ids: Array<string> }>()
);

export const GetUAsError = createAction(
    '[UA] GET UAS ERROR',

    props<{ error: Exception }>()
);

export const GetUAsSuccess = createAction(
    '[UA] GET UAS SUCCESS',

    props<{ uas: Array<SecurityWrapper<UA>> }>()
);

export const GoToTestingOrder = createAction(
    '[UA] GO TO TESTING ORDER',

    props<{ id: string }>()
);

export const GoToViewUA = createAction('[UA] GO TO VIEW UA');

export const InitCreateUA = createAction(
    '[UA] INIT CREATE UA',

    props<{ ids: Array<string> }>()
);

export const InitEditUA = createAction(
    '[UA] INIT EDIT UA',

    props<{ ids: Array<string> }>()
);

export const InitViewUA = createAction(
    '[UA] INIT VIEW UA',

    props<{ ids: Array<string> }>()
);

export const ResetUA = createAction('[UA] RESET UA');

export const ResetUAError = createAction('[UA] RESET UA ERROR');

export const SaveAllUAs = createAction(
    '[UA] SAVE ALL UAS',

    props<{ data: Array<{ uaForm: UAForm; ua: UA }> }>()
);

export const SaveAllUAsError = createAction(
    '[UA] SAVE ALL UAS ERROR',

    props<{ error: Exception }>()
);

export const SaveAllUAsSuccess = createAction(
    '[UA] SAVE ALL UAS SUCCESS',

    props<{ uas: Array<UA> }>()
);

export const SaveUA = createAction(
    '[UA] SAVE UA',

    props<{ uaForm: UAForm; ua: UA | null }>()
);

export const SaveUAError = createAction('[UA] SAVE UA ERROR');

export const SaveUASuccess = createAction(
    '[UA] SAVE UA SUCCESS',

    props<{ ua: UA }>()
);
