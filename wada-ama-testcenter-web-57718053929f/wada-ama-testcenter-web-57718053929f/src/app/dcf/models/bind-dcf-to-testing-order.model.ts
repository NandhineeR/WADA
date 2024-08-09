export class DcfBinding {
    dcfId: string;

    reason: string;

    testId: string;

    testingOrderId: string;

    constructor(bindToTO?: Partial<DcfBinding> | null) {
        const { dcfId = '', reason = '', testId = '', testingOrderId = '' } = bindToTO || {};

        this.dcfId = dcfId;
        this.reason = reason;
        this.testId = testId;
        this.testingOrderId = testingOrderId;
    }
}
