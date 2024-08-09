import { createAction, props } from '@ngrx/store';
import {
    TestStatusUpdate,
    IncompatibleTestParticipantDiscipline,
    Test,
    TestsMover,
    TestingOrder,
    StepsSection,
} from '@to/models';
import { UnprocessableEntityError } from '@core/models';
import { NumberOfErrorsPerCategory } from '@shared/utils/form-util';
import { Exception } from '@core/models/exception';
import { Analysis, Attachment, GenericActivity, ListItem, Reason, TOItem } from '@shared/models';
import { SearchCriteria } from '@to/models/search-criteria.model';

export const BackToTestCenter = createAction('[TESTING ORDER] BACK TO TEST CENTER');

export const BackToTestingOrderManagement = createAction('[TESTING ORDER] BACK TO TESTING ORDER MANAGEMENT');

export const BackToViewTestingOrder = createAction('[TESTING ORDER] BACK TO VIEW TESTING ORDER');

export const CancelCurrentStepSubmission = createAction('[TESTING ORDER] CANCEL CURRENT STEP SUBMISSION');

export const CancelChangeTestingOrder = createAction(
    '[TESTING ORDER] CANCEL CHANGE TESTING ORDER',

    props<{ mode: number }>()
);

export const CancelTestingOrder = createAction(
    '[TESTING ORDER] CANCEL TESTING ORDER',

    props<{ reason: Reason }>()
);

export const CancelTestingOrderError = createAction('[TESTING ORDER] CANCEL TESTING ORDER ERROR');

export const CancelTestingOrderSuccess = createAction('[TESTING ORDER] CANCEL TESTING ORDER SUCCESS');

export const CancelTests = createAction(
    '[TESTING ORDER] CANCEL TESTS',

    props<{ testsToCancel: Array<TestStatusUpdate> }>()
);

export const CancelTestsError = createAction('[TESTING ORDER] CANCEL TESTS ERRORS');

export const CancelTestsSuccess = createAction(
    '[TESTING ORDER] CANCEL TESTS SUCCESS',

    props<{ tests: Array<Test> }>()
);

export const CleanCancelledTests = createAction('[TESTING ORDER] CLEAN CANCELLED TESTS');

export const CleanClosedAnalysis = createAction('[TESTING ORDER] CLEAN CLOSED ANALYSIS');

export const CleanClosedTests = createAction('[TESTING ORDER] CLEAN CLOSED TESTS');

export const CleanTestingOrder = createAction('[TESTING ORDER] CLEAN TESTING ORDER');

export const ClearParticipants = createAction('[TESTING ORDER] CLEAR PARTICIPANTS');

export const CloseAnalysis = createAction(
    '[TESTING ORDER] CLOSE ANALYSIS',

    props<{ testId: string; analysisId: string }>()
);

export const CloseAnalysisError = createAction('[TESTING ORDER] CLOSE ANALYSIS ERROR');

export const CloseAnalysisSuccess = createAction(
    '[TESTING ORDER] CLOSE ANALYSIS SUCCESS',

    props<{ analysis: Analysis }>()
);

export const CloseTests = createAction(
    '[TESTING ORDER] CLOSE TESTS',

    props<{ testsToClose: Array<TestStatusUpdate> }>()
);

export const CloseTestsError = createAction('[TESTING ORDER] CLOSE TESTS ERRORS');

export const CloseTestsSuccess = createAction(
    '[TESTING ORDER] CLOSE TESTS SUCCESS',

    props<{ tests: Array<Test> }>()
);

export const CompleteTestingOrder = createAction(
    '[TESTING ORDER] COMPLETE TESTING ORDER',

    props<{ reason: Reason }>()
);

export const CompleteTestingOrderError = createAction(
    '[TESTING ORDER] COMPLETE TESTING ORDER ERROR',

    props<{ error: Exception }>()
);

export const CompleteTestingOrderSuccess = createAction('[TESTING ORDER] COMPLETE TO SUCCESS');

export const DeleteTestingOrder = createAction(
    '[TESTING ORDER] DELETE TESTING ORDER',

    props<{ testingOrderId: string; reason: string }>()
);

export const DeleteTestingOrderError = createAction('[TESTING ORDER] DELETE TESTING ORDER ERROR');

export const DeleteTestingOrderSuccess = createAction('[TESTING ORDER] DELETE TESTING ORDER SUCCESS');

