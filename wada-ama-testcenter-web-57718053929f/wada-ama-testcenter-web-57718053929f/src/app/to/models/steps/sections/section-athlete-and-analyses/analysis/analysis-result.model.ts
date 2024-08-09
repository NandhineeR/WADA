export class AnalysisResult {
    sampleType: string;

    jarCode: string;

    matchingDate: string;

    testResult: string;

    labResultId: string;

    resultReadable: boolean;

    labResult: boolean;

    constructor(analysisResult?: Partial<AnalysisResult> | null) {
        const {
            sampleType = '',
            jarCode = '',
            matchingDate = '',
            testResult = '',
            labResultId = '',
            resultReadable = false,
            labResult = false,
        } = analysisResult || {};

        this.sampleType = sampleType;
        this.jarCode = jarCode;
        this.matchingDate = matchingDate;
        this.testResult = testResult;
        this.labResultId = labResultId;
        this.resultReadable = resultReadable;
        this.labResult = labResult;
    }
}
