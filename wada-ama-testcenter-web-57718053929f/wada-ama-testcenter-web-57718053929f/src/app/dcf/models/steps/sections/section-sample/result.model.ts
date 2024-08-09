import { GenericStatus } from '@shared/models';
import { Finding } from './finding.model';

export class Result {
    id: string;

    finding: Finding | null;

    labResultId: string;

    matchingResultStatus: GenericStatus | null;

    sampleJarCode: string;

    testResultStatus: GenericStatus | null;

    constructor(result?: Partial<Result> | null) {
        const {
            id = '',
            finding = null,
            labResultId = '',
            matchingResultStatus = null,
            sampleJarCode = '',
            testResultStatus = null,
        } = result || {};
        this.id = id;
        this.labResultId = labResultId;
        this.finding = finding ? new Finding(finding) : null;
        this.matchingResultStatus = matchingResultStatus ? new GenericStatus(matchingResultStatus) : null;
        this.sampleJarCode = sampleJarCode;
        this.testResultStatus = testResultStatus ? new GenericStatus(testResultStatus) : null;
    }
}
