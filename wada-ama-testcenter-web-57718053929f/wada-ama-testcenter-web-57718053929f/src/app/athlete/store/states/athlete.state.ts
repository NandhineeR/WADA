import { WhereaboutsFailure } from '@athlete/models/whereabouts-failure.model';
import { Test } from '@to/models';
import { Address, Athlete, MajorEvent, Phone } from '@shared/models';
import {
    AthleteSupportPersonnel,
    BloodPassport,
    CompetitionLevelAthlete,
    SportIdentity,
    SteroidPassport,
    TestPoolParticipant,
    WhereaboutsEntry,
} from '@athlete/models';
import { IFeatureState } from '@core/store';

export interface IAthleteState extends IFeatureState {
    addresses: Array<Address>;
    adrvs: any;
    athlete: Athlete | null;
    athleteAgents: Array<AthleteSupportPersonnel>;
    bloodPassports: Array<BloodPassport>;
    competitionLevels: Array<CompetitionLevelAthlete>;
    majorEvents: Array<MajorEvent>;
    phones: Array<Phone>;
    sanctions: any;
    sportIdentities: Array<SportIdentity>;
    steroidPassports: Array<SteroidPassport>;
    testingMetadata: any;
    testPools: Array<TestPoolParticipant>;
    tests: Array<Test>;
    tues: any;
    whereabouts: Array<WhereaboutsEntry>;
    whereaboutsFailures: Array<WhereaboutsFailure>;
}

export const initialAthleteState: IAthleteState = {
    addresses: [],
    adrvs: [],
    athlete: null,
    athleteAgents: [],
    bloodPassports: [],
    competitionLevels: [],
    error: false,
    loading: false,
    majorEvents: [],
    phones: [],
    sanctions: [],
    sportIdentities: [],
    steroidPassports: [],
    testingMetadata: [],
    testPools: [],
    tests: [],
    tues: [],
    whereabouts: [],
    whereaboutsFailures: [],
};
