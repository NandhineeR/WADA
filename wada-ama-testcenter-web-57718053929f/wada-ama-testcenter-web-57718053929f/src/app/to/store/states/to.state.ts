import { ConflictException, UnprocessableEntityError } from '@core/models';
import { IFeatureState } from '@core/store';
import { Analysis, Attachment, FieldsSecurity, GenericActivity, ListItem, MajorEvent, TOItem } from '@shared/models';
import {
    IncompatibleTestParticipantDiscipline,
    SearchAthleteResult,
    Test,
    TestingOrderRow,
    TestStatuses,
    TestingOrder,
    TestingOrderMode,
    AthleteGroup,
    StepsSubmitted,
    StepsErrors,
} from '@to/models';

export interface IViewTOState extends IFeatureState {
    activitiesError: boolean;
    athleteGroups: Array<AthleteGroup> | null;
    athletesError: boolean;
    attachments: Array<Attachment>;
    cancelledTests: Array<Test>;
    closedAnalysis: Analysis | undefined;
    closedTests: Array<Test>;
    conflictException: ConflictException | undefined;
    disableSaving: boolean;
    error: boolean;
    errorMessageKey: string | null;
    fieldsSecurity: FieldsSecurity | null;
    genericActivities: Array<GenericActivity>;
    hasBeenCancelled: boolean;
    hasBeenCompleted: boolean;
    hasBeenDeleted: boolean;
    hasBeenIssued: boolean;
    hasBeenSaved: boolean;
    hasBeenSubmitted: StepsSubmitted;
    incompatibleTestParticipants: Array<IncompatibleTestParticipantDiscipline>;
    loadingAthletes: boolean;
    loadingTestingOrders: boolean;
    majorEvent: MajorEvent | null;
    majorEvents: Array<ListItem>;
    mode: TestingOrderMode;
    resetTO: boolean;
    saveError: boolean;
    saving: boolean;
    searchAthleteResult: Array<SearchAthleteResult>;
    stepsErrors: StepsErrors;
    submitCurrentStep: boolean;
    tempTests: Array<Test>;
    statusUpdateError: boolean;
    testStatuses: TestStatuses | null;
    testingOrderRows: Array<TestingOrderRow>;
    testingOrders: Array<TOItem>;
    testsHaveBeenMoved: boolean;
    to: TestingOrder;
    unprocessableEntityError: UnprocessableEntityError | null;
}

export const initialTOState: IViewTOState = {
    activitiesError: false,
    athleteGroups: null,
    athletesError: false,
    attachments: [],
    cancelledTests: [],
    closedAnalysis: undefined,
    closedTests: [],
    conflictException: undefined,
    disableSaving: true,
    fieldsSecurity: null,
    error: false,
    errorMessageKey: null,
    genericActivities: [],
    hasBeenCancelled: false,
    hasBeenCompleted: false,
    hasBeenDeleted: false,
    hasBeenIssued: false,
    hasBeenSaved: false,
    hasBeenSubmitted: new StepsSubmitted(),
    incompatibleTestParticipants: [],
    loadingAthletes: false,
    loadingTestingOrders: false,
    majorEvent: null,
    majorEvents: [],
    mode: TestingOrderMode.Create,
    resetTO: false,
    saveError: false,
    saving: false,
    searchAthleteResult: [],
    stepsErrors: new StepsErrors(),
    submitCurrentStep: false,
    tempTests: [],
    statusUpdateError: false,
    testStatuses: null,
    testingOrderRows: [],
    testingOrders: [],
    testsHaveBeenMoved: false,
    to: new TestingOrder(),
    unprocessableEntityError: null,
};
