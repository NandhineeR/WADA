import { ExpertReviewStatus } from './expert-review-status.enum';
import { ApmuStatus } from './apmu-status.enum';
import { PassportStatus } from './passport-status.enum';

export class BloodPassport {
    bpID: number | null;

    allowApmu: boolean;

    allowOrgs: boolean;

    lastMatch: Date | null;

    retiredReason: string;

    status: PassportStatus | null;

    apmuRecommendation: ApmuStatus | null;

    expertReviewStatus: ExpertReviewStatus | null;

    expertReportId: string;

    wadaExpertReportId: string;

    currentPassport: boolean;

    abnormalities: Array<string>;

    constructor(bloodPassport?: Partial<BloodPassport> | null) {
        const {
            bpID = null,
            allowApmu = false,
            allowOrgs = false,
            lastMatch = null,
            retiredReason = '',
            status = null,
            apmuRecommendation = null,
            expertReviewStatus = null,
            expertReportId = '',
            wadaExpertReportId = '',
            currentPassport = false,
            abnormalities = [],
        } = bloodPassport || {};

        this.bpID = bpID;
        this.allowApmu = allowApmu;
        this.allowOrgs = allowOrgs;
        this.lastMatch = lastMatch;
        this.retiredReason = retiredReason;
        this.status = status;
        this.apmuRecommendation = apmuRecommendation;
        this.expertReviewStatus = expertReviewStatus;
        this.expertReportId = expertReportId;
        this.wadaExpertReportId = wadaExpertReportId;
        this.currentPassport = currentPassport;
        this.abnormalities = abnormalities;
    }
}
