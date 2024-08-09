import { mapDCFFromForm, mapDCFFromTest } from '@dcf/mappers';
import { mapMultipleDCFState, mapSampleWarningToException } from '@dcf/store/mappers';
import { SecurityWrapper } from '@shared/models';
import { Action, createReducer, on } from '@ngrx/store';
import { DCF, DCFMode } from '@dcf/models';
import * as fromDCFActions from '@dcf/store/actions/multiple-dcf.actions';
import * as fromMultipleDCFsState from '@dcf/store/states/multiple-dcf.state';

type IMultipleDCFState = fromMultipleDCFsState.IMultipleDCFState;

export const multipleDCFReducer = createReducer(
    fromMultipleDCFsState.initialMultipleDCFState,
    on(fromDCFActions.MultipleDCFCancel, (state) => ({
        ...state,
        loading: true,
        hasBeenSaved: false,
        error: false,
        conflictException: null,
    })),
    on(fromDCFActions.MultipleDCFChangeStatusCancel, (state) => ({
        ...state,
        error: false,
        conflictException: null,
        loading: true,
    })),
    on(fromDCFActions.MultipleDCFGetAthleteError, currentStateWithError),
    on(fromDCFActions.MultipleDCFGetAutoCompletes, (state) => ({
        ...state,
        autoCompletesError: false,
    })),
    on(fromDCFActions.MultipleDCFGetAutoCompletesError, (state) => ({
        ...state,
        error: true,
        autoCompletesError: true,
    })),
    on(fromDCFActions.MultipleDCFGetDCFs, (state) => ({
        ...state,
        loading: true,
        error: false,
        conflictException: null,
        errorMessageKey: null,
    })),
    on(fromDCFActions.MultipleDCFGetDCFsError, (state, action) => ({
        ...state,
        error: true,
        loading: false,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromDCFActions.MultipleDCFGetDCFsSuccess, (state, action) => {
        return mapMultipleDCFState(state, action.securityWrappers);
    }),
    on(fromDCFActions.MultipleDCFGetTestingOrderError, currentStateWithError),
    on(fromDCFActions.MultipleDCFGetTestingOrderSuccess, currentStateWithLoading),
    on(fromDCFActions.MultipleDCFGetTests, (state) => ({
        ...state,
        testsLoading: true,
        testsError: false,
        conflictException: null,
        errorMessageKey: null,
    })),
    on(fromDCFActions.MultipleDCFGetTestsError, (state, action) => ({
        ...state,
        testsLoading: false,
        testsError: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromDCFActions.MultipleDCFGetTestsSuccess, (state, action) => {
        let id = null;
        if (action.tests && action.tests.length > 0) {
            id = action.tests[0].sampleCollectionAuthority?.id || null;
        }
        return {
            ...state,
            testsLoading: false,
            testsError: false,
            scaId: id,
            tests: action.tests,
            dcfs: mapDCFFromTest(action.tests),
        };
    }),
    on(fromDCFActions.MultipleDCFGetUrineSampleBoundariesError, (state) => ({
        ...state,
        error: true,
    })),
    on(fromDCFActions.MultipleDCFGetUrineSampleBoundariesSuccess, (state, action) => ({
        ...state,
        urineSampleBoundaries: action.urineSampleBoundaries,
    })),
    on(fromDCFActions.MultipleDCFInitCreate, (state) => ({
        ...state,
        error: false,
        loading: false,
        saveError: false,
    })),
    on(fromDCFActions.MultipleDCFInitEdit, (state) => ({
        ...state,
        error: false,
        loading: false,
        saveError: false,
        conflictException: null,
        mode: DCFMode.Edit,
    })),
    on(fromDCFActions.MultipleDCFOpenNext, (state, action) => {
        const dcf = mapDCFFromForm(action.dcfForm, action.dcf);
        const dcfIndexAtStore = state.dcfs.findIndex((nextDcf: DCF) => {
            if (nextDcf.test && dcf.test) {
                return nextDcf.test.id === dcf.test.id;
            }
            return false;
        });

        if (dcfIndexAtStore > -1) {
            return {
                ...state,
                dcfs: [...state.dcfs.slice(0, dcfIndexAtStore), dcf, ...state.dcfs.slice(dcfIndexAtStore + 1)],
            };
        }
        return { ...state };
    }),
    on(fromDCFActions.MultipleDCFOpenNextError, (state) => ({
        ...state,
        error: true,
        saving: false,
    })),
    on(fromDCFActions.MultipleDCFResetError, (state) => ({
        ...state,
        error: false,
        saveError: false,
    })),
    on(fromDCFActions.MultipleDCFSampleCodeValidation, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        dcfs: action.dcfs,
    })),
    on(fromDCFActions.MultipleDCFSampleCodeValidationError, (state, action) => ({
        ...state,
        conflictException: state.conflictException?.hasOptimisticLockException()
            ? state.conflictException
            : action.exception,
    })),
    on(fromDCFActions.MultipleDCFSampleCodeValidationSuccess, (state, action) => {
        const updatedException = mapSampleWarningToException(action.samples);
        const exception = updatedException || null;
        return {
            ...state,
            conflictException: state.conflictException?.hasOptimisticLockException()
                ? state.conflictException
                : exception,
        };
    }),
    on(fromDCFActions.MultipleDCFSaveAll, (state) => ({
        ...state,
        error: false,
        saveError: false,
        loading: true,
        errorMessageKey: null,
    })),
    on(fromDCFActions.MultipleDCFSaveAllError, (state, action) => ({
        ...state,
        saveError: true,
        error: true,
        loading: false,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromDCFActions.MultipleDCFSaveAllSuccess, (state, action) => {
        const dcfWithoutSecurity: Array<DCF> = new Array<DCF>();
        action.dcfs.forEach((dcfWithSecurity: SecurityWrapper<DCF>) => dcfWithoutSecurity.push(dcfWithSecurity.data));
        const set = new Set<number | null>();
        dcfWithoutSecurity.forEach((tempDcf: DCF) => set.add(tempDcf.id));
        return {
            ...state,
            loading: false,
            error: false,
            saveError: false,
            dcfs: dcfWithoutSecurity,
            savedDCF: set,
        };
    }),
    on(fromDCFActions.MultipleDCFSetDefaultValues, (state) => ({
        ...state,
        error: false,
    }))
);

export function reducer(state: IMultipleDCFState | undefined, action: Action): IMultipleDCFState {
    return multipleDCFReducer(state, action);
}

function currentStateWithError(state: IMultipleDCFState) {
    return { ...state, error: true, loading: false };
}

function currentStateWithLoading(state: IMultipleDCFState) {
    return { ...state, error: false, loading: true };
}
