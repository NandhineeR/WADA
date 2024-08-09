import { ConflictException } from '@core/models';
import { IFeatureState } from '@core/store';
import {
    DCF,
    DCFMode,
    LabResult,
    NonDCFField,
    Sample,
    StepsErrors,
    StepsSubmitted,
    TimeSlot,
    Timezone,
    UrineSampleBoundaries,
} from '@dcf/models';
import { Attachment, FieldsSecurity, ListItem, TOItem } from '@shared/models';

export interface IDCFState extends IFeatureState {
    activitiesError: boolean;
    attachments: Array<Attachment>;
    conflictException: ConflictException | null;
    currentDcf: DCF;
    error: boolean;
    errorMessageKey: string | null;
    fieldsSecurity: FieldsSecurity | null;
    hasABPErrors: boolean;
    hasBeenDeleted: boolean;
    hasBeenSaved: boolean;
    hasBeenSubmitted: StepsSubmitted;
    isUserAnonymous: boolean;
    labResult: LabResult | undefined;
    loading: boolean;
    loadingTOs: boolean;
    majorEvents: Array<ListItem>;
    mode: DCFMode;
    nonDCFFields: NonDCFField;
    originalDcf: DCF;
    reloadDCFView: boolean;
    resetDcf: boolean;
    sample: Sample | undefined;
    sampleValidityWasUpdated: boolean | null;
    saveError: boolean;
    saving: boolean;
    showSampleMatchingResultConfirmedMessage: boolean;
    showSampleMatchingResultRejectedMessage: boolean;
    stepsErrors: StepsErrors;
    submitCurrentStep: boolean;
    testingOrderHasChanged: boolean;
    timeSlots: Array<TimeSlot> | null;
    timezoneDefault: Timezone;
    to: TOItem | undefined;
    tos: Array<TOItem>;
    urineSampleBoundaries: UrineSampleBoundaries | null;
}

export const initialDCFState: IDCFState = {
    activitiesError: false,
    attachments: [],
    conflictException: null,
    currentDcf: new DCF(),
    error: false,
    errorMessageKey: null,
    fieldsSecurity: null,
    hasABPErrors: false,
    hasBeenDeleted: false,
    hasBeenSaved: false,
    hasBeenSubmitted: new StepsSubmitted(),
    isUserAnonymous: false,
    labResult: new LabResult(),
    loading: false,
    loadingTOs: false,
    majorEvents: [],
    mode: DCFMode.CreateFromAthlete,
    nonDCFFields: new NonDCFField(),
    originalDcf: new DCF(),
    reloadDCFView: false,
    resetDcf: false,
    sample: undefined,
    sampleValidityWasUpdated: null,
    saveError: false,
    saving: false,
    showSampleMatchingResultConfirmedMessage: false,
    showSampleMatchingResultRejectedMessage: false,
    stepsErrors: new StepsErrors(),
    submitCurrentStep: false,
    testingOrderHasChanged: false,
    timeSlots: new Array<TimeSlot>(),
    timezoneDefault: new Timezone(),
    to: new TOItem(),
    tos: [],
    urineSampleBoundaries: null,
};
