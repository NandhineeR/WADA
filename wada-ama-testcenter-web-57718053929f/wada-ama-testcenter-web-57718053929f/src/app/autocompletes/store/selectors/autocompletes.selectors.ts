import { createSelector } from '@ngrx/store';
import {
    ListMajorEventAutoCompletes,
    ListParticipantAutoCompletes,
    ListUrineSampleBoundaries,
} from '@autocompletes/models';
import {
    CountryWithRegions,
    Laboratory,
    ListItem,
    LocalizedEntity,
    Participant,
    SampleType,
    SportDiscipline,
} from '@shared/models';
import {
    SectionAthleteAutoCompletes,
    SectionAuthorizationAutoCompletes as SectionAuthorizationDCFAutoCompletes,
    SectionDownAutoCompletes,
    SectionNotificationAutoCompletes,
    SectionProceduralAutoCompletes,
    SectionSampleAutoCompletes,
    SectionUpAutoCompletes,
} from '@dcf/models';
import { fetchParticipantFromEverySteps, removeDuplicateParticipant } from '@dcf/mappers';
import { IDCFState } from '@dcf/store/states/dcf.state';
import { getDCFState } from '@dcf/store/reducers';
import {
    SectionAthleteAndAnalysesAutoCompletes,
    SectionAuthorizationAutoCompletes as SectionAuthorizationTestingOrderAutoCompletes,
    SectionDopingControlPersonelAutoCompletes,
    SectionTestParticipantsAutoCompletes,
} from '@to/models';
import { IAutoCompletesState } from '../states/autocompletes.state';
import { getAutoCompletesState } from '../reducers';

/**
 * GET AutoCompletes
 */
export const getAutoCompletesAdos = createSelector(getAutoCompletesState, (state: IAutoCompletesState) => state.ados);
export const getAutoCompletesAthleteRepresentativesObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.athleteRepresentativesObject
);
export const getAutoCompletesAthleteRepresentatives = createSelector(
    getAutoCompletesAthleteRepresentativesObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);
export const getAutoCompletesBloodOfficialsObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.bloodOfficialsObject
);
export const getAutoCompletesBloodOfficials = createSelector(
    getAutoCompletesBloodOfficialsObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);

export const getAutoCompletesCoachMap = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.coachMap || new Map<string, Array<Participant>>()
);
export const getAutoCompletesCoachesObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.coachesObject
);
export const getAutoCompletesCoaches = createSelector(
    getAutoCompletesCoachesObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);
export const getAutoCompletesCompetitionCategories = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.competitionCategories
);
export const getAutoCompletesCountriesWithRegions = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.countriesWithRegions
);
export const getAutoCompletesDcosObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.dcosObject
);
export const getAutoCompletesDcos = createSelector(
    getAutoCompletesDcosObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);
export const getAutoCompletesDoctorMap = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.doctorMap || new Map<string, Array<Participant>>()
);
export const getAutoCompletesDoctorsObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.doctorsObject
);
export const getAutoCompletesDoctors = createSelector(
    getAutoCompletesDoctorsObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);
export const getAutoCompletesDtps = createSelector(getAutoCompletesState, (state: IAutoCompletesState) => state.dtps);
export const getAutoCompletesIdentificationDocuments = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.identificationDocuments
);
export const getAutoCompletesLaboratories = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.laboratories
);
export const getAutoCompletesMajorEventsObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.majorEvents
);
export const getAutoCompletesMajorEvents = createSelector(
    getAutoCompletesMajorEventsObject,
    (object: ListMajorEventAutoCompletes | null) => object?.majorEvents || []
);
export const getAutoCompletesManufacturers = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.manufacturers
);
export const getAutoCompletesMOParticipantsObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.moParticipantsObject
);
export const getAutoCompletesMOParticipants = createSelector(
    getAutoCompletesMOParticipantsObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);
export const getAutoCompletesNonConformityCategories = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.nonConformityCategories
);
export const getAutoCompletesNotifyingChaperonesObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.notifyingChaperonesObject
);
export const getAutoCompletesNotifyingChaperones = createSelector(
    getAutoCompletesNotifyingChaperonesObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);
export const getAutoCompletesOrganizationRelationships = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.organizationRelationships
);
export const getAutoCompletesParticipantStatuses = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.participantStatuses
);
export const getAutoCompletesParticipantTypes = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.participantTypes
);
export const getAutoCompletesSampleTypes = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.sampleTypes
);
export const getAutoCompletesSelectionCriteria = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.selectionCriteria
);
export const getAutoCompletesSportDisciplines = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.sportDisciplines
);
export const getAutoCompletesTimezones = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.timezones
);
export const getAutoCompletesUrineBoundariesObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.urineBoundariesObject
);
export const getAutoCompletesUrineBoundaries = createSelector(
    getAutoCompletesUrineBoundariesObject,
    (object: ListUrineSampleBoundaries | null) => object?.urineSampleBoundaries || []
);
export const getAutoCompletesWitnessChaperonesObject = createSelector(
    getAutoCompletesState,
    (state: IAutoCompletesState) => state.witnessChaperonesObject
);
export const getAutoCompletesWitnessChaperones = createSelector(
    getAutoCompletesWitnessChaperonesObject,
    (object: ListParticipantAutoCompletes | null) => object?.participants || []
);

