import { createAction, props } from '@ngrx/store';
import { ISportDisciplineDescription } from '@core/models';
import { DirtyCellInfo, ISportDisciplineId, Month, PeriodType, Quarter, TDPSheet, Year } from '@tdp/models';

export const SetTDPRequestedYear = createAction('[TDP] SET_TDP_REQUESTED_YEAR', props<{ year: number }>());

export const GetTDPTable = createAction('[TDP] GET_TDP_TABLE', props<{ year: number }>());

export const GetTDPTableSuccess = createAction('[TDP] GET_TDP_TABLE_SUCCESS', props<{ sheet: TDPSheet }>());

export const GetTDPTablesError = createAction('[TDP] GET_TDP_TABLE_ERROR');

export const AddSportDiscipline = createAction(
    '[TDP] ADD_SPORT_DISCIPLINE',
    props<{ sportDiscipline: ISportDisciplineDescription }>()
);

export const AddSportDisciplineSuccess = createAction(
    '[TDP] ADD_SPORT_DISCIPLINE_SUCCESS',
    props<{ sportDiscipline: ISportDisciplineId }>()
);

export const AddSportDisciplineError = createAction('[TDP] ADD_SPORT_DISCIPLINE_ERROR');

export const DeleteSportDiscipline = createAction(
    '[TDP] DELETE_SPORT_DISCIPLINE',
    props<{ sportDiscipline: ISportDisciplineId }>()
);

export const DeleteSportDisciplineSuccess = createAction(
    '[TDP] DELETE_SPORT_DISCIPLINE_SUCCESS',
    props<{ sportDiscipline: ISportDisciplineId }>()
);

export const DeleteSportDisciplineError = createAction('[TDP] DELETE_SPORT_DISCIPLINE_ERROR');

export const AttemptSaveTDPTable = createAction('[TDP] ATTEMPT_SAVE_TDP_TABLE');

export const InitialTDPSaving = createAction('[TDP] INITIAL_TDP_SAVING');

export const SaveTDPTable = createAction('[TDP] SAVE_TDP_TABLE');

export const SaveTDPTablePolling = createAction('[TDP] SAVE_TDP_TABLE_POLLING', props<{ sheet: TDPSheet }>());

export const SaveTDPTablePollingSuccess = createAction(
    '[TDP] SAVE_TDP_TABLE_POLLING_SUCCESS',
    props<{ sheet: TDPSheet }>()
);

export const SaveTDPTablePollingError = createAction('[TDP] SAVE_TDP_TABLE_POLLING_ERROR');

export const SaveTDPTableSuccess = createAction('[TDP] SAVE_TDP_TABLE_SUCCESS', props<{ sheet: TDPSheet }>());

export const SaveTDPTableError = createAction('[TDP] SAVE_TDP_TABLE_ERROR', props<{ error: number }>());

export const UpdateTDPTable = createAction('[TDP] UPDATE_TDP_TABLE', props<{ dirtyCell: DirtyCellInfo }>());

export const SetTDPTableQuarter = createAction('[TDP] SET_TDP_TABLE_QUARTER', props<{ quarter: Quarter }>());

export const SetTDPTableMonth = createAction('[TDP] SET_TDP_TABLE_MONTH', props<{ month: Month }>());

export const SetTDPTableYear = createAction('[TDP] SET_TDP_TABLE_YEAR', props<{ year: Year }>());

export const SetTDPTableFrequency = createAction('[TDP] SET_TDP_TABLE_FREQUENCY', props<{ frequency: PeriodType }>());
