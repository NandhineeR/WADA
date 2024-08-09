import { EntityDescription } from './entity-description.model';

export class AnalysisAttribute {
    id: string;

    analysisDescription: EntityDescription;

    selected: boolean;

    constructor(analysisAttribute?: Partial<AnalysisAttribute> | null) {
        const { id = '', analysisDescription = null, selected = false } = analysisAttribute || {};

        this.id = id;
        this.analysisDescription = new EntityDescription(analysisDescription);
        this.selected = selected;
    }
}
