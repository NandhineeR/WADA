import { GenericStatus } from '@shared/models';

export class TestStatuses {
    statuses: Array<GenericStatus>;

    subStatuses: Array<GenericStatus>;

    constructor(testStatuses?: Partial<TestStatuses> | null) {
        const { statuses = [], subStatuses = [] } = testStatuses || {};
        this.statuses = statuses;
        this.subStatuses = subStatuses;
    }

    isEmpty(): boolean {
        return this.statuses.length === 0 && this.subStatuses.length === 0;
    }
}