export const GetAttachments = createAction(
    '[TESTING ORDER] GET ATTACHMENTS',

    props<{ toId: string; types: Array<string> }>()
);

export const GetAttachmentsError = createAction('[TESTING ORDER] GET ATTACHMENTS ERROR');

export const GetAttachmentsSuccess = createAction(
    '[TESTING ORDER] GET ATTACHMENTS SUCCESS',

    props<{ attachments: Array<Attachment> }>()
);

export const GetCondensedTestingOrders = createAction(
    '[TESTING ORDER] GET CONDENSED TESTING ORDERS',

    props<{ statuses?: Array<string> }>()
);

export const GetCondensedTestingOrdersError = createAction('[TESTING ORDER] GET CONDENSED TESTING ORDERS ERROR');

export const GetCondensedTestingOrdersSuccess = createAction(
    '[TESTING ORDER] GET CONDENSED TESTING ORDERS SUCCESS',

    props<{ testingOrders: Array<TOItem> }>()
);

export const GetCopyTestingOrder = createAction(
    '[TESTING ORDER] GET COPY TESTING ORDER',

    props<{ id: string }>()
);

export const GetCopyTestingOrderSuccess = createAction(
    '[TESTING ORDER] GET COPY TESTING ORDER SUCCESS',

    props<{ to: TestingOrder }>()
);

export const GetDcoReportAttachment = createAction(
    '[TESTING ORDER] GET DCO REPORT DOWNLOADED',

    props<{ toId: string; fileKey: string }>()
);

export const GetDcoReportAttachmentSuccess = createAction(
    '[TESTING ORDER] GET DCO REPORT DOWNLOADED SUCCESS',

    props<{ url: string }>()
);

export const GetGenericActivities = createAction(
    '[TESTING ORDER] GET GENERIC ACTIVITIES',

    props<{ toId: string }>()
);

export const GetGenericActivitiesError = createAction('[TESTING ORDER] GET GENERIC ACTIVITIES ERROR');

export const GetGenericActivitiesSuccess = createAction(
    '[TESTING ORDER] GET GENERIC ACTIVITIES SUCCESS',

    props<{ genericActivities: Array<GenericActivity> }>()
);

export const GetIncompatibleTestParticipants = createAction(
    '[TESTING ORDER] GET INCOMPATIBLE TEST PARTICIPANTS',

    props<{ id: number | null }>()
);

export const GetIncompatibleTestParticipantsError = createAction(
    '[TESTING ORDER] GET INCOMPATIBLE TEST PARTICIPANTS ERROR'
);

export const GetIncompatibleTestParticipantsSuccess = createAction(
    '[TESTING ORDER] GET INCOMPATIBLE TEST PARTICIPANTS SUCCESS',

    props<{
        incompatibleTestParticipants: Array<IncompatibleTestParticipantDiscipline>;
    }>()
);

export const GetTestingOrder = createAction(
    '[TESTING ORDER] GET TESTING ORDER',

    props<{ id: string }>()
);

export const GetTestingOrderError = createAction(
    '[TESTING ORDER] GET TESTING ORDER ERROR',

    props<{
        error: UnprocessableEntityError | null;
        isUnprocessableEntityError: boolean;
    }>()
);

export const GetTestingOrderSuccess = createAction(
    '[TESTING ORDER] GET TESTING ORDER SUCCESS',

    props<{ to: TestingOrder }>()
);

export const GetTestingOrderRows = createAction(
    '[TESTING ORDER] GET TESTING ORDER ROWS',

    props<{ searchCriteria?: SearchCriteria }>()
);

export const GetTestingOrderRowsError = createAction('[TESTING ORDER] GET TESTING ORDER ROWS ERROR');

export const GetTestingOrderRowsSuccess = createAction(
    '[TESTING ORDER] GET TESTING ORDER ROWS SUCCESS',

    props<{ testingOrders: Array<TOItem> }>()
);

export const GoToCreateTestingOrder = createAction(
    '[TESTING ORDER] GO TO CREATE TESTING ORDER',

    props<{ copiedTestingOrderNumber: string | null }>()
);

export const GoToTestCenter = createAction('[TESTING ORDER] GO TO TEST CENTER');

export const GoToViewTestingOrder = createAction(
    '[TESTING ORDER] GO TO VIEW TESTING ORDER',
    props<{ id: number | null }>()
);

export const InitEditTestingOrder = createAction(
    '[TESTING ORDER] INIT EDIT TESTING ORDER',

    props<{ toId: string }>()
);

