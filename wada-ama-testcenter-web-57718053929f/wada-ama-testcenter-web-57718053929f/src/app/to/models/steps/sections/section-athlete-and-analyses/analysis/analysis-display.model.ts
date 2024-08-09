import { SpecificCode } from '@shared/models/enums';

export class AnalysisDisplay {
    id: string;

    name: string;

    attribute: string;

    lab: string;

    label: string;

    status: string;

    testId: string;

    testName: string;

    constructor(analysisDisplay?: Partial<AnalysisDisplay> | null) {
        const { id = '', name = '', attribute = '', lab = '', label = '', status = '', testId = '', testName = '' } =
            analysisDisplay || {};
        this.id = id.toString();
        this.name = name.toString();
        this.attribute = attribute.toString();
        this.lab = lab.toString();
        this.label = label.toString();
        this.status = status.toString();
        this.testId = testId.toString();
        this.testName = testName.toString();
    }

    isStatusClosed(): boolean {
        return this.status?.includes(SpecificCode.Closed.toString()) || false;
    }
}
