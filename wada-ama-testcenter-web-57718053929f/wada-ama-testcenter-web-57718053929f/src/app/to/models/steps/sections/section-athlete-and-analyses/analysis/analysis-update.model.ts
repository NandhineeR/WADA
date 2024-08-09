import { GenericStatus } from '@shared/models';

export class AnalysisUpdate {
    status: GenericStatus | null;

    constructor(analysisUpdate?: Partial<AnalysisUpdate> | null) {
        const { status = null } = analysisUpdate || {};
        this.status = status;
    }
}
