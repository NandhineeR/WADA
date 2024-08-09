import { createAction, props } from '@ngrx/store';
import { SportDisciplineDescription } from '@core/models';

export const GetSportDisciplines = createAction('[SPORT DISCIPLINES] GET SPORT DISCIPLINES');

export const GetSportDisciplinesSuccess = createAction(
    '[SPORT DISCIPLINES] GET SPORT DISCIPLINES SUCCESS',

    props<{ sportDisciplines: Array<SportDisciplineDescription> }>()
);

export const GetSportDisciplinesError = createAction('[SPORT DISCIPLINES] GET SPORT DISCIPLINES ERROR');
