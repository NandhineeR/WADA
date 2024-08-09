import { createAction, props } from '@ngrx/store';
import { FromToDate } from '@shared/models';
import { TestTypeToShow } from '@tdpm/models';

export const toggleTDPMFilters = createAction('[TDPM-Filters] TOGGLE_TDPM_FILTERS');

export const setTDPMTablesDate = createAction('[TDPM-Filters] SET_TDPM_DATE', props<{ fromToDate: FromToDate }>());

export const getTDPMTablesShowType = createAction(
    '[TDPM-Filters] GET_TDPM_SHOW_TYPE',
    props<{ showType: TestTypeToShow }>()
);

export const setTDPMTablesShowType = createAction(
    '[TDPM-Filters] SET_TDPM_SHOW_TYPE',
    props<{ showType: TestTypeToShow }>()
);
