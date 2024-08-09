import { AthleteLevel } from '@to/models';

export class TestPoolParticipant {
    id: number | null;

    endDate: Date | null;

    startDate: Date | null;

    testingPoolLevel: AthleteLevel | null;

    constructor(testPool?: Partial<TestPoolParticipant> | null) {
        const { id = null, endDate = null, startDate = null, testingPoolLevel = null } = testPool || {};

        this.id = id;
        this.endDate = endDate;
        this.startDate = startDate;
        this.testingPoolLevel = testingPoolLevel;
    }
}
