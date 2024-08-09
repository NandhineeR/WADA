import { createAction, props } from '@ngrx/store';
import { NumberOfErrorsPerCategory } from '@shared/utils';
import { Attachment, CountryWithRegions, GenericActivity, ListItem, TOItem, Test } from '@shared/models';
import { Exception } from '@core/models/exception';
import {
    AthleteInformation,
    DCF,
    DCFMode,
    LabResult,
    Sample,
    SampleValidityUpdate,
    StepsSection,
    UrineSampleBoundaries,
} from '@dcf/models';
import { DcfBinding } from '@dcf/models/bind-dcf-to-testing-order.model';

export const BackToViewDCF = createAction('[DCF] BACK TO VIEW DCF');

export const BackToViewTestingOrder = createAction('[DCF] BACK TO VIEW TESTING ORDER');

export const BindDCFToTestingOrder = createAction(
    '[DCF] BIND DCF TO TESTING ORDER',

    props<{ bindDCFToTO: DcfBinding }>()
);

export const BindDCFToTestingOrderError = createAction('[DCF] BIND DCF TO TESTING ORDER ERROR');

export const BindDCFToTestingOrderSuccess = createAction(
    '[DCF] BIND DCF TO TESTING ORDER SUCCESS',

    props<{ dcf: DCF }>()
);

export const BreakSampleMatch = createAction(
    '[DCF] BREAK SAMPLE MATCH',

    props<{
        dcfId: string;
        sampleId: string;
        reason: string;
        sampleJarCode: string;
    }>()
);

export const BreakSampleMatchError = createAction('[DCF] BREAK SAMPLE MATCH ERROR');

export const BreakSampleMatchSuccess = createAction('[DCF] BREAK SAMPLE MATCH SUCCESS');

export const CancelDCF = createAction(
    '[DCF] CANCEL DCF',

    props<{ mode: number }>()
);

export const ChangeDCFStatusCancel = createAction(
    '[DCF] CHANGE DCF STATUS CANCEL',

    props<{ reason: string }>()
);

export const ChangeSampleCode = createAction(
    '[DCF] CHANGE SAMPLE CODE',

    props<{
        dcfId: string;
        sampleId: string;
        reason: string;
        sampleCode: string;
    }>()
);

export const ChangeSampleCodeError = createAction('[DCF] CHANGE SAMPLE CODE ERROR');

export const ChangeSampleCodeSuccess = createAction('[DCF] CHANGE SAMPLE CODE SUCCESS');

export const ChangeSampleType = createAction(
    '[DCF] CHANGE SAMPLE TYPE',

    props<{
        dcfId: string;
        sampleId: string;
        reason: string;
        sampleType: string;
    }>()
);

export const ChangeSampleTypeError = createAction('[DCF] CHANGE SAMPLE TYPE ERROR');

export const ChangeSampleTypeSuccess = createAction('[DCF] CHANGE SAMPLE TYPE SUCCESS');

export const ChangeSampleValidity = createAction(
    '[DCF] CHANGE SAMPLE VALIDITY',

    props<{
        dcfId: string;
        sampleValidityUpdate: SampleValidityUpdate;
    }>()
);

export const ChangeSampleValidityError = createAction('[DFC] CHANGE SAMPLE VALIDITY ERROR');

export const ChangeSampleValiditySuccess = createAction('[DFC] CHANGE SAMPLE VALIDITY SUCCESS');

export const CreateDCFFromAthlete = createAction(
    '[DCF] CREATE DCF FROM ATHLETE',

    props<{
        athlete: AthleteInformation;
        countriesWithRegions: Array<CountryWithRegions>;
    }>()
);

export const DeleteDCF = createAction(
    '[DCF] DELETE DCF',

    props<{ dcfId: string; reason: string }>()
);

export const DeleteDCFError = createAction('[DCF] DELETE DCF ERROR');

export const DeleteDCFSuccess = createAction('[DCF] DELETE DCF SUCCESS');

export const GetAthlete = createAction(
    '[DCF] GET ATHLETE',

    props<{ id: string; mode: DCFMode }>()
);

export const GetAthleteError = createAction('[DCF] GET ATHLETE ERROR');

export const GetAthleteSuccess = createAction(
    '[DCF] GET ATHLETE SUCCESS',

    props<{
        athlete: AthleteInformation;
        countriesWithRegions: Array<CountryWithRegions>;
        mode: DCFMode;
    }>()
);

export const GetAttachments = createAction(
    '[DCF] GET ATTACHMENTS',

    props<{ dcfId: string; types: Array<string> }>()
);

