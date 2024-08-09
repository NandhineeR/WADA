import { IFeatureState } from '@core/store/feature-state';
import { Country } from '@shared/models';

export interface ISportNationalitiesState extends IFeatureState {
    loading: boolean;
    error: boolean;
    sportNationalities: Array<Country>;
}

export const initialSportNationalitiesState: ISportNationalitiesState = {
    loading: false,
    error: false,
    sportNationalities: [],
};
