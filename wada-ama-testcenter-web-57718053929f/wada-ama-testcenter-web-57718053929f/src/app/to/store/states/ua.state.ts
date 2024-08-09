import { IFeatureState } from '@core/store';
import { FieldsSecurity } from '@shared/models';
import { UA, UAAutoCompletes, UATest } from '@to/models/unsuccessful-attempt';

export interface IViewUAState extends IFeatureState {
    toId: string;
    scaId: number | null;
    tests: Array<UATest>;
    uas: Array<UA>;
    autocompletes: UAAutoCompletes | null;
    autocompleteError: boolean;
    testsLoading: boolean;
    autoCompleteLoading: boolean;
    saving: boolean;
    testsError: boolean;
    savedUA: Set<string>;
    hasBeenDeleted: boolean;
    errorMessageKey: string | null;
    fieldsSecurity: Map<string, FieldsSecurity>;
}

export const initialUAState: IViewUAState = {
    toId: '',
    scaId: null,
    tests: [],
    testsLoading: false,
    testsError: false,
    autoCompleteLoading: false,
    uas: [],
    autocompletes: null,
    autocompleteError: false,
    saving: false,
    savedUA: new Set<string>(),
    hasBeenDeleted: false,
    errorMessageKey: null,
    fieldsSecurity: new Map<string, FieldsSecurity>(),
};
