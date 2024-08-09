import { GenericStatus } from '@shared/models';

export class TestUpdate {
    status: GenericStatus | null;

    subStatus: GenericStatus | null;

    reasonDetail: string;

    plannedStartDate: string | null;

    plannedEndDate: string | null;

    constructor(testUpdate?: Partial<TestUpdate> | null) {
        const { status = null, subStatus = null, reasonDetail = '', plannedStartDate = null, plannedEndDate = null } =
            testUpdate || {};
        this.status = status;
        this.subStatus = subStatus;
        this.reasonDetail = reasonDetail;
        this.plannedStartDate = plannedStartDate;
        this.plannedEndDate = plannedEndDate;
    }
}
