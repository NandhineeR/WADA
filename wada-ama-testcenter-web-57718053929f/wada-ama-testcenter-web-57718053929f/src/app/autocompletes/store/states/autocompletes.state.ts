import { IFeatureState } from '@core/store';
import {
    CountryWithRegions,
    Laboratory,
    ListItem,
    LocalizedEntity,
    Participant,
    ParticipantType,
    SampleType,
    SportDiscipline,
    Status,
} from '@shared/models';
import { OrganizationRelationship } from '@to/models';
import {
    ListMajorEventAutoCompletes,
    ListParticipantAutoCompletes,
    ListUrineSampleBoundaries,
    LoadingSteps,
} from '@autocompletes/models';
import { Timezone } from '@dcf/models';

export interface IAutoCompletesState extends IFeatureState {
    ados: Array<ListItem>;
    athleteRepresentativesObject: ListParticipantAutoCompletes | null;
    bloodOfficialsObject: ListParticipantAutoCompletes | null;
    coachMap: Map<string, Array<Participant>> | null;
    coachesObject: ListParticipantAutoCompletes | null;
    competitionCategories: Array<ListItem>;
    countriesWithRegions: Array<CountryWithRegions>;
    dcosObject: ListParticipantAutoCompletes | null;
    doctorMap: Map<string, Array<Participant>> | null;
    doctorsObject: ListParticipantAutoCompletes | null;
    dtps: Array<ListItem>;
    identificationDocuments: Array<ListItem>;
    laboratories: Array<Laboratory>;
    majorEvents: ListMajorEventAutoCompletes | null;
    manufacturers: Array<LocalizedEntity>;
    moParticipantsObject: ListParticipantAutoCompletes | null;
    nonConformityCategories: Array<ListItem>;
    notifyingChaperonesObject: ListParticipantAutoCompletes | null;
    organizationRelationships: Array<OrganizationRelationship>;
    participantStatuses: Array<Status>;
    participantTypes: Array<ParticipantType>;
    sampleTypes: Array<SampleType>;
    selectionCriteria: Array<ListItem>;
    sportDisciplines: Array<SportDiscipline>;
    timezones: Array<Timezone>;
    urineBoundariesObject: ListUrineSampleBoundaries | null;
    witnessChaperonesObject: ListParticipantAutoCompletes | null;

    error: boolean;
    loading: boolean;
    loadingSteps: LoadingSteps;
}

export const initialAutocompletesState: IAutoCompletesState = {
    ados: [],
    athleteRepresentativesObject: null,
    bloodOfficialsObject: null,
    coachMap: null,
    coachesObject: null,
    competitionCategories: [],
    countriesWithRegions: [],
    dcosObject: null,
    doctorMap: null,
    doctorsObject: null,
    dtps: [],
    identificationDocuments: [],
    laboratories: [],
    majorEvents: null,
    manufacturers: [],
    moParticipantsObject: null,
    nonConformityCategories: [],
    notifyingChaperonesObject: null,
    organizationRelationships: [],
    participantStatuses: [],
    participantTypes: [],
    sampleTypes: [],
    selectionCriteria: [],
    sportDisciplines: [],
    timezones: [],
    urineBoundariesObject: null,
    witnessChaperonesObject: null,

    error: false,
    loading: false,
    loadingSteps: new LoadingSteps(),
};
