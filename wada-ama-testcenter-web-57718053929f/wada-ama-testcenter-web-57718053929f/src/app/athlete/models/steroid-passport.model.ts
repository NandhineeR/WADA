import { PassportStatus } from './passport-status.enum';

export class SteroidPassport {
    bpID: number | null;

    allowApmu: boolean;

    allowOrgs: boolean;

    lastMatch: Date | null;

    retiredReason: string;

    status: PassportStatus | null;

    constructor(steroidPassport?: Partial<SteroidPassport> | null) {
        const {
            bpID = null,
            allowApmu = false,
            allowOrgs = false,
            lastMatch = null,
            retiredReason = '',
            status = null,
        } = steroidPassport || {};

        this.bpID = bpID;
        this.allowApmu = allowApmu;
        this.allowOrgs = allowOrgs;
        this.lastMatch = lastMatch;
        this.retiredReason = retiredReason;
        this.status = status;
    }
}
