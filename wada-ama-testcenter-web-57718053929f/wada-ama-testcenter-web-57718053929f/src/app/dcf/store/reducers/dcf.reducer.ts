import { AttachmentType, FieldsSecurity, SpecificCode } from '@shared/models';
import { Action, createReducer, on } from '@ngrx/store';
import { ConflictException } from '@core/models';
import * as fromDCFState from '@dcf/store/states/dcf.state';
import * as fromDCF from '@dcf/store/actions';
import {
    AuthorizationInformation,
    DCF,
    DCFMode,
    NonDCFField,
    SampleInformation,
    StepsErrors,
    StepsSection,
} from '@dcf/models';
import { mapTOItem, mergeAthleteExtraFromTOFieldsToDCF, mergeAthleteToDCF, mergeTOWithDCF } from '@dcf/mappers';
import { mapConflictException, mapSampleWarningToException } from '@dcf/store/mappers';
import { initializeCurrentStepErrors, initializeStepsErrors } from '@dcf/utils/steps.utils';
import { currentDCFWithDefaultPhone } from '@dcf/utils/dcf.utils';
import {
    initializeNonDCFFieldFromDCF,
    updateAuthority,
    submitForm,
    updateTimezoneFieldsFromRootSource,
    setAuthorizationDefaultValues,
    addUrlToAttachment,
} from './dcf-reducer.utils';

type IDCFState = fromDCFState.IDCFState;

