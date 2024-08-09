import { Country, Daterange } from '@shared/models';

export interface ITDSSAFormState {
    daterange: Daterange;
    athleteInternational: boolean;
    athleteNational: boolean;
    athleteOther: boolean;
    testTypeInCompetition: boolean;
    testTypeOutCompetition: boolean;
    sportNationality: Array<Country>;
}

export const initialState: ITDSSAFormState = {
    daterange: {
        from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        to: new Date().toISOString(),
        quickFilter: {
            value: 'yearToDate',
            displayName: 'Year to Date',
        },
    },
    athleteInternational: true,
    athleteNational: true,
    athleteOther: false,
    testTypeInCompetition: true,
    testTypeOutCompetition: true,
    sportNationality: new Array<Country>(),
};
