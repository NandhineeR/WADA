import { Exception } from '@core/models/exception';
import { createAction, props } from '@ngrx/store';
import { ListItem, MajorEvent } from '@shared/models';
import { AuthorizationInformation } from '@to/models';

export const GetMajorEvents = createAction(
    '[TESTING ORDER STEP1] GET MAJOR EVENTS',

    props<{ numberPriorMonths: string }>()
);

export const GetMajorEventsError = createAction(
    '[TESTING ORDER STEP1] GET MAJOR EVENTS ERROR',

    props<{ error: Exception | null }>()
);

export const GetMajorEventsSuccess = createAction(
    '[TESTING ORDER STEP1] GET MAJOR EVENTS SUCCESS',

    props<{ majorEvents: Array<ListItem> }>()
);

export const Step1GetAutoCompletes = createAction('[TESTING ORDER STEP1] GET AUTO COMPLETES');

export const Step1GetAutoCompletesError = createAction('[TESTING ORDER STEP1] GET AUTO COMPLETES ERROR');

export const Step1GetMajorEvent = createAction(
    '[TESTING ORDER STEP1] GET MAJOR EVENT',

    props<{ majorEventId: string }>()
);

export const Step1GetMajorEventError = createAction(
    '[TESTING ORDER STEP1] GET MAJOR EVENT ERROR',

    props<{ error: Exception }>()
);

export const Step1GetMajorEventSuccess = createAction(
    '[TESTING ORDER STEP1] GET MAJOR EVENT SUCCESS',

    props<{ majorEvent: MajorEvent }>()
);

export const Step1Init = createAction('[TESTING ORDER STEP1] INIT STEP');

export const Step1ResetCompetition = createAction('[TESTING ORDER STEP1] RESET COMPETITION');

export const Step1ResetMajorEvent = createAction('[TESTING ORDER STEP1] RESET MAJOR EVENT');

export const Step1SubmitForm = createAction(
    '[TESTING ORDER STEP1] SUBMIT FORM',

    props<{ values: AuthorizationInformation }>()
);
