import { createAction, props } from '@ngrx/store';

export const ResetTDSSAForm = createAction('[TDSSA] RESET TDSSA FORM');

export const SetTDSSAFormAthleteInternational = createAction(
    '[TDSSA] SET TDSSA FORM INTERNATIONAL',

    props<{ value: any }>()
);

export const SetTDSSAFormAthleteNational = createAction(
    '[TDSSA] SET TDSSA FORM NATIONAL',

    props<{ value: any }>()
);

export const SetTDSSAFormAthleteOther = createAction(
    '[TDSSA] SET TDSSA FORM OTHER',

    props<{ value: any }>()
);

export const SetTDSSAFormDateRange = createAction(
    '[TDSSA] SET TDSSA FORM DATERANGE',

    props<{ value: any }>()
);

export const SetTDSSAFormSportNationality = createAction(
    '[TDSSA] SET TDSSA FORM SPORT NATIONALITY',

    props<{ value: any }>()
);

export const SetTDSSAFormTestTypeInCompetition = createAction(
    '[TDSSA] SET TDSSA FORM TEST TYPE IN COMPETITION',

    props<{ value: any }>()
);

export const SetTDSSAFormTestTypeOutCompetition = createAction(
    '[TDSSA] SET TDSSA FORM TEST TYPE OUT COMPETITION',

    props<{ value: any }>()
);
