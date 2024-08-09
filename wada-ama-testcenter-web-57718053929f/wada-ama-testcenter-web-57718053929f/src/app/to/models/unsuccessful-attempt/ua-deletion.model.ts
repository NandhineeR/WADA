export class UADeletion {
    testId: string;

    unsuccessfulAttemptId: string;

    athleteName: string;

    reason: string;

    constructor(ua?: Partial<UADeletion> | null) {
        const { testId = '', unsuccessfulAttemptId = '', athleteName = '', reason = '' } = ua || {};

        this.testId = testId;
        this.unsuccessfulAttemptId = unsuccessfulAttemptId;
        this.athleteName = athleteName;
        this.reason = reason;
    }
}
