import { LaboratoryNote } from '@shared/models';
import { TestRow } from '../../../test/test-row.model';

export class AthleteAndAnalysesInformation {
    tests: Array<TestRow>;

    laboratoryNotes: Array<LaboratoryNote>;

    constructor(athleteAndAnalyses?: Partial<AthleteAndAnalysesInformation> | null) {
        const { tests = [], laboratoryNotes = [] } = athleteAndAnalyses || {};
        this.tests = tests.map((test) => new TestRow(test));
        this.laboratoryNotes = laboratoryNotes.map((note) => new LaboratoryNote(note));
    }
}