/**
 * Create DCF Section AutoCompletes
 */
export const getDCFSectionAthleteAutoCompletes = createSelector(
    getAutoCompletesCoaches,
    getAutoCompletesDoctors,
    getAutoCompletesSportDisciplines,
    (coaches: Array<Participant>, doctors: Array<Participant>, sportDisciplines: Array<SportDiscipline>) =>
        new SectionAthleteAutoCompletes({
            coaches,
            doctors,
            sportDisciplines,
        })
);
export const getDCFSectionAuthorizationAutoCompletes = createSelector(
    getAutoCompletesAdos,
    getAutoCompletesDtps,
    (ados: Array<ListItem>, dtps: Array<ListItem>) => new SectionAuthorizationDCFAutoCompletes({ ados, dtps })
);
export const getDCFSectionNotificationAutoCompletes = createSelector(
    getAutoCompletesIdentificationDocuments,
    getAutoCompletesNotifyingChaperones,
    getAutoCompletesSelectionCriteria,
    (
        identificationDocuments: Array<ListItem>,
        notifyingChaperones: Array<Participant>,
        selectionCriteria: Array<ListItem>
    ) =>
        new SectionNotificationAutoCompletes({
            identificationDocuments,
            notifyingChaperones,
            selectionCriteria,
        })
);
export const getDCFSectionNotificationAutoCompletesRefactor = createSelector(
    getDCFState,
    getDCFSectionNotificationAutoCompletes,
    (state: IDCFState, sectionNotificationAutoCompletes: SectionNotificationAutoCompletes) => {
        const participants = fetchParticipantFromEverySteps(state.currentDcf);
        let notifyingChaperones = [...sectionNotificationAutoCompletes.notifyingChaperones, ...participants];
        notifyingChaperones = removeDuplicateParticipant(notifyingChaperones);
        return new SectionNotificationAutoCompletes({
            ...sectionNotificationAutoCompletes,
            notifyingChaperones,
        });
    }
);
export const getDCFSectionProceduralAutoCompletes = createSelector(
    getAutoCompletesAthleteRepresentatives,
    getAutoCompletesDcos,
    getAutoCompletesNonConformityCategories,
    (athleteRepresentatives: Array<Participant>, dcos: Array<Participant>, nonConformityCategories: Array<ListItem>) =>
        new SectionProceduralAutoCompletes({
            athleteRepresentatives,
            dcos,
            nonConformityCategories,
        })
);
export const getDCFSectionProceduralAutoCompletesRefactor = createSelector(
    getDCFState,
    getDCFSectionProceduralAutoCompletes,
    (state: IDCFState, sectionProceduralAutoCompletes: SectionProceduralAutoCompletes) => {
        const participants = fetchParticipantFromEverySteps(state.currentDcf);
        const mergedParticipants = [...sectionProceduralAutoCompletes.dcos, ...participants];
        return new SectionProceduralAutoCompletes({
            ...sectionProceduralAutoCompletes,
            dcos: removeDuplicateParticipant(mergedParticipants),
        });
    }
);
export const getDCFSectionSampleAutoCompletes = createSelector(
    getAutoCompletesBloodOfficials,
    getAutoCompletesLaboratories,
    getAutoCompletesManufacturers,
    getAutoCompletesSampleTypes,
    getAutoCompletesWitnessChaperones,
    (
        bloodOfficials: Array<Participant>,
        laboratories: Array<Laboratory>,
        manufacturers: Array<LocalizedEntity>,
        sampleTypes: Array<SampleType>,
        witnessChaperones: Array<Participant>
    ) =>
        new SectionSampleAutoCompletes({
            bloodOfficials,
            laboratories,
            manufacturers,
            sampleTypes,
            witnessChaperones,
        })
);
export const getDCFSectionSampleAutoCompletesRefactor = createSelector(
    getDCFState,
    getDCFSectionSampleAutoCompletes,
    (state: IDCFState, sectionSampleAutoCompletes: SectionSampleAutoCompletes) => {
        const participants = fetchParticipantFromEverySteps(state.currentDcf);
        let mergedParticipants =
            sectionSampleAutoCompletes.bloodOfficials && sectionSampleAutoCompletes.witnessChaperones
                ? [
                      ...sectionSampleAutoCompletes.bloodOfficials,
                      ...sectionSampleAutoCompletes.witnessChaperones,
                      ...participants,
                  ]
                : [];
        mergedParticipants = removeDuplicateParticipant(mergedParticipants);
        return new SectionSampleAutoCompletes({
            ...sectionSampleAutoCompletes,
            bloodOfficials: mergedParticipants,
            witnessChaperones: mergedParticipants,
        });
    }
);

