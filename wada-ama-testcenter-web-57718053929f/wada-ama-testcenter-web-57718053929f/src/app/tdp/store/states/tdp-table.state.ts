import { IFeatureState } from '@core/store';
import {
    DirtyCellInfo,
    IFrequencyFilter,
    ISportDisciplineId,
    Month,
    PeriodType,
    Quarter,
    TDPSheet,
} from 'app/tdp/models';

export interface ITDPTableState extends IFeatureState {
    deleteException: boolean;
    filterLoading: boolean;
    loading: boolean;
    getError: boolean;
    saveError: boolean;
    tdpSheet: TDPSheet;
    dirtyCells: Array<DirtyCellInfo>;
    highlightedSportDiscipline: ISportDisciplineId;
    frequencyFilter: IFrequencyFilter;
    saving: boolean;
    requestedYear: number;
}

export const noSportDisciplineHighlighted: ISportDisciplineId = {
    sportId: -1,
    disciplineId: -1,
};

const frequencyDefaultState: IFrequencyFilter = {
    frequency: PeriodType.Yearly,
    quarter: Quarter.Q1,
    month: Month.Jan,
};

export const initialTDPTableState: ITDPTableState = {
    deleteException: false,
    filterLoading: false,
    loading: false,
    getError: false,
    saveError: false,
    tdpSheet: new TDPSheet(),
    dirtyCells: [],
    highlightedSportDiscipline: noSportDisciplineHighlighted,
    frequencyFilter: frequencyDefaultState,
    saving: false,
    requestedYear: 0,
};

export function currentStateWithSaving(state: ITDPTableState) {
    return { ...state, saving: true, loading: false };
}
