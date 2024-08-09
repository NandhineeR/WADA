import {
    ListMajorEventAutoCompletes,
    ListParticipantAutoCompletes,
    ListUrineSampleBoundaries,
} from '@autocompletes/models';
import { Timezone } from '@dcf/models';
import { createAction, props } from '@ngrx/store';
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

/**
 * Get DCF
 */
export const GetDCFAdos = createAction('[AUTOCOMPLETES DCF] GET ADOS');

export const GetDCFAthleteRepresentatives = createAction('[AUTOCOMPLETES DCF] GET ATHLETE REPRESANTATIVES');

export const GetDCFBloodOfficials = createAction('[AUTOCOMPLETES DCF] GET BLOOD OFFICIALS');

export const GetDCFCoaches = createAction('[AUTOCOMPLETES DCF] GET COACHES');

export const GetDCFCountriesWithRegions = createAction('[AUTOCOMPLETES DCF] GET COUNTRIES WITH REGIONS');

export const GetDCFDcos = createAction('[AUTOCOMPLETES DCF] GET DCOS');

export const GetDCFDoctors = createAction('[AUTOCOMPLETES DCF] GET DOCTORS');

export const GetDCFDtps = createAction('[AUTOCOMPLETES DCF] GET DTPS');

export const GetDCFIdentificationDocuments = createAction('[AUTOCOMPLETES DCF] GET IDENTIFICATION DOCUMENTS');

export const GetDCFLaboratories = createAction('[AUTOCOMPLETES DCF] GET LABORATORIES');

export const GetDCFMajorEvents = createAction('[AUTOCOMPLETES DCF] GET MAJOR EVENTS');

export const GetDCFManufacturers = createAction('[AUTOCOMPLETES DCF] GET MANUFACTURERS');

export const GetDCFNonConformityCategories = createAction('[AUTOCOMPLETES DCF] GET NON CONFORMITY CATEGORIES');

export const GetDCFNotifyingChaperones = createAction('[AUTOCOMPLETES DCF] GET NOTIFYING CHAPERONES');

export const GetDCFSampleTypes = createAction('[AUTOCOMPLETES DCF] GET SAMPLE TYPES');

export const GetDCFSelectionCriteria = createAction('[AUTOCOMPLETES DCF] GET SELECTION CRITERIA');

export const GetDCFSportDisciplines = createAction('[AUTOCOMPLETES DCF] GET SPORT DISCIPLINES');

export const GetDCFTimezones = createAction('[AUTOCOMPLETES DCF] GET TIMEZONES');

export const GetDCFUrineBoundaries = createAction('[AUTOCOMPLETES] GET URINE BOUNDARIES');

export const GetDCFWitnessChaperones = createAction('[AUTOCOMPLETES DCF] GET WITNESS CHAPERONES');

/**
 * Get Multiple DCF
 */
export const GetMultipleDCFBloodOfficials = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET BLOOD OFFICIALS');

export const GetMultipleDCFCoachMap = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET COACH MAP');

export const GetMultipleDCFCountriesWithRegions = createAction(
    '[AUTOCOMPLETES MULTIPLE DCF] GET COUNTRIES WITH REGIONS'
);

export const GetMultipleDCFDcos = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET DCOS');

export const GetMultipleDCFDoctorMap = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET DOCTOR MAP');

export const GetMultipleDCFLaboratories = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET LABORATORIES');

export const GetMultipleDCFManufacturers = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET MANUFACTURERS');

export const GetMultipleDCFNotifyingChaperones = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET NOTIFYING CHAPERONES');

export const GetMultipleDCFSampleTypes = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET SAMPLE TYPES');

export const GetMultipleDCFSportDisciplines = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET SPORT DISCIPLINES');

export const GetMultipleDCFTimezones = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET TIMEZONES');

export const GetMultipleDCFUrineBoundaries = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET URINE BOUNDARIES');

export const GetMultipleDCFWitnessChaperones = createAction('[AUTOCOMPLETES MULTIPLE DCF] GET WITNESS CHAPERONES');

/**
 * Get Testing Order
 */
export const GetTestingOrderAdos = createAction('[AUTOCOMPLETES TESTING ORDER] GET ADOS');

export const GetTestingOrderBloodOfficials = createAction('[AUTOCOMPLETES TESTING ORDER] GET BLOOD OFFICIALS');

export const GetTestingOrderCompetitionCategories = createAction(
    '[AUTOCOMPLETES TESTING ORDER] GET COMPETITION CATEGORIES'
);

export const GetTestingOrderCountriesWithRegions = createAction(
    '[AUTOCOMPLETES TESTING ORDER] GET COUNTRIES WITH REGIONS'
);

export const GetTestingOrderDcos = createAction('[AUTOCOMPLETES TESTING ORDER] GET DCOS');

export const GetTestingOrderDtps = createAction('[AUTOCOMPLETES TESTING ORDER] GET DTPS');

