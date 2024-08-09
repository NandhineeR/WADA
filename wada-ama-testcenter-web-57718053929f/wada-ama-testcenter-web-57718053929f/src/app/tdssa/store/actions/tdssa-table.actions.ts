import { createAction, props } from '@ngrx/store';
import { MLA, TDSSASheet } from '@tdssa/models';

export interface IMLAObject {
    index: number;
    value: MLA;
}

export const GetTDSSATable = createAction(
    '[TDSSA] GET TDSSA TABLE',

    props<{ startDate: Date; endDate: Date }>()
);

export const GetTDSSATableSuccess = createAction(
    '[TDSSA] GET TDSSA TABLE SUCCESS',

    props<{ sheet: TDSSASheet }>()
);

export const GetTDSSATableError = createAction('[TDSSA] GET TDSSA TABLE ERROR');

export const FilterTDSSATable = createAction('[TDSSA] FILTER TDSSA TABLE');

export const SearchBarFilterTDSSATable = createAction(
    '[TDSSA] SEARCH BAR FILTER',

    props<{ query: string }>()
);

export const SearchBarFilterTDSSATableSuccess = createAction('[TDSSA] SEARCH BAR FILTER SUCCESS');

export const MlaMonitoringFilterTDSSATable = createAction(
    '[TDSSA] MLA MONITORING FILTER',

    props<{ mla: IMLAObject }>()
);

export const MlaMonitoringFilterTDSSATableSuccess = createAction('[TDSSA] MLA MONITORING FILTER SUCCESS');
