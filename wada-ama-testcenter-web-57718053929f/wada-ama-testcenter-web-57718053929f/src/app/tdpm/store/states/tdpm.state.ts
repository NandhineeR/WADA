import { TDPMSheetInfo } from '@tdpm/models';

export interface ITDPMTableState {
    loading: boolean;
    getError: boolean;
    tdpmSheetInfo: TDPMSheetInfo;
    search: string;
}

export const initialTdpmState: ITDPMTableState = {
    loading: false,
    getError: false,
    tdpmSheetInfo: new TDPMSheetInfo(),
    search: '',
};
