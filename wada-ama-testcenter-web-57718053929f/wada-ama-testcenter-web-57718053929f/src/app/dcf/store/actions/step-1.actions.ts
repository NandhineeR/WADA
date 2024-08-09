import { createAction, props } from '@ngrx/store';
import { AthleteInformation, AuthorizationInformation, NotificationInformation, TimeSlot, Timezone } from '@dcf/models';
import { StepsSection } from '@dcf/models/steps/steps-section.enum';
import { TOItem } from '@shared/models';

export const Step1GetAutoCompletes = createAction(
    '[DCF STEP1] GET AUTO COMPLETES',

    props<{ section: StepsSection }>()
);

export const Step1GetAutoCompletesError = createAction('[DCF STEP1] GET AUTO COMPLETES ERROR');

export const Step1GetTimeSlots = createAction(
    '[DCF STEP1] GET TIMESLOTS',

    props<{ date: Date }>()
);

export const Step1GetTimeslotsError = createAction('[DCF STEP1] GET TIMESLOTS ERROR');

export const Step1GetTimeslotsSuccess = createAction(
    '[DCF STEP1] GET TIMESLOTS SUCCESS',

    props<{ timeSlots: Array<TimeSlot> }>()
);

export const Step1Init = createAction(
    '[DCF STEP1] INIT SECTION',

    props<{ section: StepsSection }>()
);

export const Step1ResetTOAndTest = createAction('[DCF STEP1] RESET TO AND TEST');

export const Step1SectionAthleteSubmitForm = createAction(
    '[DCF STEP1] SUBMIT ATHLETE FORM',

    props<{ values: AthleteInformation }>()
);

export const Step1SectionAuthorizationSubmitForm = createAction(
    '[DCF STEP1] SUBMIT AUTHORIZATION FORM',

    props<{ values: AuthorizationInformation }>()
);

export const Step1SectionNotificationSubmitForm = createAction(
    '[DCF STEP1] SUBMIT NOTIFICATION FORM',

    props<{ values: NotificationInformation }>()
);

export const Step1SetTOAndTest = createAction(
    '[DCF STEP1] SET TO AND TEST',

    props<{ to: TOItem | undefined }>()
);

export const Step1SetTimezoneDefault = createAction(
    '[DCF STEP 1] SET TIME ZONE DEFAULT VALUE',

    props<{ timezoneDefault: Timezone }>()
);

export const Step1SubmitForm = createAction('[DCF STEP1] SUBMIT FORM');