export const dcfReducer = createReducer(
    fromDCFState.initialDCFState,
    on(fromDCF.BindDCFToTestingOrder, (state) => ({
        ...state,
        loading: true,
        error: false,
        conflictException: null,
        testingOrderHasChanged: false,
    })),
    on(fromDCF.BindDCFToTestingOrderError, (state) => ({
        ...state,
        loading: false,
        error: true,
        testingOrderHasChanged: false,
    })),
    on(fromDCF.BindDCFToTestingOrderSuccess, (state, action) => {
        const nonDCFFields = initializeNonDCFFieldFromDCF(
            action.dcf,
            state.nonDCFFields.test,
            state.nonDCFFields.athlete,
            state.nonDCFFields.genericActivities
        );
        const stepsErrorsBindDCF = initializeStepsErrors(action.dcf, state);
        return {
            ...state,
            loading: false,
            currentDcf: action.dcf,
            nonDCFFields,
            stepsErrors: stepsErrorsBindDCF,
            error: false,
            conflictException: null,
            resetDcf: false,
            testingOrderHasChanged: true,
        };
    }),
    on(fromDCF.BreakSampleMatch, (state) => ({
        ...state,
        reloadDCFView: false,
    })),
    on(fromDCF.BreakSampleMatchSuccess, (state) => ({
        ...state,
        reloadDCFView: true,
    })),
    on(fromDCF.CancelDCF, (state) => ({
        ...state,
        loading: true,
        hasBeenSaved: false,
        error: false,
        conflictException: null,
    })),
    on(fromDCF.ChangeDCFStatusCancel, (state) => ({
        ...state,
        error: false,
        conflictException: null,
        loading: true,
    })),
    on(fromDCF.ChangeSampleCode, (state) => ({
        ...state,
        reloadDCFView: false,
    })),
    on(fromDCF.ChangeSampleCodeSuccess, (state) => ({
        ...state,
        reloadDCFView: true,
    })),
    on(fromDCF.ChangeSampleType, (state) => ({
        ...state,
        reloadDCFView: false,
    })),
    on(fromDCF.ChangeSampleTypeSuccess, (state) => ({
        ...state,
        reloadDCFView: true,
    })),
    on(fromDCF.ChangeSampleValidity, (state) => ({
        ...state,
        sampleValidityWasUpdated: null,
    })),
    on(fromDCF.ChangeSampleValidityError, (state) => ({
        ...state,
        sampleValidityWasUpdated: false,
    })),
    on(fromDCF.ChangeSampleValiditySuccess, (state) => ({
        ...state,
        sampleValidityWasUpdated: true,
    })),
    on(fromDCF.CreateDCFFromAthlete, (state, action) => {
        const dcf = mergeAthleteToDCF(action.athlete, state.currentDcf);
        const nonDCFFields = initializeNonDCFFieldFromDCF(dcf, state.nonDCFFields.test, action.athlete);
        const stepsErrorsCreateDCF = initializeStepsErrors(dcf, state);
        return {
            ...state,
            currentDcf: dcf,
            originalDcf: dcf,
            nonDCFFields,
            stepsErrors: stepsErrorsCreateDCF,
            loading: false,
            error: false,
            conflictException: null,
            errorMessageKey: null,
        };
    }),
    on(fromDCF.DeleteDCF, (state) => ({
        ...state,
        hasBeenDeleted: false,
    })),
    on(fromDCF.DeleteDCFError, (state) => ({
        ...state,
        hasBeenDeleted: false,
        error: true,
    })),
    on(fromDCF.DeleteDCFSuccess, (state) => ({
        ...state,
        hasBeenDeleted: true,
    })),
    on(fromDCF.GetAthlete, (state, action) => ({
        ...state,
        mode: action.mode,
        loading: true,
        error: false,
        conflictException: null,
    })),
    on(fromDCF.GetAthleteError, currentStateWithError),
    on(fromDCF.GetAthleteSuccess, (state, action) => {
        let dcfWithAddress = mergeAthleteExtraFromTOFieldsToDCF(action.athlete, state.currentDcf, action.mode);
        dcfWithAddress = currentDCFWithDefaultPhone(
            dcfWithAddress,
            action.athlete.phoneNumbers,
            action.countriesWithRegions
        );
        return {
            ...state,
            currentDcf: dcfWithAddress,
            originalDcf: dcfWithAddress,
            nonDCFFields: {
                ...state.nonDCFFields,
                athlete: action.athlete,
            },
            loading: false,
            error: false,
            conflictException: null,
        };
    }),
    on(fromDCF.GetAttachmentsAthletePhotoSuccess, (state, action) => {
        return {
            ...state,
            attachments: addUrlToAttachment(state.attachments, action.url, AttachmentType.ATHLETE_PHOTO),
            loading: false,
        };
    }),
    on(fromDCF.GetAttachmentsChainOfCustodySuccess, (state, action) => {
        return {
            ...state,
            attachments: addUrlToAttachment(state.attachments, action.url, AttachmentType.CHAIN_OF_CUSTODY),
        };
    }),
    on(fromDCF.GetAttachmentsNotificationSuccess, (state, action) => {
        return {
            ...state,
            attachments: addUrlToAttachment(state.attachments, action.url, AttachmentType.NOTIFICATION),
        };
    }),
    on(fromDCF.GetAttachmentsSignedCopySuccess, (state, action) => {
        return {
            ...state,
            attachments: addUrlToAttachment(state.attachments, action.url, AttachmentType.SIGNED_DCF),
        };
    }),
    on(fromDCF.GetAttachmentsSuccess, (state, action) => {
        const { attachments } = action;
        return { ...state, attachments };
    }),
    on(fromDCF.GetDCF, (state) => ({
        ...state,
        loading: true,
        error: false,
        conflictException: null,
        errorMessageKey: null,
    })),
    on(fromDCF.GetDCFError, (state, action) => ({
        ...state,
        error: true,
        conflictException: action.error instanceof ConflictException ? action.error : null,
        loading: false,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromDCF.GetDCFSuccess, (state, action) => {
        const nonDCFFields = initializeNonDCFFieldFromDCF(
            action.dcf,
            state.nonDCFFields.test,
            undefined,
            state.nonDCFFields.genericActivities
        );
        const stepsErrorsGetDCF = initializeStepsErrors(action.dcf, state);
        return {
            ...state,
            loading: false,
            currentDcf: action.dcf,
            originalDcf: action.dcf,
            nonDCFFields,
            stepsErrors: stepsErrorsGetDCF,
            error: false,
            conflictException: null,
            resetDcf: false,
        };
    }),
    on(fromDCF.GetGenericActivities, (state) => ({
        ...state,
        activitiesError: false,
        conflictException: null,
        nonDCFFields: {
            ...state.nonDCFFields,
            genericActivities: [],
        },
    })),
    on(fromDCF.GetGenericActivitiesError, (state) => ({
        ...state,
        activitiesError: true,
    })),
    on(fromDCF.GetGenericActivitiesSuccess, (state, action) => ({
        ...state,
        conflictException: null,
        activitiesError: false,
        nonDCFFields: {
            ...state.nonDCFFields,
            genericActivities: action.genericActivities,
        },
    })),
    on(fromDCF.GetLabResult, (state) => ({
        ...state,
        loading: true,
        showSampleMatchingResultConfirmedMessage: false,
        showSampleMatchingResultRejectedMessage: false,
    })),
    on(fromDCF.GetLabResultError, currentStateWithError),
    on(fromDCF.GetLabResultSuccess, (state, action) => ({
        ...state,
        labResult: action.labResult,
        loading: false,
    })),
    on(fromDCF.GetTOError, currentStateWithError),
    on(fromDCF.GetTest, (state, action) => ({
        ...state,
        error: false,
        conflictException: null,
        currentDcf: action.fromTo ? new DCF() : state.currentDcf,
    })),
    on(fromDCF.GetTestError, (state) => ({
        ...state,
        error: true,
    })),
    on(fromDCF.GetTestSuccess, (state, action) => {
        const toItem = Object.keys(action.test).length > 0 ? mapTOItem(action.test) : undefined;
        const dcf = mergeTOWithDCF(toItem, new DCF());
        const nonDCFFields = initializeNonDCFFieldFromDCF(dcf, action.test);
        const stepsErrorsGetTO = initializeStepsErrors(dcf, state);
        return {
            ...state,
            mode: DCFMode.CreateFromTO,
            to: toItem,
            currentDcf: dcf,
            originalDcf: dcf,
            nonDCFFields,
            stepsErrors: stepsErrorsGetTO,
            loading: false,
            error: false,
            conflictException: null,
        };
    }),
    on(fromDCF.GetTestingOrders, (state) => ({
        ...state,
        loadingTOs: true,
    })),
    on(fromDCF.GetTestingOrdersError, (state) => ({
        ...state,
        error: true,
        loadingTOs: false,
    })),
    on(fromDCF.GetTestingOrdersSuccess, (state, action) => ({
        ...state,
        tos: action.testingOrders,
        loadingTOs: false,
        error: false,
    })),
    on(fromDCF.GetUrineSampleBoundariesError, (state) => ({
        ...state,
        error: true,
    })),
    on(fromDCF.GetUrineSampleBoundariesSuccess, (state, action) => {
        return {
            ...state,
            urineSampleBoundaries: action.urineSampleBoundaries,
        };
    }),
    on(fromDCF.InitCreateDCF, (state) => ({
        ...state,
        loading: true,
        error: false,
        saveError: false,
        conflictException: null,
        errorMessageKey: null,
        hasBeenSaved: false,
    })),
    on(fromDCF.InitEditDCF, (state) => ({
        ...state,
        loading: true,
        error: false,
        saveError: false,
        conflictException: null,
        errorMessageKey: null,
        mode: DCFMode.Edit,
        hasBeenSaved: false,
    })),
    on(fromDCF.InitViewDCF, (state) => ({
        ...state,
        sampleValidityWasUpdated: null,
    })),
    on(fromDCF.InitViewFromReset, (state) => ({
        ...state,
        currentDcf: state.originalDcf,
        loading: false,
    })),
    on(fromDCF.InitViewMatchingResults, (state) => ({
        ...state,
        labResult: undefined,
        loading: true,
        error: false,
        conflictException: null,
        mode: DCFMode.Edit,
        showSampleMatchingResultConfirmedMessage: false,
        showSampleMatchingResultRejectedMessage: false,
    })),
    on(fromDCF.PreloadAutoCompletesCreateOrEdit, (state) => ({
        ...state,
        disableSaving: true,
    })),
    on(fromDCF.PreloadAutoCompletesCreateOrEditError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromDCF.PreloadAutoCompletesCreateOrEditSuccess, (state) => ({
        ...state,
        disableSaving: false,
    })),
    on(fromDCF.PreloadAutoCompletesView, (state) => ({
        ...state,
        disableSaving: true,
    })),
    on(fromDCF.PreloadAutoCompletesViewError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromDCF.PreloadAutoCompletesViewSuccess, (state) => ({
        ...state,
        disableSaving: false,
    })),
    on(fromDCF.ResetDCF, (state) => ({
        ...state,
        resetDcf: !state.resetDcf,
    })),
    on(fromDCF.ResetDCFError, (state) => ({
        ...state,
        error: false,
        saveError: false,
        errorMessageKey: null,
    })),
    on(fromDCF.ResetNonDCFField, (state) => ({
        ...state,
        nonDCFFields: new NonDCFField(),
    })),
    on(fromDCF.SaveCancelDCFError, currentStateWithError),
    on(fromDCF.SaveCancelDCFSuccess, (state) => ({
        ...state,
        error: false,
        conflictException: null,
        loading: false,
    })),
    on(fromDCF.SaveDCF, (state) => ({
        ...state,
        saving: true,
        error: false,
        conflictException: null,
        errorMessageKey: null,
    })),
    on(fromDCF.SaveDCFError, (state, action) => ({
        ...state,
        saving: false,
        error: true,
        conflictException: action.error instanceof ConflictException ? action.error : null,
        saveError: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromDCF.SaveDCFSuccess, (state, action) => {
        const nonDCFFields = initializeNonDCFFieldFromDCF(action.dcf, state.nonDCFFields.test);
        const stepsErrorsSaveDCF = initializeStepsErrors(action.dcf, state);
        return {
            ...state,
            saving: false,
            hasBeenSaved: true,
            currentDcf: action.dcf,
            originalDcf: action.dcf,
            nonDCFFields,
            stepsErrors: stepsErrorsSaveDCF,
            error: false,
            conflictException: null,
            errorMessageKey: null,
        };
    }),
    on(fromDCF.SaveSampleInState, (state, action) => ({
        ...state,
        sample: action.sample,
    })),
    on(fromDCF.SetABPErrors, (state, action) => ({
        ...state,
        hasABPErrors: action.hasAPBErrors,
    })),
    on(fromDCF.SetDCFDefaultValues, (state, action) => {
        const newAuthorization = setAuthorizationDefaultValues(
            state.currentDcf.authorization,
            action.ados,
            action.ados.concat(action.dtps),
            action.orgId
        );
        return {
            ...state,
            originalDcf: {
                ...state.originalDcf,
                authorization: state.currentDcf.authorization ? state.originalDcf.authorization : newAuthorization,
            },
            currentDcf: {
                ...state.currentDcf,
                authorization: newAuthorization,
            },
        };
    }),
    on(fromDCF.SetIsUserAnonymousSuccess, (state, action) => ({
        ...state,
        isUserAnonymous: action.isUserAnonymous,
    })),
    on(fromDCF.SetSecurity, (state, action) => ({
        ...state,
        fieldsSecurity: new FieldsSecurity({
            fields: action.fields,
            actions: action.actions,
        }),
    })),
    on(fromDCF.Step1GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: true,
        error: true,
    })),
    on(fromDCF.Step1GetTimeSlots, (state) => ({
        ...state,
        error: false,
        conflictException: null,
    })),
    on(fromDCF.Step1GetTimeslotsError, (state) => ({
        ...state,
        timeSlots: null,
    })),
    on(fromDCF.Step1GetTimeslotsSuccess, (state, action) => ({
        ...state,
        timeSlots: action.timeSlots,
        error: false,
        conflictException: null,
    })),
    on(fromDCF.Step1ResetTOAndTest, (state) => {
        const authorization = new AuthorizationInformation(state.currentDcf.authorization);
        authorization.testingOrderId = null;
        authorization.testingOrderNumber = null;
        return {
            ...state,
            to: undefined,
            currentDcf: {
                ...state.currentDcf,
                authorization,
                test: null,
            },
        };
    }),
    on(fromDCF.Step1SectionAthleteSubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.AthleteSection);
    }),
    on(fromDCF.Step1SectionAuthorizationSubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.AuthorizationSection);
    }),
    on(fromDCF.Step1SectionNotificationSubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.NotificationSection);
    }),
    on(fromDCF.Step1SetTOAndTest, (state, action) => ({
        ...state,
        to: action.to,
        currentDcf: mergeTOWithDCF(action.to, state.currentDcf),
    })),
    on(fromDCF.Step1SetTimezoneDefault, (state, action) => ({
        ...state,
        timezoneDefault: action.timezoneDefault,
        currentDcf: updateTimezoneFieldsFromRootSource(state.currentDcf, action),
    })),
    on(fromDCF.Step2ExecuteSampleCodeValidation, (state) => ({
        ...state,
        error: false,
        nonDCFFields: { ...state.nonDCFFields },
    })),
    on(fromDCF.Step2ExecuteSampleCodeValidationError, (state, action) => ({
        ...state,
        conflictException: state.conflictException?.hasOptimisticLockException()
            ? state.conflictException
            : mapConflictException(action.exception),
    })),
    on(fromDCF.Step2ExecuteSampleCodeValidationSuccess, (state, action) => {
        const exception = mapSampleWarningToException(action.samples, state.currentDcf.sampleInformation?.samples);
        return {
            ...state,
            conflictException: state.conflictException?.hasOptimisticLockException()
                ? state.conflictException
                : exception,
        };
    }),
    on(fromDCF.Step2GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: true,
        error: true,
    })),
    on(fromDCF.Step2GetMajorEventError, (state, action) => ({
        ...state,
        loading: false,
        error: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromDCF.Step2GetMajorEventSuccess, (state, action) => {
        const sampleInformation: SampleInformation = new SampleInformation(state.currentDcf.sampleInformation);
        sampleInformation.majorEvent = action.majorEvent;
        return {
            ...state,
            currentDcf: {
                ...state.currentDcf,
                sampleInformation,
            },
        };
    }),
    on(fromDCF.Step2GetMajorEventsError, (state) => ({
        ...state,
        error: true,
    })),
    on(fromDCF.Step2GetMajorEventsSuccess, (state, action) => ({
        ...state,
        majorEvents: action.majorEvents,
    })),
    on(fromDCF.Step2GetTempLoggerStatus, (state) => ({
        ...state,
        conflictException: null,
        nonDCFFields: {
            ...state.nonDCFFields,
            tempLoggerStatus: undefined,
        },
    })),

    on(fromDCF.Step2GetTempLoggerStatusSuccess, (state, action) => ({
        ...state,
        conflictException: null,
        nonDCFFields: {
            ...state.nonDCFFields,
            tempLoggerStatus: action.tempLoggerStatus,
        },
    })),
    on(fromDCF.Step2ResetDefaultAuthority, (state) => {
        const authorization = new AuthorizationInformation(state.currentDcf.authorization);
        authorization.testingAuthority = state.originalDcf.authorization?.testingAuthority || null;
        authorization.sampleCollectionAuthority = state.originalDcf.authorization?.sampleCollectionAuthority || null;
        authorization.resultManagementAuthority = state.originalDcf.authorization?.resultManagementAuthority || null;
        return {
            ...state,
            currentDcf: {
                ...state.currentDcf,
                authorization,
            },
        };
    }),
    on(fromDCF.Step2ResetMajorEvent, (state) => {
        const sampleInformation = new SampleInformation(state.currentDcf.sampleInformation);
        sampleInformation.majorEvent = null;
        return {
            ...state,
            currentDcf: {
                ...state.currentDcf,
                sampleInformation,
            },
        };
    }),
    on(fromDCF.Step2ResetTempLoggerStatus, (state) => ({
        ...state,
        nonDCFFields: {
            ...state.nonDCFFields,
            tempLoggerStatus: undefined,
        },
    })),
    on(fromDCF.Step2SectionSampleSubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.SampleSection);
    }),
    on(fromDCF.Step2SubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.SampleSection);
    }),
    on(fromDCF.Step2UpdateAuthority, (state, action) => {
        const authorization = new AuthorizationInformation(state.currentDcf.authorization);
        authorization.testingAuthority = updateAuthority(action.testAuthority, authorization.testingAuthority);
        authorization.sampleCollectionAuthority = updateAuthority(
            action.sampleCollectionAuthority,
            authorization.sampleCollectionAuthority
        );
        authorization.resultManagementAuthority = updateAuthority(
            action.resultManagementAuthority,
            authorization.resultManagementAuthority
        );
        return {
            ...state,
            currentDcf: {
                ...state.currentDcf,
                authorization,
            },
        };
    }),
    on(fromDCF.Step3GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: true,
        error: true,
    })),
    on(fromDCF.Step3SectionProceduralSubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.ProceduralSection);
    }),
    on(fromDCF.Step3SubmitForm, (state, action) => {
        return submitForm(action, state, StepsSection.ProceduralSection);
    }),
    on(fromDCF.SubmitCurrentStep, (state) => ({
        ...state,
        submitCurrentStep: true,
    })),
    on(fromDCF.SubmitCurrentStepErrors, (state, action) => ({
        ...state,
        stepsErrors: initializeCurrentStepErrors(action.errors, action.section, new StepsErrors(state.stepsErrors)),
    })),
    on(fromDCF.SubmitCurrentStepSuccess, (state) => ({
        ...state,
        submitCurrentStep: false,
        saveError: false,
        errorMessageKey: null,
    })),
    on(fromDCF.UpdateMatchingResultStatus, (state) => ({
        ...state,
        loading: true,
    })),
    on(fromDCF.UpdateMatchingResultStatusError, currentStateWithError),
    on(fromDCF.UpdateMatchingResultStatusSuccess, (state, action) => ({
        ...state,
        error: false,
        loading: false,
        resetDcf: true,
        currentDcf: action.updatedDCF,
        showSampleMatchingResultConfirmedMessage: action.statusSpecificCode === SpecificCode.ConfirmedByUser,
        showSampleMatchingResultRejectedMessage: action.statusSpecificCode === SpecificCode.MatchRejectedByUser,
        nonDCFFields: new NonDCFField(),
    }))
);

export function currentStateWithError(state: IDCFState) {
    return { ...state, error: true, loading: false };
}

export function reducer(state: IDCFState | undefined, action: Action): IDCFState {
    return dcfReducer(state, action);
}