export const InitCreateTestingOrder = createAction('[TESTING ORDER] INIT CREATE TESTING ORDER');

export const InitViewTestingOrder = createAction('[TESTING ORDER] INIT VIEW TESTING ORDER');

export const IssueTestingOrder = createAction(
    '[TESTING ORDER] ISSUE TESTING ORDER',

    props<{ reason: Reason }>()
);

export const IssueTestingOrderError = createAction(
    '[TESTING ORDER] ISSUE TESTING ORDER ERROR',

    props<{ error: Exception }>()
);

export const IssueTestingOrderSuccess = createAction('[TESTING ORDER] ISSUE TESTING ORDER SUCCESS');

export const MoveToTestingOrder = createAction(
    '[TESTING ORDER] MOVE TO TESTING ORDER',

    props<{ testsToMove: TestsMover }>()
);

export const MoveToTestingOrderError = createAction('[TESTING ORDER] MOVE TO TESTING ORDER ERROR');

export const MoveToTestingOrderSuccess = createAction(
    '[TESTING ORDER] MOVE TO TESTING ORDER SUCCESS',

    props<{ tests: Array<Test> }>()
);

export const PreloadAutoCompletesCreateOrEdit = createAction('[TESTING ORDER] PRELOAD AUTO COMPLETES CREATE OR EDIT');

export const PreloadAutoCompletesCreateOrEditError = createAction(
    '[TESTING ORDER] PRELOAD AUTO COMPLETES CREATE OR EDIT ERROR'
);

export const PreloadAutoCompletesCreateOrEditSuccess = createAction(
    '[TESTING ORDER] PRELOAD AUTO COMPLETES CREATE OR EDIT SUCCESS'
);

export const PreloadAutoCompletesView = createAction('[TESTING ORDER] PRELOAD AUTO COMPLETES VIEW');

export const PreloadAutoCompletesViewError = createAction('[TESTING ORDER] PRELOAD AUTO COMPLETES VIEW ERROR');

export const PreloadAutoCompletesViewSuccess = createAction('[TESTING ORDER] PRELOAD AUTO COMPLETES VIEW SUCCESS');

export const PreloadDCFAutoCompletes = createAction('[TESTING ORDER] PRELOAD DCF AUTO COMPLETES');

export const PreloadDCFAutoCompletesError = createAction('[TESTING ORDER] PRELOAD DCF AUTO COMPLETES ERROR');

export const PreloadDCFAutoCompletesSuccess = createAction('[TESTING ORDER] PRELOAD DCF AUTO COMPLETES SUCCESS');

export const ResetTestingOrder = createAction('[TESTING ORDER] RESET TO');

export const ResetTestingOrderError = createAction('[TESTING ORDER] RESET TO ERROR');

export const SaveTestingOrder = createAction('[TESTING ORDER] SAVE TESTING ORDER');

export const SaveTestingOrderError = createAction(
    '[TESTING ORDER] SAVE TESTING ORDER ERROR',

    props<{ error: Exception }>()
);

export const SaveTestingOrderSuccess = createAction(
    '[TESTING ORDER] SAVE TESTING ORDER SUCCESS',

    props<{ to: TestingOrder }>()
);

export const SetDisableSaving = createAction(
    '[TESTING ORDER] SET DISABLE SAVING',

    props<{ disableSaving: boolean }>()
);

export const SetErrorAndResetTestingOrder = createAction(
    '[TESTING ORDER] SET ERROR AND RESET TESTING ORDER',

    props<{ error: Exception }>()
);

export const SetSecurity = createAction(
    '[TESTING ORDER] SET TESTING ORDER SECURITY',

    props<{ fields: Map<string, string>; actions: Array<string> }>()
);

export const SetDefaultValues = createAction(
    '[TESTING ORDER] SET DEFAULT VALUES',

    props<{
        ados: Array<ListItem>;
        dtps: Array<ListItem>;
        orgId: number;
    }>()
);

export const SubmitCurrentStep = createAction('[TESTING ORDER] SUBMIT CURRENT STEP');

export const SubmitCurrentStepErrors = createAction(
    '[TESTING ORDER] SUBMIT CURRENT STEPS ERRORS',

    props<{ section: StepsSection; errors: NumberOfErrorsPerCategory }>()
);

export const SubmitCurrentStepSuccess = createAction('[TESTING ORDER] SUBMIT CURRENT STEP SUCCESS');
