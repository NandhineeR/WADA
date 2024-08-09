import {
    BloodPassport,
    CompetitionLevelAthlete,
    SportIdentity,
    SteroidPassport,
    TestPoolParticipant,
    WhereaboutsEntry,
} from '@athlete/models';
import { createAction, props } from '@ngrx/store';
import { Address, Athlete, Phone } from '@shared/models';

export const InitAthletePage = createAction(
    '[ATHLETE] INIT ATHLETE PAGE',

    props<{ athleteId: string }>()
);

export const GetAthlete = createAction(
    '[ATHLETE] GET ATHLETE',

    props<{ athleteId: string }>()
);

export const GetAthleteSuccess = createAction(
    '[ATHLETE] GET ATHLETE SUCCESS',

    props<{ athlete: Athlete }>()
);

export const GetAthleteError = createAction('[ATHLETE] GET ATHLETE ERROR');

export const GetAddresses = createAction(
    '[ATHLETE] GET ADDRESSES',

    props<{ athleteId: string }>()
);

export const GetAddressesSuccess = createAction(
    '[ATHLETE] GET ADDRESSES SUCCESS',

    props<{ addresses: Array<Address> }>()
);

export const GetAddressesError = createAction('[ATHLETE] GET ADDRESSES ERROR');

export const GetPhones = createAction(
    '[ATHLETE] GET PHONES',

    props<{ athleteId: string }>()
);

export const GetPhonesSuccess = createAction(
    '[ATHLETE] GET PHONES SUCCESS',

    props<{ phones: Array<Phone> }>()
);

export const GetPhonesError = createAction('[ATHLETE] GET PHONES ERROR');

export const GetSportIdentities = createAction(
    '[ATHLETE] GET SPORT IDENTITIES',

    props<{ athleteId: string }>()
);

export const GetSportIdentitiesSuccess = createAction(
    '[ATHLETE] GET SPORT IDENTITIES SUCCESS',

    props<{ sportIdentities: Array<SportIdentity> }>()
);

export const GetSportIdentitiesError = createAction('[ATHLETE] GET SPORT IDENTITIES ERROR');

export const GetCompetitionLevels = createAction(
    '[ATHLETE] GET COMPETITION LEVELS',

    props<{ athleteId: string }>()
);

export const GetCompetitionLevelsSuccess = createAction(
    '[ATHLETE] GET COMPETITION LEVELS SUCCESS',

    props<{ competitionLevels: Array<CompetitionLevelAthlete> }>()
);

export const GetCompetitionLevelsError = createAction('[ATHLETE] GET COMPETITION LEVELS ERROR');

export const GetTestPools = createAction(
    '[ATHLETE] GET TEST POOLS',

    props<{ athleteId: string }>()
);

export const GetTestPoolsSuccess = createAction(
    '[ATHLETE] GET TEST POOLS SUCCESS',

    props<{ testPools: Array<TestPoolParticipant> }>()
);

export const GetTestPoolsError = createAction('[ATHLETE] GET TEST POOLS ERROR');

export const GetWhereabouts = createAction(
    '[ATHLETE] GET WHEREABOUTS',

    props<{ athleteId: string }>()
);

export const GetWhereaboutsSuccess = createAction(
    '[ATHLETE] GET WHEREABOUTS SUCCESS',

    props<{ whereabouts: Array<WhereaboutsEntry> }>()
);

export const GetWhereaboutsError = createAction('[ATHLETE] GET WHEREABOUTS ERROR');

export const GetBloodPassports = createAction(
    '[ATHLETE] GET BLOOD PASSPORTS',

    props<{ athleteId: string }>()
);

export const GetBloodPassportsSuccess = createAction(
    '[ATHLETE] GET BLOOD PASSPORTS SUCCESS',

    props<{ bloodPassports: Array<BloodPassport> }>()
);

export const GetBloodPassportsError = createAction('[ATHLETE] GET BLOOD PASSPORTS ERROR');

export const GetSteroidPassports = createAction(
    '[ATHLETE] GET STEROID PASSPORTS',

    props<{ athleteId: string }>()
);

export const GetSteroidPassportsSuccess = createAction(
    '[ATHLETE] GET STEROID PASSPORTS SUCCESS',

    props<{ steroidPassports: Array<SteroidPassport> }>()
);

export const GetSteroidPassportsError = createAction('[ATHLETE] GET STEROID PASSPORTS ERROR');
