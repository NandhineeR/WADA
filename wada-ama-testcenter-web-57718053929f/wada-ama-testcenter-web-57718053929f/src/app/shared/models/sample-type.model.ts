import { AnalysisAttribute } from './analysis-attribute.model';

export class SampleType {
    id: number | null;

    description: string;

    sampleAnalysisAttributes: Array<AnalysisAttribute> | null;

    specificCode: string;

    constructor(sampleType?: Partial<SampleType> | null) {
        const { id = null, description = '', sampleAnalysisAttributes = [], specificCode = '' } = sampleType || {};

        this.id = id;
        this.description = description;
        this.sampleAnalysisAttributes = (sampleAnalysisAttributes || []).map(
            (sampleAnalysisAttribute) => new AnalysisAttribute(sampleAnalysisAttribute)
        );
        this.specificCode = specificCode;
    }
}