export const GetTestingOrderLaboratories = createAction('[AUTOCOMPLETES TESTING ORDER] GET LABORATORIES');

export const GetTestingOrderMajorEvents = createAction('[AUTOCOMPLETES TESTING ORDER] GET MAJOR EVENTS');

/**
 * "MO" stands for Mission Order, which is the equivalent of a Testing Order.
 */
export const GetTestingOrderMOParticipants = createAction('[AUTOCOMPLETES TESTING ORDER] GET MO PARTICIPANTS');

export const GetTestingOrderNotifyingChaperones = createAction(
    '[AUTOCOMPLETES TESTING ORDER] GET NOTIFYING CHAPERONES'
);

export const GetTestingOrderOrganizationRelationships = createAction(
    '[AUTOCOMPLETES TESTING ORDER] GET ORGANIZATION RELATIONSHIPS'
);

export const GetTestingOrderParticipantStatuses = createAction(
    '[AUTOCOMPLETES TESTING ORDER] GET PARTICIPANT STATUSES'
);

export const GetTestingOrderParticipantTypes = createAction('[AUTOCOMPLETES TESTING ORDER] GET PARTICIPANT TYPES');

export const GetTestingOrderSampleTypes = createAction('[AUTOCOMPLETES TESTING ORDER] GET SAMPLE TYPES');

export const GetTestingOrderSportDisciplines = createAction('[AUTOCOMPLETES TESTING ORDER] GET SPORT DISCIPLINES');

export const GetTestingOrderWitnessChaperones = createAction('[AUTOCOMPLETES TESTING ORDER] GET WITNESS CHAPERONES');

/**
 * SHARED
 */
export const GetAdosError = createAction('[AUTOCOMPLETES] GET ADOS ERROR');

export const GetAdosSuccess = createAction(
    '[AUTOCOMPLETES] GET ADOS SUCCESS',

    props<{
        object: Array<ListItem>;
    }>()
);

export const GetAthleteRepresentativesError = createAction('[AUTOCOMPLETES] GET ATHLETE REPRESANTATIVES ERROR');