export const GetAttachmentsAthletePhoto = createAction(
    '[DCF] GET ATTACHMENTS ATHLETE PHOTO',

    props<{ dcfId: string; fileKey: string }>()
);

export const GetAttachmentsAthletePhotoSuccess = createAction(
    '[DCF] GET ATTACHMENTS ATHLETE PHOTO SUCCESS',

    props<{ url: string }>()
);

export const GetAttachmentsChainOfCustody = createAction(
    '[DCF] GET ATTACHMENTS CHAIN OF CUSTODY',

    props<{ dcfId: string; fileKey: string }>()
);

export const GetAttachmentsChainOfCustodySuccess = createAction(
    '[DCF] GET ATTACHMENTS CHAIN OF CUSTODY SUCCESS',

    props<{ url: string }>()
);

export const GetAttachmentsError = createAction('[DCF] GET ATTACHMENTS ERROR');

export const GetAttachmentsNotification = createAction(
    '[DCF] GET ATTACHMENTS NOTIFICATION',

    props<{ dcfId: string; fileKey: string }>()
);

export const GetAttachmentsNotificationSuccess = createAction(
    '[DCF] GET ATTACHMENTS NOTIFICATION SUCCESS',

    props<{ url: string }>()
);

export const GetAttachmentsSignedCopy = createAction(
    '[DCF] GET ATTACHMENTS SIGNED COPY',

    props<{ dcfId: string; fileKey: string }>()
);

export const GetAttachmentsSignedCopySuccess = createAction(
    '[DCF] GET ATTACHMENTS SIGNED COPY SUCCESS',

    props<{ url: string }>()
);

export const GetAttachmentsSuccess = createAction(
    '[DCF] GET ATTACHMENTS SUCCESS',

    props<{ attachments: Array<Attachment> }>()
);

export const GetDCF = createAction(
    '[DCF] GET DCF',

    props<{ dcfId: number }>()
);

export const GetDCFError = createAction(
    '[DCF] GET DCF ERROR',

    props<{ error: Exception }>()
);

export const GetDCFSuccess = createAction(
    '[DCF] GET DCF SUCCESS',

    props<{ dcf: DCF }>()
);

export const GetGenericActivities = createAction(
    '[DCF] GET GENERIC ACTIVITIES',

    props<{ testId: string }>()
);

export const GetGenericActivitiesError = createAction('[DCF] GET GENERIC ACTIVITIES ERROR');

export const GetGenericActivitiesSuccess = createAction(
    '[DCF] GET GENERIC ACTIVITIES SUCCESS',

    props<{ genericActivities: Array<GenericActivity> }>()
);

export const GetLabResult = createAction(
    '[DCF] GET LAB RESULT',

    props<{ labResultId: string; isBloodPassport: boolean }>()
);

export const GetLabResultError = createAction('[DCF] GET LAB RESULT ERROR');

export const GetLabResultSuccess = createAction(
    '[DCF] GET LAB RESULT SUCCESS',

    props<{ labResult: LabResult }>()
);

export const GetTOError = createAction('[DCF] GET TO ERROR');

export const GetTest = createAction(
    '[DCF] GET TEST',

    props<{ id: string; fromTo: boolean }>()
);

export const GetTestError = createAction('[DCF] GET TEST ERROR');

export const GetTestSuccess = createAction(
    '[DCF] GET TEST SUCCESS',

    props<{ test: Test }>()
);

export const GetTestingOrders = createAction(
    '[DCF] GET TESTING ORDERS',

    props<{ athleteId: string }>()
);

export const GetTestingOrdersError = createAction('[DCF] GET TESTING ORDERS ERROR');

export const GetTestingOrdersSuccess = createAction(
    '[DCF] GET TESTING ORDERS SUCCESS',

    props<{ testingOrders: Array<TOItem> }>()
);

export const GetUrineSampleBoundaries = createAction('[DCF] GET URINE SAMPLE BOUNDARIES');

export const GetUrineSampleBoundariesError = createAction('[DCF] GET URINE SAMPLE BOUNDARIES ERROR');

export const GetUrineSampleBoundariesSuccess = createAction(
    '[DCF] GET URINE SAMPLE BOUNDARIES SUCCESS',

    props<{ urineSampleBoundaries: UrineSampleBoundaries }>()
);

export const GoToTestingOrderManagement = createAction('[DCF] GO TO TESTING ORDER MANAGEMENT');

export const GoToEditDCF = createAction(
    '[DCF] GO TO EDIT DCF',

    props<{ id: number; step: number }>()
);

export const GoToViewDCF = createAction(
    '[DCF] GO TO VIEW DCF',

    props<{ id: number }>()
);

export const GoToViewDashboard = createAction('[DCF] GO TO DASHBOARD');

