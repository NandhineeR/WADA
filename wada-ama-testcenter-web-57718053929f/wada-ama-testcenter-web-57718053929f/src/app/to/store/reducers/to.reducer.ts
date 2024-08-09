import { ConflictException, UnprocessableEntityError } from '@core/models';
import { Action, createReducer, on } from '@ngrx/store';
import {
    Analysis,
    Attachment,
    AttachmentType,
    FieldsSecurity,
    LaboratoryNote,
    TestParticipant,
    UnprocessableEntityTypeEnum,
} from '@shared/models';
import { StepsErrors, Test, TestingOrder, TestingOrderMode } from '@to/models';
import { cloneDeep } from 'lodash-es';
import * as fromViewTOState from '@to/store/states/to.state';
import * as fromTO from '@to/store/actions';
import { mapToTestingOrderRows } from '@to/mappers/testing-order-row.mapper';
import { initializeCurrentStepErrors, initializeErrors } from '@to/utils/step.utils';
import {
    buildLaboratoryNotes,
    removeTestsFromTO,
    removeTestsWithoutSportDisciplineFromTO,
    setAuthoritiesDefaultValues,
    submitForm,
    updateAnalysis,
    updateTests,
} from './to-reducer.utils';

type IViewTOState = fromViewTOState.IViewTOState;

