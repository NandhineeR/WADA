import { createAction, props } from '@ngrx/store';
import { TDPMSheetInfo } from '@tdpm/models';
import { FromToDate } from '@shared/models';

export const getTDPMTable = createAction('[TDPM] GET_TDPM_TABLE', props<{ fromToDate: FromToDate }>());

export const getTDPMTableSuccess = createAction('[TDPM] GET_TDPM_TABLE_SUCCESS', props<{ tdpmSheet: TDPMSheetInfo }>());

export const getTDPMTablesError = createAction('[TDPM] GET_TDPM_TABLE_ERROR');

export const searchBarFilterTDPMTable = createAction('[TDPM] SEARCH_BAR_FILTER', props<{ query: string }>());

export const searchBarFilterTDPMTableSuccess = createAction('[TDPM] SEARCH_BAR_FILTER_SUCCESS');
