export class TestPlanning {
    startMonth: number | null;

    endMonth: number | null;

    id: number | null;

    inCompetition: boolean;

    numberOfTests: number;

    sampleTypeDescription: string;

    sampleTypeId: number | null;

    sampleTypeOrder: number | null;

    sportDescription: string;

    sportDisciplineDescription: string;

    sportDisciplineId: string;

    sportId: string;

    testingSubstanceCategoryId: string;

    testingSubstanceCategorySpecificCode: string;

    year: number | null;

    constructor(testPlanning?: Partial<TestPlanning> | null) {
        const {
            startMonth = null,
            endMonth = null,
            id = null,
            inCompetition = false,
            numberOfTests = null,
            sampleTypeDescription = '',
            sampleTypeId = null,
            sampleTypeOrder = null,
            sportDescription = '',
            sportDisciplineDescription = '',
            sportDisciplineId = '',
            sportId = '',
            testingSubstanceCategoryId = '',
            testingSubstanceCategorySpecificCode = '',
            year = null,
        } = testPlanning || {};

        this.startMonth = startMonth || 0;
        this.endMonth = endMonth || 0;
        this.id = id;
        this.inCompetition = inCompetition;
        this.numberOfTests = numberOfTests || 0;
        this.sampleTypeDescription = sampleTypeDescription;
        this.sampleTypeId = sampleTypeId || 0;
        this.sampleTypeOrder = sampleTypeOrder || 0;
        this.sportDescription = sportDescription;
        this.sportDisciplineDescription = sportDisciplineDescription;
        this.sportDisciplineId = sportDisciplineId;
        this.sportId = sportId;
        this.testingSubstanceCategoryId = testingSubstanceCategoryId;
        this.testingSubstanceCategorySpecificCode = testingSubstanceCategorySpecificCode;
        this.year = year || 0;
    }
}
