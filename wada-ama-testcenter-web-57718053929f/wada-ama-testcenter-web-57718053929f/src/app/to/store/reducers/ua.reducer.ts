import { cloneDeep, remove } from 'lodash-es';
import { Action, createReducer, on } from '@ngrx/store';
import * as fromUA from '@to/store/actions';
import { mapUAFromInputForm, mapUnsuccessfulAttempt } from '@to/mappers/ua.mapper';
import { initialUAState, IViewUAState } from '@to/store/states/ua.state';
import { UA } from '@to/models/unsuccessful-attempt/ua.model';
import { mapUAs } from './ua-reducer.utils';

export const uaReducer = createReducer(
    initialUAState,
    on(fromUA.DeleteUA, (state) => ({
        ...state,
        hasBeenDeleted: false,
    })),
    on(fromUA.DeleteUAError, (state) => ({
        ...state,
        hasBeenDeleted: false,
        error: true,
        toId: '',
    })),
    on(fromUA.DeleteUASuccess, (state, action) => {
        const uaToDelete = state.uas.find((uaItem: UA) => uaItem.id === action.unsuccessfulAttemptId);
        let toId = '';
        if (uaToDelete && uaToDelete.test) {
            toId = uaToDelete.test.toId;
        }
        return {
            ...state,
            hasBeenDeleted: true,
            uas: removeUAFromList(state.uas, action.unsuccessfulAttemptId),
            toId,
        };
    }),
    on(fromUA.GetAutoCompletes, (state) => ({
        ...state,
        autocompleteError: false,
        autoCompleteLoading: true,
    })),
    on(fromUA.GetAutoCompletesError, (state) => ({
        ...state,
        autocompleteError: true,
        autoCompleteLoading: false,
    })),
    on(fromUA.GetAutoCompletesSuccess, (state, action) => ({
        ...state,
        autocompletes: action.autocomplete,
        autoCompleteLoading: false,
    })),
    on(fromUA.GetTestsError, (state, action) => ({
        ...state,
        loading: false,
        testsError: true,
        error: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromUA.GetTestsSuccess, (state, action) => {
        let id = null;
        if (action.tests?.length > 0) {
            id = action.tests[0].sampleCollectionAuthority?.id || null;
        }

        return {
            ...state,
            tests: action.tests,
            uas: mapUnsuccessfulAttempt(action.tests),
            scaId: id,
            testsLoading: false,
            testsError: false,
            error: false,
            errorMessageKey: null,
        };
    }),
    on(fromUA.GetUAs, (state) => ({
        ...state,
        loading: true,
        errorMessageKey: null,
    })),
    on(fromUA.GetUAsError, (state, action) => ({
        ...state,
        loading: false,
        error: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromUA.GetUAsSuccess, (state, action) => {
        return mapUAs(state, action.uas);
    }),
    on(fromUA.ResetUA, (state) => ({
        ...state,
        scaId: null,
        tests: [],
        testsLoading: false,
        testsError: false,
        uas: [],
        error: false,
        errorMessageKey: null,
        hasBeenDeleted: false,
    })),
    on(fromUA.ResetUAError, (state) => ({
        ...state,
        error: false,
        errorMessageKey: null,
    })),
    on(fromUA.SaveAllUAsSuccess, (state, action) => {
        const set = new Set<string>();
        action.uas.forEach((tempUa: UA) => set.add(tempUa.id));
        return { ...state, uas: action.uas, savedUA: set, errorMessageKey: null };
    }),
    on(fromUA.SaveAllUAsError, (state, action) => ({
        ...state,
        error: true,
        errorMessageKey: action.error.messageKey || null,
    })),
    on(fromUA.SaveUA, (state, action) => {
        const ua = mapUAFromInputForm(action.uaForm, state.autocompletes?.attemptMethods || [], action.ua);
        const uaIndexAtStore = state.uas.findIndex((attempt: UA) => {
            if (attempt.test && ua.test) {
                return attempt.test.id === ua.test.id;
            }
            return false;
        });
        if (uaIndexAtStore > -1) {
            return {
                ...state,
                uas: [...state.uas.slice(0, uaIndexAtStore), ua, ...state.uas.slice(uaIndexAtStore + 1)],
            };
        }
        return { ...state };
    }),
    on(fromUA.SaveUAError, (state) => ({
        ...state,
        error: true,
        saving: false,
    }))
);

export function reducer(state: IViewUAState | undefined, action: Action): IViewUAState {
    return uaReducer(state, action);
}

function removeUAFromList(uas: Array<UA>, unsuccessfulAttemptId: string): Array<UA> {
    const uasUpdated: Array<UA> = cloneDeep(uas);
    remove(uasUpdated, { id: unsuccessfulAttemptId });
    return uasUpdated;
}
