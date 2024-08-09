import { ConflictException } from '@core/models';
import { IFeatureState } from '@core/store';
import { DCF, DCFMode, NonDCFField, TimeSlot, UrineSampleBoundaries } from '@dcf/models';
import { FieldsSecurity, TOItem, Test } from '@shared/models';

export interface IMultipleDCFState extends IFeatureState {
    autoCompletesError: boolean;
    conflictException: ConflictException | null;
    dcfs: Array<DCF>;
    error: boolean;
    errorMessageKey: string | null;
    fieldsSecurity: Map<string, FieldsSecurity>;
    hasBeenSaved: boolean;
    loading: boolean;
    mode: DCFMode;
    nonDCFFields: NonDCFField;
    saveError: boolean;
    savedDCF: Set<number | null>;
    saving: boolean;
    scaId: number | null;
    tests: Array<Test>;
    testsError: boolean;
    testsLoading: boolean;
    timeSlots: Array<TimeSlot>;
    to: TOItem | undefined;
    urineSampleBoundaries: UrineSampleBoundaries | null;
}

export const initialMultipleDCFState: IMultipleDCFState = {
    autoCompletesError: false,
    conflictException: null,
    dcfs: new Array<DCF>(),
    error: false,
    errorMessageKey: null,
    fieldsSecurity: new Map<string, FieldsSecurity>(),
    hasBeenSaved: false,
    loading: false,
    mode: DCFMode.CreateFromMultipleDCF,
    nonDCFFields: new NonDCFField(),
    saveError: false,
    savedDCF: new Set<number | null>(),
    saving: false,
    scaId: null,
    tests: new Array<Test>(),
    testsError: false,
    testsLoading: false,
    timeSlots: new Array<TimeSlot>(),
    to: new TOItem(),
    urineSampleBoundaries: null,
};
