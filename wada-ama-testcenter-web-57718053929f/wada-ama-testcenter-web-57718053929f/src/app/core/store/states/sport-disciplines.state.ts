import { SportDisciplineDescription } from '@core/models';
import { IFeatureState } from '@core/store/feature-state';

export interface ISportDisciplinesState extends IFeatureState {
    loading: boolean;
    error: boolean;
    sportDisciplines: Array<SportDisciplineDescription>;
}

export const initialSportDisciplineState: ISportDisciplinesState = {
    loading: false,
    error: false,
    sportDisciplines: [],
};
