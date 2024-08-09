import { getUniqueNumber } from '@shared/utils/unique-number';
import { deepEqual } from '@shared/utils/object-util';
import { SampleType } from './sample-type.model';
import { Laboratory } from './laboratory.model';
import { AnalysisAttribute } from './analysis-attribute.model';
import { Status } from './status.model';
import { SpecificCode } from './enums';

export class Analysis {
    id: string;

    tempId: string;

    sampleType: SampleType;

    laboratory: Laboratory | null;

    sampleAnalysisAttributes: Array<AnalysisAttribute>;

    dbsAnalysisTypeDetails: string | undefined;

    status: Status | null;

    systemLabel: string | undefined;

    systemLabelId: string | undefined;

    constructor(analysis?: Partial<Analysis> | null) {
        const {
            id = '',
            tempId = '',
            sampleType = new SampleType(),
            laboratory = null,
            sampleAnalysisAttributes = [],
            dbsAnalysisTypeDetails = undefined,
            status = null,
            systemLabel = undefined,
            systemLabelId = undefined,
        } = analysis || {};

        this.id = id;
        this.tempId = tempId !== '' ? tempId : getUniqueNumber().toString();
        this.sampleAnalysisAttributes = sampleAnalysisAttributes.map(
            (attribute: AnalysisAttribute) => new AnalysisAttribute(attribute)
        );
        this.sampleType = new SampleType(sampleType);
        this.laboratory = new Laboratory(laboratory);
        this.dbsAnalysisTypeDetails = dbsAnalysisTypeDetails;
        this.status = status;
        this.systemLabel = systemLabel;
        this.systemLabelId = systemLabelId;
    }

    /**
     * The 'systemLabelId' field should not be compared, as it is specifically present for Classic Reports.
     * @param analysis
     * @returns
     */
    isEqualsToPrint(analysis?: Partial<Analysis> | null): boolean {
        if (
            analysis === undefined ||
            analysis === null ||
            !deepEqual(analysis.sampleType, this.sampleType) ||
            !deepEqual(analysis.laboratory, this.laboratory) ||
            !deepEqual(analysis.status, this.status) ||
            (analysis?.sampleAnalysisAttributes || []).length !== this.sampleAnalysisAttributes.length
        ) {
            return false;
        }

        const sampleAnalysisAttributeList = (analysis?.sampleAnalysisAttributes || []).map(
            (s) => s.analysisDescription.id
        );
        return (
            this.sampleAnalysisAttributes.filter((s) => !sampleAnalysisAttributeList.includes(s.analysisDescription.id))
                .length === 0
        );
    }

    isStatusClosed(): boolean {
        return this.status?.specificCode === SpecificCode.Closed.toString() || false;
    }
}
