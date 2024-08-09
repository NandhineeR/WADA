import { createAction, props } from '@ngrx/store';
import { AthleteAndAnalysesInformation, AthleteGroup, SearchAthleteResult, Test, TestStatuses } from '@to/models';

export const Step2AddAnalysesToTests = createAction(
    '[TESTING ORDER STEP2] ADD ANALYSES TO TESTS',

    props<{ modifiedTests: Array<Test> }>()
);

export const Step2AddAthletesAsATest = createAction(
    '[TESTING ORDER STEP2] ADD ATHLETE AS A TEST',

    props<{ addedAthletes: Array<Test> }>()
);

export const Step2AddPlaceholderAsATest = createAction(
    '[TESTING ORDER STEP2] ADD PLACEHOLDER AS A TEST',

    props<{ tests: Array<Test> }>()
);

export const Step2AddTemporaryTests = createAction(
    '[TESTING ORDER STEP2] ADD TEMPORARY TESTS',

    props<{ addedTests: Array<Test> }>()
);

export const Step2BindAthleteToTest = createAction(
    '[TESTING ORDER STEP2] BIND ATHLETE TO TEST',

    props<{ testId: string; athleteId: string }>()
);

export const Step2BindAthleteToTestError = createAction('[TESTING ORDER STEP2] BIND ATHLETE TO TEST ERROR');

export const Step2BindAthleteToTestSuccess = createAction('[TESTING ORDER STEP2] BIND ATHLETE TO TEST SUCCESS');

export const Step2ClearAthleteGroups = createAction('[TESTING ORDER STEP2] CLEAR ATHLETE GROUPS');

export const Step2DeleteTempTests = createAction('[TESTING ORDER STEP2] DELETE TEMP TESTS');

export const Step2DeleteTest = createAction(
    '[TESTING ORDER STEP2] DELETE TEST',

    props<{ id: number | null; tempId: string }>()
);

export const Step2GetAthleteGroups = createAction('[TESTING ORDER STEP2] GET ATHLETE GROUPS');

export const Step2GetAthleteGroupsError = createAction('[TESTING ORDER STEP2] GET ATHLETE GROUPS ERROR');

export const Step2GetAthleteGroupsSuccess = createAction(
    '[TESTING ORDER STEP2] GET ATHLETE GROUPS SUCCESS',

    props<{ athleteGroups: Array<AthleteGroup> }>()
);

export const Step2GetAutoCompletes = createAction('[TESTING ORDER STEP2] GET AUTO COMPLETES');

export const Step2GetAutoCompletesError = createAction('[TESTING ORDER STEP2] GET AUTO COMPLETES ERROR');

export const Step2GetTestStatuses = createAction(
    '[TESTING ORDER STEP2] GET TEST STATUSES',

    props<{ testType: string }>()
);

export const Step2GetTestStatusesError = createAction('[TESTING ORDER STEP2] GET TEST STATUSES ERROR');

export const Step2GetTestStatusesSuccess = createAction(
    '[TESTING ORDER STEP2] GET TEST STATUSES SUCCESS',

    props<{ statuses: TestStatuses }>()
);

export const Step2Init = createAction('[TESTING ORDER STEP2] INIT STEP');

export const Step2RemoveTestsWithoutSport = createAction(
    '[TESTING ORDER STEP2] REMOVE TESTS WITHOUT SPORT',

    props<{ tests: Array<Test> }>()
);

export const Step2SearchAthletes = createAction(
    '[TESTING ORDER STEP2] SEARCH ATHLETES',

    props<{ searchString: string }>()
);

export const Step2SearchAthletesClear = createAction('[TESTING ORDER STEP2] CLEAR ATHLETE SEARCH');

export const Step2SearchAthletesClose = createAction('[TESTING ORDER STEP2] SEARCH ATHLETES CLOSE');

export const Step2SearchAthletesError = createAction('[TESTING ORDER STEP2] SEARCH ATHLETES ERROR');

export const Step2SearchAthletesSuccess = createAction(
    '[TESTING ORDER STEP2] SEARCH ATHLETES SUCCESS',

    props<{ searchAthletes: Array<SearchAthleteResult> }>()
);

export const Step2SubmitForm = createAction(
    '[TESTING ORDER STEP2] SUBMIT FORM',

    props<{ values: AthleteAndAnalysesInformation }>()
);
