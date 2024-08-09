import { MLA, TDSSASheet } from '@tdssa/models';

export class TableFilters {
    search: string;

    mlaMonitoringArray: Array<MLA>;

    constructor() {
        this.search = '';
        this.mlaMonitoringArray = new Array<MLA>();
    }
}

export interface ITDSSATableState {
    loading: boolean;
    error: boolean;
    tdssaSheet: TDSSASheet;
    tableFilters: TableFilters;
}

export const initialTdssaState: ITDSSATableState = {
    loading: false,
    error: false,
    tdssaSheet: new TDSSASheet(),
    tableFilters: new TableFilters(),
};