export const GetAthleteRepresentativesSuccess = createAction(
    '[AUTOCOMPLETES] GET ATHLETE REPRESANTATIVES SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetBloodOfficialsError = createAction('[AUTOCOMPLETES] GET BLOOD OFFICIALS ERROR');

export const GetBloodOfficialsSuccess = createAction(
    '[AUTOCOMPLETES] GET BLOOD OFFICIALS SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetCoachMapError = createAction('[AUTOCOMPLETES] GET COACH MAP ERROR');

export const GetCoachMapSuccess = createAction(
    '[AUTOCOMPLETES] GET COACH MAP SUCCESS',

    props<{
        object: Map<string, Array<Participant>>;
    }>()
);

export const GetCoachesError = createAction('[AUTOCOMPLETES] GET COACHES ERROR');

export const GetCoachesSuccess = createAction(
    '[AUTOCOMPLETES] GET COACHES SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetCompetitionCategoriesError = createAction('[AUTOCOMPLETES] GET COMPETITION CATEGORIES ERROR');

export const GetCompetitionCategoriesSuccess = createAction(
    '[AUTOCOMPLETES] GET COMPETITION CATEGORIES SUCCESS',

    props<{ object: Array<ListItem> }>()
);

export const GetCountriesWithRegionsError = createAction('[AUTOCOMPLETES] GET COUNTRIES WITH REGIONS ERROR');

export const GetCountriesWithRegionsSuccess = createAction(
    '[AUTOCOMPLETES] GET COUNTRIES WITH REGIONS SUCCESS',

    props<{
        object: Array<CountryWithRegions>;
    }>()
);

export const GetDcosError = createAction('[AUTOCOMPLETES] GET DCOS ERROR');

export const GetDcosSuccess = createAction(
    '[AUTOCOMPLETES] GET DCOS SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetDoctorMapError = createAction('[AUTOCOMPLETES] GET DOCTOR MAP ERROR');

export const GetDoctorMapSuccess = createAction(
    '[AUTOCOMPLETES] GET DOCTOR MAP SUCCESS',

    props<{
        object: Map<string, Array<Participant>>;
    }>()
);

export const GetDoctorsError = createAction('[AUTOCOMPLETES] GET DOCTORS ERROR');

export const GetDoctorsSuccess = createAction(
    '[AUTOCOMPLETES] GET DOCTORS SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetDtpsError = createAction('[AUTOCOMPLETES] GET DTPS ERROR');

export const GetDtpsSuccess = createAction(
    '[AUTOCOMPLETES] GET DTPS SUCCESS',

    props<{ object: Array<ListItem> }>()
);

export const GetIdentificationDocumentsError = createAction('[AUTOCOMPLETES] GET IDENTIFICATION DOCUMENTS ERROR');

export const GetIdentificationDocumentsSuccess = createAction(
    '[AUTOCOMPLETES] GET IDENTIFICATION DOCUMENTS SUCCESS',

    props<{
        object: Array<ListItem>;
    }>()
);

export const GetLaboratoriesError = createAction('[AUTOCOMPLETES] GET LABORATORIES ERROR');

export const GetLaboratoriesSuccess = createAction(
    '[AUTOCOMPLETES] GET LABORATORIES SUCCESS',

    props<{
        object: Array<Laboratory>;
    }>()
);

export const GetMajorEventsError = createAction('[AUTOCOMPLETES] GET MAJOR EVENTS ERROR');

export const GetMajorEventsSuccess = createAction(
    '[AUTOCOMPLETES] GET MAJOR EVENTS SUCCESS',

    props<{
        object: ListMajorEventAutoCompletes;
    }>()
);

export const GetManufacturersError = createAction('[AUTOCOMPLETES] GET MANUFACTURERS ERROR');

export const GetManufacturersSuccess = createAction(
    '[AUTOCOMPLETES] GET MANUFACTURERS SUCCESS',

    props<{
        object: Array<LocalizedEntity>;
    }>()
);

export const GetMOParticipantsError = createAction('[AUTOCOMPLETES] GET MO PARTICIPANTS ERROR');

export const GetMOParticipantsSuccess = createAction(
    '[AUTOCOMPLETES] GET MO PARTICIPANTS SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetNonConformityCategoriesError = createAction('[AUTOCOMPLETES] GET NON CONFORMITY CATEGORIES ERROR');

export const GetNonConformityCategoriesSuccess = createAction(
    '[AUTOCOMPLETES] GET NON CONFORMITY CATEGORIES SUCCESS',

    props<{
        object: Array<ListItem>;
    }>()
);

export const GetNotifyingChaperonesError = createAction('[AUTOCOMPLETES] GET NOTIFYING CHAPERONES ERROR');

export const GetNotifyingChaperonesSuccess = createAction(
    '[AUTOCOMPLETES] GET NOTIFYING CHAPERONES SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);

export const GetOrganizationRelationshipsError = createAction('[AUTOCOMPLETES] GET ORGANIZATION RELATIONSHIPS ERROR');

export const GetOrganizationRelationshipsSuccess = createAction(
    '[AUTOCOMPLETES] GET ORGANIZATION RELATIONSHIPS SUCCESS',

    props<{
        object: Array<OrganizationRelationship>;
    }>()
);

export const GetParticipantStatusesError = createAction('[AUTOCOMPLETES] GET PARTICIPANT STATUSES ERROR');

export const GetParticipantStatusesSuccess = createAction(
    '[AUTOCOMPLETES] GET PARTICIPANT STATUSES SUCCESS',

    props<{
        object: Array<Status>;
    }>()
);

export const GetParticipantTypesError = createAction('[AUTOCOMPLETES] GET PARTICIPANT TYPES ERROR');

export const GetParticipantTypesSuccess = createAction(
    '[AUTOCOMPLETES] GET PARTICIPANT TYPES SUCCESS',

    props<{
        object: Array<ParticipantType>;
    }>()
);

export const GetSampleTypesError = createAction('[AUTOCOMPLETES] GET SAMPLE TYPES ERROR');

export const GetSampleTypesSuccess = createAction(
    '[AUTOCOMPLETES] GET SAMPLE TYPES SUCCESS',

    props<{
        object: Array<SampleType>;
    }>()
);

export const GetSelectionCriteriaError = createAction('[AUTOCOMPLETES] GET SELECTION CRITERIA ERROR');

export const GetSelectionCriteriaSuccess = createAction(
    '[AUTOCOMPLETES] GET SELECTION CRITERIA SUCCESS',

    props<{
        object: Array<ListItem>;
    }>()
);

export const GetSportDisciplinesError = createAction('[AUTOCOMPLETES] GET SPORT DISCIPLINES ERROR');

export const GetSportDisciplinesSuccess = createAction(
    '[AUTOCOMPLETES] GET SPORT DISCIPLINES SUCCESS',

    props<{
        object: Array<SportDiscipline>;
    }>()
);

export const GetTimezonesError = createAction('[AUTOCOMPLETES] GET TIMEZONES ERROR');

export const GetTimezonesSuccess = createAction(
    '[AUTOCOMPLETES] GET TIMEZONES SUCCESS',

    props<{
        object: Array<Timezone>;
    }>()
);

export const GetUrineBoundariesError = createAction('[AUTOCOMPLETES] GET URINE BOUNDARIES ERROR');

export const GetUrineBoundariesSuccess = createAction(
    '[AUTOCOMPLETES] GET URINE BOUNDARIES SUCCESS',

    props<{
        object: ListUrineSampleBoundaries;
    }>()
);

export const GetWitnessChaperonesError = createAction('[AUTOCOMPLETES] GET WITNESS CHAPERONES ERROR');

export const GetWitnessChaperonesSuccess = createAction(
    '[AUTOCOMPLETES] GET WITNESS CHAPERONES SUCCESS',

    props<{
        object: ListParticipantAutoCompletes;
    }>()
);
