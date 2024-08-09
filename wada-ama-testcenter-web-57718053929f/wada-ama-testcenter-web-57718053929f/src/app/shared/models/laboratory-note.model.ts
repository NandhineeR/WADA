import { Laboratory } from './laboratory.model';

export class LaboratoryNote {
    laboratory: Laboratory | null;

    note: string;

    numberOfOccurrences: number;

    constructor(laboratoryNote?: Partial<LaboratoryNote> | null) {
        const { laboratory = null, note = '', numberOfOccurrences = 0 } = laboratoryNote || {};

        this.laboratory = laboratory ? new Laboratory(laboratory) : null;
        this.note = note;
        this.numberOfOccurrences = numberOfOccurrences;
    }
}