export const GoToViewTestingOrder = createAction(
    '[DCF] GO TO VIEW TESTING ORDER',

    props<{ id: string }>()
);

export const InitCreateDCF = createAction('[DCF] INIT CREATE DCF');

export const InitEditDCF = createAction(
    '[DCF] INIT EDIT DCF',

    props<{ dcfId: number }>()
);

export const InitViewDCF = createAction('[DCF] INIT VIEW DCF');

export const InitViewFromReset = createAction('[DCF] INIT VIEW DCF FROM RESET');

export const InitViewMatchingResults = createAction(
    '[DCF] INIT VIEW MATCHING RESULTS',

    props<{ dcfId: number }>()
);

export const NoAction = createAction('[DCF] NO ACTION');

export const PreloadAutoCompletesCreateOrEdit = createAction('[DCF] PRELOAD AUTO COMPLETES CREATE OR EDIT');

export const PreloadAutoCompletesCreateOrEditError = createAction('[DCF] PRELOAD AUTO COMPLETES CREATE OR EDIT ERROR');

export const PreloadAutoCompletesCreateOrEditSuccess = createAction(
    '[DCF] PRELOAD AUTO COMPLETES CREATE OR EDIT SUCCESS'
);

export const PreloadAutoCompletesView = createAction('[DCF] PRELOAD AUTO COMPLETES VIEW');

export const PreloadAutoCompletesViewError = createAction('[DCF] PRELOAD AUTO COMPLETES VIEW ERROR');

export const PreloadAutoCompletesViewSuccess = createAction('[DCF] PRELOAD AUTO COMPLETES VIEW SUCCESS');

export const ReloadDCF = createAction('[DCF] RELOAD DCF');

export const ResetDCF = createAction('[DCF] RESET DCF');

export const ResetDCFError = createAction('[DCF] RESET DCF ERROR');

export const ResetNonDCFField = createAction('[DCF STEP 1] RESET NON DCF FIELD');

export const ResetSampleValidityWasUpdated = createAction('[DCF] RESET SAMPLE VALIDITY WAS UPDATED');

export const SaveCancelDCFError = createAction(
    '[DCF] SAVE CANCEL DCF ERROR',

    props<{ error: any }>()
);

export const SaveCancelDCFSuccess = createAction('[DCF] SAVE CANCEL DCF SUCCESS');

export const SaveDCF = createAction('[DCF] SAVE DCF');

export const SaveDCFError = createAction(
    '[DCF] SAVE DCF ERROR',

    props<{ error: Exception }>()
);

export const SaveDCFSuccess = createAction(
    '[DCF] SAVE DCF SUCCESS',

    props<{ dcf: DCF }>()
);

export const SaveSampleInState = createAction(
    '[DCF] SAVE SAMPLE IN STATE',

    props<{ sample: Sample }>()
);

export const SetABPErrors = createAction(
    '[DCF] SET HAS ABP ERRORS',

    props<{ hasAPBErrors: boolean }>()
);

export const SetDCFDefaultValues = createAction(
    '[DCF] SET DCF DEFAULT VALUES',

    props<{
        ados: Array<ListItem>;
        dtps: Array<ListItem>;
        orgId: number;
    }>()
);

export const SetIsUserAnonymous = createAction('[DCF] SET IS ANONYMOUS USER');

export const SetIsUserAnonymousSuccess = createAction(
    '[DCF] SET IS ANONYMOUS USER SUCCESS',

    props<{ isUserAnonymous: boolean }>()
);

export const SetSecurity = createAction(
    '[DCF] SET DCF SECURITY',

    props<{ fields: Map<string, string>; actions: Array<string> }>()
);

export const SubmitCurrentStep = createAction('[DCF] SUBMIT CURRENT STEP');

export const SubmitCurrentStepErrors = createAction(
    '[DCF] SUBMIT CURRENT STEP ERRORS',

    props<{ section: StepsSection; errors: NumberOfErrorsPerCategory }>()
);

export const SubmitCurrentStepSuccess = createAction('[DCF] SUBMIT CURRENT STEP SUCCESS');

export const UpdateMatchingResultStatus = createAction(
    '[DCF] UPDATE MATCHING RESULT STATUS',

    props<{ jarCode: string; statusSpecificCode: string }>()
);

export const UpdateMatchingResultStatusError = createAction('[DCF] UPDATE MATCHING RESULT STATUS ERROR');

export const UpdateMatchingResultStatusSuccess = createAction(
    '[DCF] UPDATE MATCHING RESULT STATUS SUCCESS',

    props<{ updatedDCF: DCF; statusSpecificCode: string }>()
);
