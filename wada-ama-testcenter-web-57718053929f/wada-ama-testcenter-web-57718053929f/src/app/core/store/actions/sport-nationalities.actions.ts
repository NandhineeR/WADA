import { createAction, props } from '@ngrx/store';
import { Country } from '@shared/models';

export const GetSportNationalities = createAction('[SPORT NATIONALITIES] GET SPORT NATIONALITIES');

export const GetSportNationalitiesSuccess = createAction(
    '[SPORT NATIONALITIES] GET SPORT NATIONALITIES SUCCESS',

    props<{ sportNationalities: Array<Country> }>()
);

export const GetSportNationalitiesError = createAction('[SPORT NATIONALITIES] GET SPORT NATIONALITIES ERROR');
