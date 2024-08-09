import { createAction, props } from '@ngrx/store';
import { ConflictException } from '@core/models/conflict-exception';
import { SecurityWrapper, TOItem, Test } from '@shared/models';
import { AthleteInformation, DCF, DCFForm, DCFMode, Sample, UrineSampleBoundaries } from '@dcf/models';
import { Exception } from '@core/models/exception';

export const MultipleDCFBackToView = createAction(
    '[MULTIPLE DCF] BACK TO VIEW',

    props<{ ids: Array<number | null> }>()
);

export const MultipleDCFBackToViewTestingOrder = createAction('[MULTIPLE DCF] BACK TO VIEW TESTING ORDER');

export const MultipleDCFCancel = createAction(
    '[MULTIPLE DCF] CANCEL',

    props<{ isEditMode: boolean; dcfIds: Array<string> }>()
);

export const MultipleDCFChangeStatusCancel = createAction(
    '[MULTIPLE DCF] CHANGE STATUS CANCEL',

    props<{ reason: string }>()
);

export const MultipleDCFGetAthlete = createAction(
    '[MULTIPLE DCF] GET ATHLETE',

    props<{ id: string; mode: DCFMode }>()
);

export const MultipleDCFGetAthleteError = createAction('[MULTIPLE DCF] GET ATHLETE ERROR');

export const MultipleDCFGetAthleteSuccess = createAction(
    '[MULTIPLE DCF] GET ATHLETE SUCCESS',

    props<{ athlete: AthleteInformation; mode: DCFMode }>()
);

export const MultipleDCFGetAutoCompletes = createAction('[MULTIPLE DCF] GET AUTO COMPLETES');

export const MultipleDCFGetAutoCompletesError = createAction('[MULTIPLE DCF] GET AUTO COMPLETES ERROR');

export const MultipleDCFGetDCFs = createAction(
    '[MULTIPLE DCF] GET DCFS',

    props<{ ids: Array<string> }>()
);

export const MultipleDCFGetDCFsError = createAction(
    '[MULTIPLE DCF] GET DCFS ERROR',

    props<{ error: Exception }>()
);

export const MultipleDCFGetDCFsSuccess = createAction(
    '[MULTIPLE DCF] GET DCFS SUCCESS',

    props<{ securityWrappers: Array<SecurityWrapper<DCF>> }>()
);

export const MultipleDCFGetTestingOrderError = createAction('[MULTIPLE DCF] GET TESTING ORDER ERROR');

export const MultipleDCFGetTestingOrderSuccess = createAction(
    '[MULTIPLE DCF] GET TESTING ORDER SUCCESS',

    props<{ to: TOItem }>()
);

export const MultipleDCFGetTests = createAction(
    '[MULTIPLE DCF] GET TESTS',

    props<{ ids: Array<string> }>()
);

export const MultipleDCFGetTestsError = createAction(
    '[MULTIPLE DCF] GET TESTS ERROR',

    props<{ error: Exception }>()
);

export const MultipleDCFGetTestsSuccess = createAction(
    '[MULTIPLE DCF] GET TESTS SUCCESS',

    props<{ tests: Array<Test> }>()
);

export const MultipleDCFGetUrineSampleBoundaries = createAction('[MULTIPLE DCF] GET URINE SAMPLE BOUNDARIES');

export const MultipleDCFGetUrineSampleBoundariesError = createAction(
    '[MULTIPLE DCF] GET URINE SAMPLE BOUNDARIES ERROR'
);

export const MultipleDCFGetUrineSampleBoundariesSuccess = createAction(
    '[MULTIPLE DCF] GET URINE SAMPLE BOUNDARIES SUCCESS',
    props<{ urineSampleBoundaries: UrineSampleBoundaries }>()
);

export const MultipleDCFGoToView = createAction(
    '[MULTIPLE DCF] GO TO VIEW',

    props<{ ids: Array<number | null> }>()
);

export const MultipleDCFInitCreate = createAction(
    '[MULTIPLE DCF] INIT CREATE',

    props<{ ids: Array<string> }>()
);

export const MultipleDCFInitEdit = createAction(
    '[MULTIPLE DCF] INIT EDIT',

    props<{ ids: Array<string> }>()
);

export const MultipleDCFInitView = createAction(
    '[MULTIPLE DCF] INIT VIEW',

    props<{ ids: Array<string> }>()
);

export const MultipleDCFOpenNext = createAction(
    '[MULTIPLE DCF] OPEN NEXT',

    props<{ dcfForm: DCFForm; dcf: DCF | null }>()
);

export const MultipleDCFOpenNextError = createAction('[MULTIPLE DCF] OPEN NEXT ERROR');

export const MultipleDCFOpenNextSuccess = createAction(
    '[MULTIPLE DCF] OPEN NEXT SUCCESS',

    props<{ dcf: DCF }>()
);

export const MultipleDCFReset = createAction('[MULTIPLE DCF] RESET');

export const MultipleDCFResetError = createAction('[DCF] RESET ERROR');

export const MultipleDCFSampleCodeValidation = createAction(
    '[MULTIPLE DCF] SAMPLE CODE VALIDATION',

    props<{
        dcfs: Array<DCF>;
        dcf: DCF;
    }>()
);

export const MultipleDCFSampleCodeValidationError = createAction(
    '[MULTIPLE DCF] SAMPLE CODE VALIDATION ERROR',

    props<{ exception: ConflictException }>()
);

export const MultipleDCFSampleCodeValidationSuccess = createAction(
    '[MULTIPLE DCF] SAMPLE CODE VALIDATION SUCCESS',

    props<{ samples: Array<Sample> }>()
);

export const MultipleDCFSaveAll = createAction(
    '[MULTIPLE DCF] SAVE ALL',

    props<{ data: Array<{ dcfForm: DCFForm; dcf: DCF }> }>()
);

export const MultipleDCFSaveAllError = createAction(
    '[MULTIPLE DCF] SAVE ALL ERROR',

    props<{ error: ConflictException }>()
);

export const MultipleDCFSaveAllSuccess = createAction(
    '[MULTIPLE DCF] SAVE ALL SUCCESS',

    props<{ dcfs: Array<SecurityWrapper<DCF>> }>()
);

export const MultipleDCFSetDefaultValues = createAction(
    '[MULTIPLE DCF] SET DEFAULT VALUES',

    props<{ orgId: number }>()
);
