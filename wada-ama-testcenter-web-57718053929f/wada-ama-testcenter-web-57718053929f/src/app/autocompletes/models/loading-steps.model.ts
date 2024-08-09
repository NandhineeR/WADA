export class LoadingSteps {
    loadingAdos: boolean;

    loadingAthleteRepresentativesObject: boolean;

    loadingBloodOfficialsObject: boolean;

    loadingCoachMap: boolean;

    loadingCoachesObject: boolean;

    loadingCompetitionCategories: boolean;

    loadingCountriesWithRegions: boolean;

    loadingDcosObject: boolean;

    loadingDoctorMap: boolean;

    loadingDoctorsObject: boolean;

    loadingDtps: boolean;

    loadingIdentificationDocuments: boolean;

    loadingLaboratories: boolean;

    loadingMajorEvents: boolean;

    loadingManufacturers: boolean;

    loadingMOParticipantsObject: boolean;

    loadingNonConformityCategories: boolean;

    loadingNotifyingChaperonesObject: boolean;

    loadingOrganizationRelationships: boolean;

    loadingParticipantStatuses: boolean;

    loadingParticipantTypes: boolean;

    loadingSampleTypes: boolean;

    loadingSelectionCriteria: boolean;

    loadingSportDisciplines: boolean;

    loadingTimezones: boolean;

    loadingUrineBoundariesObject: boolean;

    loadingWitnessChaperonesObject: boolean;

    constructor(loadingSteps?: Partial<LoadingSteps>) {
        const {
            loadingAdos = false,
            loadingAthleteRepresentativesObject = false,
            loadingBloodOfficialsObject = false,
            loadingCoachMap = false,
            loadingCoachesObject = false,
            loadingCompetitionCategories = false,
            loadingCountriesWithRegions = false,
            loadingDcosObject = false,
            loadingDoctorMap = false,
            loadingDoctorsObject = false,
            loadingDtps = false,
            loadingIdentificationDocuments = false,
            loadingLaboratories = false,
            loadingMajorEvents = false,
            loadingManufacturers = false,
            loadingMOParticipantsObject = false,
            loadingNonConformityCategories = false,
            loadingNotifyingChaperonesObject = false,
            loadingOrganizationRelationships = false,
            loadingParticipantStatuses = false,
            loadingParticipantTypes = false,
            loadingSampleTypes = false,
            loadingSelectionCriteria = false,
            loadingSportDisciplines = false,
            loadingTimezones = false,
            loadingUrineBoundariesObject = false,
            loadingWitnessChaperonesObject = false,
        } = loadingSteps || {};

        this.loadingAdos = loadingAdos;
        this.loadingAthleteRepresentativesObject = loadingAthleteRepresentativesObject;
        this.loadingBloodOfficialsObject = loadingBloodOfficialsObject;
        this.loadingCoachMap = loadingCoachMap;
        this.loadingCoachesObject = loadingCoachesObject;
        this.loadingCompetitionCategories = loadingCompetitionCategories;
        this.loadingCountriesWithRegions = loadingCountriesWithRegions;
        this.loadingDcosObject = loadingDcosObject;
        this.loadingDoctorMap = loadingDoctorMap;
        this.loadingDoctorsObject = loadingDoctorsObject;
        this.loadingDtps = loadingDtps;
        this.loadingIdentificationDocuments = loadingIdentificationDocuments;
        this.loadingLaboratories = loadingLaboratories;
        this.loadingMajorEvents = loadingMajorEvents;
        this.loadingManufacturers = loadingManufacturers;
        this.loadingMOParticipantsObject = loadingMOParticipantsObject;
        this.loadingNonConformityCategories = loadingNonConformityCategories;
        this.loadingNotifyingChaperonesObject = loadingNotifyingChaperonesObject;
        this.loadingOrganizationRelationships = loadingOrganizationRelationships;
        this.loadingParticipantStatuses = loadingParticipantStatuses;
        this.loadingParticipantTypes = loadingParticipantTypes;
        this.loadingSampleTypes = loadingSampleTypes;
        this.loadingSelectionCriteria = loadingSelectionCriteria;
        this.loadingSportDisciplines = loadingSportDisciplines;
        this.loadingTimezones = loadingTimezones;
        this.loadingUrineBoundariesObject = loadingUrineBoundariesObject;
        this.loadingWitnessChaperonesObject = loadingWitnessChaperonesObject;
    }

    isLoadingDCFStep1(): boolean {
        return (
            this.loadingAdos ||
            this.loadingDtps ||
            this.loadingIdentificationDocuments ||
            this.loadingNotifyingChaperonesObject ||
            this.loadingSelectionCriteria ||
            this.loadingCoachesObject ||
            this.loadingDoctorsObject ||
            this.loadingSportDisciplines ||
            this.loadingTimezones
        );
    }

    isLoadingDCFStep2(): boolean {
        return (
            this.loadingBloodOfficialsObject ||
            this.loadingLaboratories ||
            this.loadingMajorEvents ||
            this.loadingManufacturers ||
            this.loadingSampleTypes ||
            this.loadingUrineBoundariesObject ||
            this.loadingWitnessChaperonesObject
        );
    }

    isLoadingDCFStep3(): boolean {
        return (
            this.loadingAthleteRepresentativesObject || this.loadingDcosObject || this.loadingNonConformityCategories
        );
    }

    isLoadingMultipleDCF(): boolean {
        return (
            this.loadingBloodOfficialsObject ||
            this.loadingCoachMap ||
            this.loadingCountriesWithRegions ||
            this.loadingDcosObject ||
            this.loadingDoctorMap ||
            this.loadingLaboratories ||
            this.loadingManufacturers ||
            this.loadingNotifyingChaperonesObject ||
            this.loadingSampleTypes ||
            this.loadingSportDisciplines ||
            this.loadingTimezones ||
            this.loadingUrineBoundariesObject ||
            this.loadingWitnessChaperonesObject
        );
    }

    isLoadingTestingOrderStep1(): boolean {
        return (
            this.loadingAdos ||
            this.loadingCompetitionCategories ||
            this.loadingCountriesWithRegions ||
            this.loadingDtps ||
            this.loadingMajorEvents ||
            this.loadingOrganizationRelationships
        );
    }

    isLoadingTestingOrderStep2(): boolean {
        return (
            this.loadingCountriesWithRegions ||
            this.loadingLaboratories ||
            this.loadingSampleTypes ||
            this.loadingSportDisciplines
        );
    }

    isLoadingTestingOrderStep3(): boolean {
        return this.loadingDcosObject || this.loadingParticipantStatuses || this.loadingParticipantTypes;
    }

    isLoadingTestingOrderStep4(): boolean {
        return (
            this.loadingBloodOfficialsObject ||
            this.loadingMOParticipantsObject ||
            this.loadingNotifyingChaperonesObject ||
            this.loadingParticipantStatuses ||
            this.loadingParticipantTypes ||
            this.loadingWitnessChaperonesObject
        );
    }
}
