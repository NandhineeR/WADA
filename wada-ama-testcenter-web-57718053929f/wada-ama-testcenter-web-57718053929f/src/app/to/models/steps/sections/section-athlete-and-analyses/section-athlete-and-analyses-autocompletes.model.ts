import { CountryWithRegions, Laboratory, SampleType, SportDiscipline } from '@shared/models';

export class SectionAthleteAndAnalysesAutoCompletes {
    countriesWithRegions: Array<CountryWithRegions>;

    laboratories: Array<Laboratory>;

    sampleTypes: Array<SampleType>;

    sportDisciplines: Array<SportDiscipline>;

    constructor(step2AutoCompletes?: SectionAthleteAndAnalysesAutoCompletes) {
        const { countriesWithRegions = [], laboratories = [], sampleTypes = [], sportDisciplines = [] } =
            step2AutoCompletes || {};

        this.countriesWithRegions = countriesWithRegions.map((country) => new CountryWithRegions(country));
        this.laboratories = (laboratories || []).map((laboratory) => new Laboratory(laboratory));
        this.sampleTypes = (sampleTypes || []).map((sampleType) => new SampleType(sampleType));
        this.sportDisciplines = (sportDisciplines || []).map((sca) => new SportDiscipline(sca));
    }
}
