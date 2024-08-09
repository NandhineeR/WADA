import { createAction, props } from '@ngrx/store';
import { MatchingStatus, Sample, SampleInformation } from '@dcf/models';
import { ConflictException, Exception } from '@core/models';
import { Moment } from 'moment';
import { MajorEvent } from '@shared/models/major-event.model';
import { ListItem } from '@shared/models';

export const Step2ExecuteSampleCodeValidation = createAction('[DCF STEP2] EXECUTE SAMPLE CODE VALIDATION');

export const Step2ExecuteSampleCodeValidationError = createAction(
    '[DCF STEP2] EXECUTE SAMPLE CODE VALIDATION ERROR',

    props<{ exception: ConflictException }>()
);

export const Step2ExecuteSampleCodeValidationSuccess = createAction(
    '[DCF STEP2] EXECUTE SAMPLE CODE VALIDATION SUCCESS',

    props<{ samples: Array<Sample> }>()
);

export const Step2GetAutoCompletes = createAction('[DCF STEP2] GET AUTO COMPLETES');

export const Step2GetAutoCompletesError = createAction('[DCF STEP2] GET AUTO COMPLETES ERROR');

export const Step2GetMajorEventError = createAction(
    '[DCF STEP2] GET MAJOR EVENT ERROR',

    props<{ error: Exception }>()
);

export const Step2GetMajorEventSuccess = createAction(
    '[DCF STEP2] GET MAJOR EVENT SUCCESS',

    props<{ majorEvent: MajorEvent }>()
);

export const Step2GetMajorEvents = createAction(
    '[DCF STEP2] GET MAJOR EVENTS',

    props<{ numberPriorMonths: string }>()
);

export const Step2GetMajorEventsError = createAction('[DCF STEP2] GET MAJOR EVENTS ERROR');

export const Step2GetMajorEventsSuccess = createAction(
    '[DCF STEP2] GET MAJOR EVENTS SUCCESS',

    props<{ majorEvents: Array<ListItem> }>()
);

export const Step2GetTempLoggerStatus = createAction(
    '[DCF STEP2] GET TEMP LOGGER STATUS',

    props<{ tempLoggerId: string; date: Moment }>()
);

export const Step2GetTempLoggerStatusSuccess = createAction(
    '[DCF STEP2] GET TEMP LOGGER STATUS SUCCESS',

    props<{ tempLoggerStatus: MatchingStatus }>()
);

export const Step2Init = createAction('[DCF STEP2] INIT STEP');
export const Step2GetMajorEvent = createAction(
    '[DCF STEP2] GET MAJOR EVENT',

    props<{ majorEventId: string }>()
);

export const Step2ResetDefaultAuthority = createAction('[DCF STEP2] RESET DEFAULT AUTHORITY');

export const Step2ResetMajorEvent = createAction('[DCF STEP2] RESET MAJOR EVENT');

export const Step2ResetTempLoggerStatus = createAction('[DCF STEP2] RESET TEMP LOGGER STATUS');

export const Step2SectionSampleSubmitForm = createAction(
    '[DCF STEP2] SUBMIT SAMPLE FORM',

    props<{ values: SampleInformation }>()
);

export const Step2SubmitForm = createAction(
    '[DCF STEP2] SUBMIT FORM',

    props<{ values: SampleInformation }>()
);

export const Step2UpdateAuthority = createAction(
    '[DCF STEP2] UPDATE AUTHORITY',

    props<{
        testAuthority: ListItem | null;
        sampleCollectionAuthority: ListItem | null;
        resultManagementAuthority: ListItem | null;
    }>()
);
