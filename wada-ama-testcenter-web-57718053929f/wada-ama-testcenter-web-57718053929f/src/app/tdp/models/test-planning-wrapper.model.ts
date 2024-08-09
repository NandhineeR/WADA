import { ConcurrentUser } from './concurrent-user.model';
import { TestPlanning } from './test-planning.model';

export class TestPlanningWrapper {
    testPlannings: Array<TestPlanning>;

    concurrentUsers: ConcurrentUser | null;

    constructor(testPlanningWrapper?: Partial<TestPlanningWrapper> | null) {
        const { concurrentUsers = null, testPlannings = [] } = testPlanningWrapper || {};
        this.concurrentUsers = concurrentUsers ? new ConcurrentUser(concurrentUsers) : null;
        this.testPlannings = testPlannings.map((testPlanning) => new TestPlanning(testPlanning));
    }
}
