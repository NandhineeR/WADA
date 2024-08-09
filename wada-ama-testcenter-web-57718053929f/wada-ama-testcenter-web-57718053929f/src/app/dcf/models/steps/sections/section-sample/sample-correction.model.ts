export class SampleCorrection {
    dcfId: string;

    reason: string;

    sampleCode: string;

    sampleId: string;

    sampleJarCode: string;

    sampleTargetField: string;

    sampleType: string;

    valid: boolean;

    constructor(sampleCorrection?: Partial<SampleCorrection> | null) {
        const {
            dcfId = '',
            reason = '',
            sampleCode = '',
            sampleId = '',
            sampleJarCode = '',
            sampleTargetField = '',
            sampleType = '',
            valid = false,
        } = sampleCorrection || {};

        this.dcfId = dcfId;
        this.reason = reason;
        this.sampleCode = sampleCode;
        this.sampleId = sampleId;
        this.sampleJarCode = sampleJarCode;
        this.sampleTargetField = sampleTargetField;
        this.sampleType = sampleType;
        this.valid = valid;
    }
}