/**
 * Create Multiple DCF Section AutoCompletes
 */
export const getMultipleDCFSectionDownAutoCompletes = createSelector(
    getAutoCompletesManufacturers,
    getAutoCompletesNotifyingChaperones,
    getAutoCompletesSampleTypes,
    getAutoCompletesSportDisciplines,
    getAutoCompletesTimezones,
    getAutoCompletesWitnessChaperones,
    (
        manufacturers: any,
        notifyingChaperones: any,
        sampleTypes: any,
        sportDisciplines: any,
        timezones: any,
        witnessChaperones: any
    ) =>
        new SectionDownAutoCompletes({
            manufacturers,
            notifyingChaperones,
            sampleTypes,
            sportDisciplines,
            timezones,
            witnessChaperones,
        })
);

export const getMultipleDCFSectionUpAutoCompletes = createSelector(
    getAutoCompletesBloodOfficials,
    getAutoCompletesCoachMap,
    getAutoCompletesCountriesWithRegions,
    getAutoCompletesDcos,
    getAutoCompletesDoctorMap,
    getAutoCompletesLaboratories,
    (bloodOfficials: any, coachMap: any, countriesWithRegions: any, dcos: any, doctorMap: any, laboratories: any) =>
        new SectionUpAutoCompletes({ bloodOfficials, coachMap, countriesWithRegions, dcos, doctorMap, laboratories })
);

/**
 * Create Testing Order Step AutoCompletes
 */
export const getTestingOrderSectionAuthorizationAutoCompletes = createSelector(
    getAutoCompletesAdos,
    getAutoCompletesCompetitionCategories,
    getAutoCompletesCountriesWithRegions,
    getAutoCompletesDtps,
    getAutoCompletesOrganizationRelationships,
    (ados: any, competitionCategories: any, countriesWithRegions: any, dtps: any, organizationRelationships: any) =>
        new SectionAuthorizationTestingOrderAutoCompletes({
            ados,
            competitionCategories,
            countriesWithRegions,
            dtps,
            organizationRelationships,
        })
);
export const getTestingOrderSectionAthleteAndAnalysesAutoCompletes = createSelector(
    getAutoCompletesCountriesWithRegions,
    getAutoCompletesLaboratories,
    getAutoCompletesSampleTypes,
    getAutoCompletesSportDisciplines,
    (countriesWithRegions: any, laboratories: any, sampleTypes: any, sportDisciplines: any) =>
        new SectionAthleteAndAnalysesAutoCompletes({
            countriesWithRegions,
            laboratories,
            sampleTypes,
            sportDisciplines,
        })
);
export const getTestingOrderSectionDopingControlPersonelAutoCompletes = createSelector(
    getAutoCompletesDcos,
    getAutoCompletesParticipantStatuses,
    getAutoCompletesParticipantTypes,
    (dcos: any, participantStatuses: any, participantTypes: any) =>
        new SectionDopingControlPersonelAutoCompletes({ dcos, participantStatuses, participantTypes })
);
export const getTestingOrderSectionTestParticipantsAutoCompletes = createSelector(
    getAutoCompletesBloodOfficials,
    getAutoCompletesMOParticipants,
    getAutoCompletesNotifyingChaperones,
    getAutoCompletesParticipantStatuses,
    getAutoCompletesParticipantTypes,
    getAutoCompletesWitnessChaperones,
    (
        bloodOfficials: any,
        moParticipants: any,
        notifyingChaperones: any,
        participantStatuses: any,
        participantTypes: any,
        witnessChaperones: any
    ) =>
        new SectionTestParticipantsAutoCompletes({
            bloodOfficials,
            moParticipants,
            notifyingChaperones,
            participantStatuses,
            participantTypes,
            witnessChaperones,
        })
);

/**
 * ELSE
 */
export const getAutoCompletesConcatOrganizations = createSelector(
    getAutoCompletesAdos,
    getAutoCompletesDtps,
    (ados: any, dtps: any) => ados.concat(dtps)
);
export const getCountryWithRegionsByCountry = (countryName: string) =>
    createSelector(getAutoCompletesCountriesWithRegions, (countriesWithRegions: Array<CountryWithRegions>) =>
        countriesWithRegions.find(
            (countryWithRegion: CountryWithRegions) =>
                countryWithRegion.name.toUpperCase() === countryName.toUpperCase()
        )
    );
