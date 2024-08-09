export class SampleValidityUpdate {
    sampleId?: string;

    valid?: boolean;

    reason?: string;

    diluted?: boolean;

    constructor(update: Partial<SampleValidityUpdate>) {
        this.sampleId = update.sampleId;
        this.valid = update.valid;
        this.reason = update.reason;
        this.diluted = update.diluted;
    }
}
