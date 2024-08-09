export class StatusUpdate {
    statusSpecificCode: string;

    reason: string;

    constructor(statusUpdate?: Partial<StatusUpdate>) {
        const { statusSpecificCode = '', reason = '' } = statusUpdate || {};
        this.statusSpecificCode = statusSpecificCode;
        this.reason = reason;
    }
}