export const toReducer = createReducer(
    fromViewTOState.initialTOState,
    on(fromTO.CancelCurrentStepSubmission, (state) => ({
        ...state,
        submitCurrentStep: false,
    })),
    on(fromTO.CancelChangeTestingOrder, (state) => ({
        ...state,
        to: {
            ...state.to,
            copiedTestingOrderNumber: '',
        },
        loading: true,
        hasBeenSaved: false,
        error: false,
    })),
    on(fromTO.CancelTestingOrderSuccess, (state) => ({
        ...state,
        hasBeenCancelled: true,
        hasBeenIssued: false,
        hasBeenCompleted: false,
        hasBeenSaved: false,
        hasBeenDeleted: false,
    })),
    on(fromTO.CancelTests, (state) => ({
        ...state,
        statusUpdateError: false,
    })),
    on(fromTO.CancelTestsError, (state) => ({
        ...state,
        statusUpdateError: true,
    })),
    on(fromTO.CancelTestsSuccess, (state, action) => ({
        ...state,
        cancelledTests: action.tests,
        statusUpdateError: false,
        to: updateTests(state.to, action.tests),
    })),
    on(fromTO.CleanCancelledTests, (state) => ({
        ...state,
        statusUpdateError: false,
        cancelledTests: [],
    })),
    on(fromTO.CleanClosedAnalysis, (state) => ({
        ...state,
        statusUpdateError: false,
        closedAnalysis: undefined,
    })),
    on(fromTO.CleanClosedTests, (state) => ({
        ...state,
        statusUpdateError: false,
        closedTests: [],
    })),
    on(fromTO.CleanTestingOrder, (state) => ({
        ...state,
        to: new TestingOrder(),
        loading: false,
        error: false,
        errorMessageKey: null,
    })),
    on(fromTO.ClearParticipants, (state) => ({
        ...state,
        to: {
            ...state.to,
            testParticipants: new Array<TestParticipant>(),
        },
    })),
    on(fromTO.CloseAnalysis, (state) => ({
        ...state,
        statusUpdateError: false,
    })),
    on(fromTO.CloseAnalysisError, (state) => ({
        ...state,
        statusUpdateError: true,
        closedAnalysis: undefined,
    })),
    on(fromTO.CloseAnalysisSuccess, (state, action) => ({
        ...state,
        closedAnalysis: action.analysis,
        statusUpdateError: false,
        to: updateAnalysis(state.to, action.analysis),
    })),
    on(fromTO.CloseTests, (state) => ({
        ...state,
        statusUpdateError: false,
    })),
    on(fromTO.CloseTestsError, (state) => ({
        ...state,
        statusUpdateError: true,
    })),
    on(fromTO.CloseTestsSuccess, (state, action) => ({
        ...state,
        closedTests: action.tests,
        statusUpdateError: false,
        to: updateTests(state.to, action.tests),
    })),
    on(fromTO.CompleteTestingOrder, (state) => ({
        ...state,
        saving: true,
        error: false,
    })),
    on(fromTO.CompleteTestingOrderError, (state, action) => ({
        ...state,
        saving: false,
        error: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromTO.CompleteTestingOrderSuccess, (state) => ({
        ...state,
        saving: false,
        error: false,
        hasBeenIssued: false,
        hasBeenSaved: false,
        hasBeenDeleted: false,
        hasBeenCancelled: false,
        hasBeenCompleted: true,
    })),
    on(fromTO.DeleteTestingOrder, (state) => ({
        ...state,
        hasBeenDeleted: false,
    })),
    on(fromTO.DeleteTestingOrderError, (state) => ({
        ...state,
        hasBeenDeleted: false,
        error: true,
    })),
    on(fromTO.DeleteTestingOrderSuccess, (state) => ({
        ...state,
        hasBeenDeleted: true,
        hasBeenCompleted: false,
        hasBeenIssued: false,
        hasBeenSaved: false,
        to: new TestingOrder(),
    })),
    on(fromTO.GetAttachmentsSuccess, (state, action) => {
        const { attachments } = action;
        return { ...state, attachments };
    }),
    on(fromTO.GetCondensedTestingOrders, (state) => ({
        ...state,
        loadingTestingOrders: true,
    })),
    on(fromTO.GetCondensedTestingOrdersError, (state) => ({
        ...state,
        error: true,
        loading: false,
        loadingTestingOrders: false,
    })),
    on(fromTO.GetCondensedTestingOrdersSuccess, (state, action) => ({
        ...state,
        testingOrders: action.testingOrders,
        loadingTestingOrders: false,
    })),
    on(fromTO.GetCopyTestingOrder, (state) => ({
        ...state,
        loading: true,
        error: false,
        hasBeenDeleted: false,
        conflictException: undefined,
        errorMessageKey: null,
    })),
    on(fromTO.GetCopyTestingOrderSuccess, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        errorMessageKey: null,
        to: {
            ...action.to,
            laboratoryNotes: [...buildLaboratoryNotes(action.to.tests, action.to.laboratoryNotes)],
        },
    })),
    on(fromTO.GetDcoReportAttachmentSuccess, (state, action) => {
        const urlCopy = action.url;
        return {
            ...state,
            attachments: addUrlToAttachment(state.attachments, urlCopy, AttachmentType.DCO_REPORT),
        };
    }),
    on(fromTO.GetGenericActivities, (state) => ({
        ...state,
        activitiesError: false,
        conflictException: undefined,
        genericActivities: [],
    })),
    on(fromTO.GetGenericActivitiesError, (state) => ({
        ...state,
        activitiesError: true,
    })),
    on(fromTO.GetGenericActivitiesSuccess, (state, action) => ({
        ...state,
        conflictException: undefined,
        activitiesError: false,
        genericActivities: action.genericActivities,
    })),
    on(fromTO.GetIncompatibleTestParticipantsError, (state) => ({
        ...state,
        error: true,
    })),
    on(fromTO.GetIncompatibleTestParticipantsSuccess, (state, action) => ({
        ...state,
        incompatibleTestParticipants: action.incompatibleTestParticipants,
    })),
    on(fromTO.GetMajorEvents, (state) => ({
        ...state,
        loading: true,
    })),
    on(fromTO.GetMajorEventsError, (state, action) => ({
        ...state,
        error: true,
        errorMessageKey: action.error?.messageKey || null,
        loading: false,
    })),
    on(fromTO.GetMajorEventsSuccess, (state, action) => ({
        ...state,
        majorEvents: action.majorEvents,
        loading: false,
    })),
    on(fromTO.GetTestingOrder, (state) => ({
        ...state,
        loading: true,
        error: false,
        hasBeenDeleted: false,
        conflictException: undefined,
        errorMessageKey: null,
        unprocessableEntityError: null,
    })),
    on(fromTO.GetTestingOrderError, (state, action) => ({
        ...state,
        loading: false,
        error: true,
        disableSaving: true,
        errorMessageKey: action.error?.messageKey || null,
        unprocessableEntityError: action.isUnprocessableEntityError ? addEntityType(action.error) : null,
    })),
    on(fromTO.GetTestingOrderSuccess, (state, action) => {
        const isTOCopied = state.to.id === action.to.id || !state.to.id;
        const copiedTestingOrderNumber = isTOCopied
            ? state.to.copiedTestingOrderNumber
            : action.to.copiedTestingOrderNumber;
        return {
            ...state,
            loading: false,
            error: false,
            errorMessageKey: null,
            to: {
                ...action.to,
                copiedTestingOrderNumber,
                laboratoryNotes: [...buildLaboratoryNotes(action.to.tests, action.to.laboratoryNotes)],
            },
        };
    }),
    on(fromTO.GetTestingOrderRows, (state) => ({
        ...state,
        error: false,
        loadingTestingOrders: true,
    })),
    on(fromTO.GetTestingOrderRowsError, (state) => ({
        ...state,
        error: true,
        loading: false,
        loadingTestingOrders: false,
    })),
    on(fromTO.GetTestingOrderRowsSuccess, (state, action) => ({
        ...state,
        testingOrderRows: mapToTestingOrderRows(action.testingOrders),
        error: false,
        loadingTestingOrders: false,
    })),
    on(fromTO.InitCreateTestingOrder, (state) => ({
        ...state,
        error: false,
        errorMessageKey: null,
        hasBeenCancelled: false,
        hasBeenCompleted: false,
        hasBeenDeleted: false,
        hasBeenIssued: false,
        hasBeenSaved: false,
        loading: false,
        majorEvent: null,
        mode: TestingOrderMode.Create,
        saveError: false,
        to: new TestingOrder(),
    })),
    on(fromTO.InitEditTestingOrder, (state) => ({
        ...state,
        loading: true,
        error: false,
        saveError: false,
        errorMessageKey: null,
        disableSaving: false,
        hasBeenIssued: false,
        hasBeenCompleted: false,
        hasBeenSaved: false,
        hasBeenDeleted: false,
        hasBeenCancelled: false,
        mode: TestingOrderMode.Edit,
    })),
    on(fromTO.InitViewTestingOrder, (state) => ({
        ...state,
        loading: true,
        testsHaveBeenMoved: false,
        hasBeenIssued: false,
        hasBeenSaved: false,
        hasBeenDeleted: false,
        hasBeenCancelled: false,
        hasBeenCompleted: false,
    })),
    on(fromTO.IssueTestingOrder, (state) => ({
        ...state,
        saving: true,
        error: false,
        errorMessageKey: null,
    })),
    on(fromTO.IssueTestingOrderError, (state, action) => ({
        ...state,
        saving: false,
        error: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromTO.IssueTestingOrderSuccess, (state) => ({
        ...state,
        saving: false,
        error: false,
        errorMessageKey: null,
        hasBeenIssued: true,
        hasBeenSaved: false,
        hasBeenDeleted: false,
        hasBeenCancelled: false,
    })),
    on(fromTO.MoveToTestingOrder, (state) => ({
        ...state,
        testsHaveBeenMoved: false,
    })),
    on(fromTO.MoveToTestingOrderError, (state) => ({
        ...state,
        testsHaveBeenMoved: false,
        error: true,
    })),
    on(fromTO.MoveToTestingOrderSuccess, (state, action) => ({
        ...state,
        testsHaveBeenMoved: true,
        to: removeTestsFromTO(state.to, action.tests),
    })),
    on(fromTO.PreloadAutoCompletesCreateOrEdit, (state) => ({
        ...state,
        disableSaving: true,
    })),
    on(fromTO.PreloadAutoCompletesCreateOrEditError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.PreloadAutoCompletesCreateOrEditSuccess, (state) => ({
        ...state,
        disableSaving: false,
    })),
    on(fromTO.PreloadAutoCompletesView, (state) => ({
        ...state,
        disableSaving: true,
    })),
    on(fromTO.PreloadAutoCompletesViewError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.PreloadAutoCompletesViewSuccess, (state) => ({
        ...state,
        disableSaving: false,
    })),
    on(fromTO.PreloadDCFAutoCompletes, (state) => ({
        ...state,
        disableSaving: true,
    })),
    on(fromTO.PreloadDCFAutoCompletesError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.PreloadDCFAutoCompletesSuccess, (state) => ({
        ...state,
        disableSaving: false,
    })),
    on(fromTO.ResetTestingOrder, (state) => ({
        ...state,
        resetTO: !state.resetTO,
    })),
    on(fromTO.ResetTestingOrderError, (state) => ({
        ...state,
        error: false,
        saveError: false,
        errorMessageKey: null,
    })),
    on(fromTO.SaveTestingOrder, (state) => ({
        ...state,
        disableSaving: true,
        saving: true,
        error: false,
        saveError: false,
        errorMessageKey: null,
    })),
    on(fromTO.SaveTestingOrderError, (state, action) => ({
        ...state,
        saving: false,
        error: true,
        saveError: true,
        errorMessageKey: action.error.messageKey || null,
        conflictException: action.error instanceof ConflictException ? action.error : undefined,
        disableSaving: false,
    })),
    on(fromTO.SaveTestingOrderSuccess, (state, action) => {
        const stepsErrors = initializeErrors(action.to);
        return {
            ...state,
            saving: false,
            hasBeenSaved: true,
            hasBeenDeleted: false,
            hasBeenCancelled: false,
            hasBeenIssued: false,
            hasBeenCompleted: false,
            to: action.to,
            stepsErrors,
            error: false,
            saveError: false,
            errorMessageKey: null,
            conflictException: undefined,
            disableSaving: false,
        };
    }),
    on(fromTO.SetDisableSaving, (state, action) => ({
        ...state,
        disableSaving: action.disableSaving,
    })),
    on(fromTO.SetErrorAndResetTestingOrder, (state, action) => ({
        ...state,
        to: new TestingOrder(),
        loading: false,
        error: true,
        errorMessageKey: action.error?.messageKey || null,
    })),
    on(fromTO.SetSecurity, (state, action) => ({
        ...state,
        fieldsSecurity: new FieldsSecurity({
            fields: action.fields,
            actions: action.actions,
        }),
    })),
    on(fromTO.SetDefaultValues, (state, action) => {
        return {
            ...state,
            to: setAuthoritiesDefaultValues(state.to, action.ados, action.ados.concat(action.dtps), action.orgId),
        };
    }),
    on(fromTO.SubmitCurrentStep, (state) => ({
        ...state,
        submitCurrentStep: true,
    })),
    on(fromTO.SubmitCurrentStepErrors, (state, action) => {
        return {
            ...state,
            stepsErrors: initializeCurrentStepErrors(action.errors, action.section, new StepsErrors(state.stepsErrors)),
        };
    }),
    on(fromTO.SubmitCurrentStepSuccess, (state) => ({
        ...state,
        submitCurrentStep: false,
    })),
    /**
     * STEP 1 ACTIONS
     */
    on(fromTO.Step1GetMajorEvent, (state) => ({
        ...state,
        loading: true,
    })),
    on(fromTO.Step1GetMajorEventError, (state, action) => ({
        ...state,
        loading: false,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromTO.Step1GetMajorEventSuccess, (state, action) => ({
        ...state,
        majorEvent: action.majorEvent,
        loading: false,
    })),
    on(fromTO.Step1ResetCompetition, (state) => ({
        ...state,
        majorEvent: null,
        to: new TestingOrder({
            ...state.to,
            majorGameEvent: null,
            testTiming: null,
            testType: false,
        }),
    })),
    on(fromTO.Step1ResetMajorEvent, (state) => ({
        ...state,
        majorEvent: null,
    })),
    on(fromTO.Step1GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.Step1SubmitForm, (state, action) => {
        return submitForm(0, state, action);
    }),
    /**
     * STEP 2 ACTIONS
     */
    on(fromTO.Step2GetTestStatusesSuccess, (state, action) => ({
        ...state,
        testStatuses: action.statuses,
    })),
    on(fromTO.Step2AddAnalysesToTests, (state, action) => {
        const newTests: Array<Test> = new Array<Test>();
        state.to.tests.forEach((stateTest: Test) => {
            const idx = action.modifiedTests.findIndex((test: Test) => test.tempId === stateTest.tempId);
            if (idx > -1) {
                newTests.push(new Test(action.modifiedTests[idx]));
            } else {
                newTests.push(new Test(stateTest));
            }
        });
        return {
            ...state,
            to: {
                ...state.to,
                tests: [...newTests],
                laboratoryNotes: [...buildLaboratoryNotes(newTests, state.to.laboratoryNotes)],
            },
        };
    }),
    on(fromTO.Step2AddAthletesAsATest, (state, action) => ({
        ...state,
        to: {
            ...state.to,
            tests: [...state.to.tests.concat(action.addedAthletes)],
            laboratoryNotes: [
                ...buildLaboratoryNotes([...state.to.tests.concat(action.addedAthletes)], state.to.laboratoryNotes),
            ],
        },
    })),
    on(fromTO.Step2AddPlaceholderAsATest, (state, action) => ({
        ...state,
        to: {
            ...state.to,
            tests: [...state.to.tests.concat(action.tests)],
        },
    })),
    on(fromTO.Step2AddTemporaryTests, (state, action) => ({
        ...state,
        tempTests: action.addedTests,
    })),
    on(fromTO.Step2ClearAthleteGroups, (state) => ({
        ...state,
        loadingAthletes: false,
        athletesError: false,
        athleteGroups: null,
    })),
    on(fromTO.Step2DeleteTempTests, (state) => ({
        ...state,
        tempTests: [],
    })),
    on(fromTO.Step2DeleteTest, (state, action) => {
        const index = state.to.tests.findIndex(
            (test: Test) => (test.id === action.id && action.id !== null) || test.tempId === action.tempId
        );
        if (index > -1) {
            // Delete a laboratory note only if the laboratory is last occurrence in the combined test
            const labNotes = cloneDeep(state.to.laboratoryNotes);
            state.to.tests[index].analyses.forEach((analyse: Analysis) => {
                const labIdx = labNotes.findIndex(
                    (lab: LaboratoryNote) =>
                        analyse.laboratory && lab.laboratory && analyse.laboratory.id === lab.laboratory.id
                );
                if (labNotes[labIdx].numberOfOccurrences > 1) {
                    labNotes[labIdx].numberOfOccurrences -= 1;
                } else {
                    labNotes.splice(labIdx, 1);
                }
            });

            return {
                ...state,
                to: {
                    ...state.to,
                    tests: [
                        ...state.to.tests.slice(0, index),
                        ...state.to.tests.slice(index + 1, state.to.tests.length),
                    ],
                    laboratoryNotes: [...labNotes],
                },
            };
        }
        return { ...state };
    }),
    on(fromTO.Step2GetAthleteGroups, (state) => ({
        ...state,
        athletesError: false,
        loadingAthletes: true,
    })),
    on(fromTO.Step2GetAthleteGroupsError, (state) => ({
        ...state,
        athletesError: true,
        loadingAthletes: false,
        athleteGroups: null,
    })),
    on(fromTO.Step2GetAthleteGroupsSuccess, (state, action) => ({
        ...state,
        loadingAthletes: false,
        athletesError: false,
        athleteGroups: action.athleteGroups,
    })),
    on(fromTO.Step2RemoveTestsWithoutSport, (state, action) => ({
        ...state,
        to: removeTestsWithoutSportDisciplineFromTO(state.to, action.tests),
    })),
    on(fromTO.Step2SearchAthletes, (state) => ({
        ...state,
        loadingAthletes: true,
    })),
    on(fromTO.Step2SearchAthletesClear, (state) => ({
        ...state,
        searchAthleteResult: [],
        loadingAthletes: false,
    })),
    on(fromTO.Step2SearchAthletesClose, (state) => ({
        ...state,
        loadingAthletes: false,
    })),
    on(fromTO.Step2SearchAthletesError, (state) => ({
        ...state,
        athletesError: true,
        loadingAthletes: false,
    })),
    on(fromTO.Step2SearchAthletesSuccess, (state, action) => ({
        ...state,
        loadingAthletes: false,
        athletesError: false,
        searchAthleteResult: action.searchAthletes,
    })),
    on(fromTO.Step2GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.Step2SubmitForm, (state, action) => {
        return submitForm(1, state, action);
    }),
    /**
     * STEP 3 ACTIONS
     */
    on(fromTO.Step3GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.Step3SubmitForm, (state, action) => {
        return submitForm(2, state, action);
    }),
    /**
     * STEP 4 ACTIONS
     */
    on(fromTO.Step4GetAutoCompletesError, (state) => ({
        ...state,
        disableSaving: false,
        error: true,
    })),
    on(fromTO.Step4SubmitForm, (state, action) => {
        return submitForm(3, state, action);
    })
);

export function reducer(state: IViewTOState | undefined, action: Action): IViewTOState {
    return toReducer(state, action);
}

function addEntityType(actionError: UnprocessableEntityError | null): UnprocessableEntityError | null {
    if (actionError) {
        const unprocessableEntityError = new UnprocessableEntityError(actionError);

        unprocessableEntityError.unprocessableEntities[0].parameters = actionError.unprocessableEntities[0].parameters;
        unprocessableEntityError.entityType = convertErrorCodeToEntityType(
            unprocessableEntityError.unprocessableEntities[0].code
        );

        return unprocessableEntityError;
    }

    return null;
}

function addUrlToAttachment(attachments: Array<Attachment>, url: string, type: AttachmentType): Array<Attachment> {
    const attachmentsCopy = JSON.parse(JSON.stringify(attachments));
    attachmentsCopy.map((attachment: Attachment) => {
        if (attachment.attachmentType === type) attachment.url = url;
        return attachment;
    });
    return attachmentsCopy;
}

function convertErrorCodeToEntityType(unprocessableEntityErrorCode: string | undefined): string | undefined {
    if (unprocessableEntityErrorCode === 'TESTINGORDER_TEST_COUNT_EXCEEDED') {
        return UnprocessableEntityTypeEnum.TESTINGORDER_TEST_COUNT_EXCEEDED.toString();
    }

    if (unprocessableEntityErrorCode === 'SEND_NOTIFICATION_RESULT_TO_COUNT_EXCEEDED') {
        return UnprocessableEntityTypeEnum.SEND_NOTIFICATION_RESULT_TO_COUNT_EXCEEDED.toString();
    }

    return undefined;
}
