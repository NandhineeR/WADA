import { Action, createReducer, on } from '@ngrx/store';
import * as fromAutoCompletesState from '@autocompletes/store/states/autocompletes.state';
import * as fromAutoCompletes from '@autocompletes/store/actions';
import { LoadingSteps } from '@autocompletes/models';
import { IAutoCompletesState } from '../states/autocompletes.state';

export const autoCompletesReducer = createReducer(
    fromAutoCompletesState.initialAutocompletesState,
    /**
     * GET DCF
     */
    on(fromAutoCompletes.GetDCFAdos, (state) => {
        return {
            ...state,
            error: false,
            loading: true,
            loadingSteps: new LoadingSteps({
                ...state.loadingSteps,
                loadingAdos: true,
            }),
        };
    }),
    on(fromAutoCompletes.GetDCFAthleteRepresentatives, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingAthleteRepresentativesObject: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFBloodOfficials, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingBloodOfficialsObject: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFCoaches, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingCoachesObject: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFDcos, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDcosObject: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFDoctors, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDoctorsObject: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFDtps, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDtps: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFIdentificationDocuments, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingIdentificationDocuments: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFLaboratories, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingLaboratories: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFMajorEvents, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingMajorEvents: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFManufacturers, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingManufacturers: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFNonConformityCategories, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingNonConformityCategories: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFNotifyingChaperones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingNotifyingChaperonesObject: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFSampleTypes, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSampleTypes: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFSelectionCriteria, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSelectionCriteria: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFSportDisciplines, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSportDisciplines: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFTimezones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingTimezones: true,
        }),
    })),
    on(fromAutoCompletes.GetDCFWitnessChaperones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingWitnessChaperonesObject: true,
        }),
    })),

    /**
     * GET MULTIPLE DCF
     */
    on(fromAutoCompletes.GetMultipleDCFBloodOfficials, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingBloodOfficialsObject: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFCoachMap, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingCoachMap: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFDcos, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDcosObject: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFDoctorMap, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDoctorMap: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFLaboratories, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingLaboratories: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFManufacturers, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingManufacturers: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFNotifyingChaperones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingNotifyingChaperonesObject: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFSampleTypes, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSampleTypes: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFSportDisciplines, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSportDisciplines: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFTimezones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingTimezones: true,
        }),
    })),
    on(fromAutoCompletes.GetMultipleDCFWitnessChaperones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingWitnessChaperonesObject: true,
        }),
    })),

    /**
     * Get Testing Order
     */
    on(fromAutoCompletes.GetTestingOrderAdos, (state) => {
        return {
            ...state,
            error: false,
            loading: true,
            loadingSteps: new LoadingSteps({
                ...state.loadingSteps,
                loadingAdos: true,
            }),
        };
    }),
    on(fromAutoCompletes.GetTestingOrderBloodOfficials, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingBloodOfficialsObject: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderCompetitionCategories, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingCompetitionCategories: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderCountriesWithRegions, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingCountriesWithRegions: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderDcos, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDcosObject: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderDtps, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingDtps: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderLaboratories, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingLaboratories: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderMOParticipants, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingMOParticipantsObject: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderNotifyingChaperones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingNotifyingChaperonesObject: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderOrganizationRelationships, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingOrganizationRelationships: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderParticipantStatuses, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingParticipantStatuses: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderParticipantTypes, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingParticipantTypes: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderSampleTypes, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSampleTypes: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderSportDisciplines, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingSportDisciplines: true,
        }),
    })),
    on(fromAutoCompletes.GetTestingOrderWitnessChaperones, (state) => ({
        ...state,
        error: false,
        loading: true,
        loadingSteps: new LoadingSteps({
            ...state.loadingSteps,
            loadingWitnessChaperonesObject: true,
        }),
    })),

    /**
     * SHARED
     */
    on(fromAutoCompletes.GetAdosError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingAdos: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetAdosSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingAdos: false,
        });
        return {
            ...state,
            ados: action.object,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetAthleteRepresentativesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingAthleteRepresentativesObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep3(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetAthleteRepresentativesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingAthleteRepresentativesObject: false,
        });
        return {
            ...state,
            athleteRepresentativesObject: action.object,
            loading: loadingSteps.isLoadingDCFStep3(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetBloodOfficialsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingBloodOfficialsObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetBloodOfficialsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingBloodOfficialsObject: false,
        });
        return {
            ...state,
            bloodOfficialsObject: action.object,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCoachMapError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCoachMap: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingMultipleDCF(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCoachMapSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCoachMap: false,
        });
        return {
            ...state,
            coachMap: action.object,
            loading: loadingSteps.isLoadingMultipleDCF(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCoachesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCoachesObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCoachesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCoachesObject: false,
        });
        return {
            ...state,
            coachesObject: action.object,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCompetitionCategoriesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCompetitionCategories: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCompetitionCategoriesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCompetitionCategories: false,
        });
        return {
            ...state,
            competitionCategories: action.object,
            loading: loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCountriesWithRegionsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCountriesWithRegions: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep1() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetCountriesWithRegionsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingCountriesWithRegions: false,
        });
        return {
            ...state,
            countriesWithRegions: action.object,
            loading: loadingSteps.isLoadingTestingOrderStep1() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDcosError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDcosObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep3() || loadingSteps.isLoadingTestingOrderStep3(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDcosSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDcosObject: false,
        });
        return {
            ...state,
            dcosObject: action.object,
            loading: loadingSteps.isLoadingDCFStep3() || loadingSteps.isLoadingTestingOrderStep3(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDoctorMapError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDoctorMap: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingMultipleDCF(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDoctorMapSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDoctorMap: false,
        });
        return {
            ...state,
            doctorMap: action.object,
            loading: loadingSteps.isLoadingMultipleDCF(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDoctorsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDoctorsObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDoctorsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDoctorsObject: false,
        });
        return {
            ...state,
            doctorsObject: action.object,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDtpsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDtps: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetDtpsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingDtps: false,
        });
        return {
            ...state,
            dtps: action.object,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetIdentificationDocumentsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingIdentificationDocuments: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetIdentificationDocumentsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingIdentificationDocuments: false,
        });
        return {
            ...state,
            identificationDocuments: action.object,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetLaboratoriesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingLaboratories: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetLaboratoriesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingLaboratories: false,
        });
        return {
            ...state,
            laboratories: action.object,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetMajorEventsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingMajorEvents: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetMajorEventsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingMajorEvents: false,
        });
        return {
            ...state,
            majorEvents: action.object,
            loading: loadingSteps.isLoadingDCFStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetManufacturersError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingManufacturers: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetManufacturersSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingManufacturers: false,
        });
        return {
            ...state,
            manufacturers: action.object,
            loading: loadingSteps.isLoadingDCFStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetMOParticipantsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingMOParticipantsObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetMOParticipantsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingMOParticipantsObject: false,
        });
        return {
            ...state,
            moParticipantsObject: action.object,
            loading: loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetNonConformityCategoriesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingNonConformityCategories: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep3(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetNonConformityCategoriesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingNonConformityCategories: false,
        });
        return {
            ...state,
            nonConformityCategories: action.object,
            loading: loadingSteps.isLoadingDCFStep3(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetNotifyingChaperonesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingNotifyingChaperonesObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetNotifyingChaperonesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingNotifyingChaperonesObject: false,
        });
        return {
            ...state,
            notifyingChaperonesObject: action.object,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetOrganizationRelationshipsError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingOrganizationRelationships: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetOrganizationRelationshipsSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingOrganizationRelationships: false,
        });
        return {
            ...state,
            organizationRelationships: action.object,
            loading: loadingSteps.isLoadingTestingOrderStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetParticipantStatusesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingParticipantStatuses: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep3() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetParticipantStatusesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingParticipantStatuses: false,
        });
        return {
            ...state,
            participantStatuses: action.object,
            loading: loadingSteps.isLoadingTestingOrderStep3() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetParticipantTypesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingParticipantTypes: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep3() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetParticipantTypesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingParticipantTypes: false,
        });
        return {
            ...state,
            participantTypes: action.object,
            loading: loadingSteps.isLoadingTestingOrderStep3() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetSampleTypesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingSampleTypes: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetSampleTypesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingSampleTypes: false,
        });
        return {
            ...state,
            sampleTypes: action.object,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetSelectionCriteriaError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingSelectionCriteria: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetSelectionCriteriaSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingSelectionCriteria: false,
        });
        return {
            ...state,
            selectionCriteria: action.object,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetSportDisciplinesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingSportDisciplines: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetSportDisciplinesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingSportDisciplines: false,
        });
        return {
            ...state,
            sportDisciplines: action.object,
            loading: loadingSteps.isLoadingDCFStep1() || loadingSteps.isLoadingTestingOrderStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetTimezonesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingTimezones: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetTimezonesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingTimezones: false,
        });
        return {
            ...state,
            timezones: action.object,
            loading: loadingSteps.isLoadingDCFStep1(),
            loadingSteps,
        };
    }),

    on(fromAutoCompletes.GetUrineBoundariesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingUrineBoundariesObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep2(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetUrineBoundariesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
        });
        return {
            ...state,
            urineBoundariesObject: action.object,
            loading: loadingSteps.isLoadingDCFStep2(),
            loadingSteps,
        };
    }),

    on(fromAutoCompletes.GetWitnessChaperonesError, (state) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingWitnessChaperonesObject: false,
        });
        return {
            ...state,
            error: true,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    }),
    on(fromAutoCompletes.GetWitnessChaperonesSuccess, (state, action) => {
        const loadingSteps = new LoadingSteps({
            ...state.loadingSteps,
            loadingWitnessChaperonesObject: false,
        });
        return {
            ...state,
            witnessChaperonesObject: action.object,
            loading: loadingSteps.isLoadingDCFStep2() || loadingSteps.isLoadingTestingOrderStep4(),
            loadingSteps,
        };
    })
);

export function reducer(state: IAutoCompletesState | undefined, action: Action): IAutoCompletesState {
    return autoCompletesReducer(state, action);
}
