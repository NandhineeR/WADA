import { GenericStatus, SpecificCode } from '@shared/models';
import { Moment } from 'moment';

export class TestStatusUpdate {
    details: string;

    hasDcf: boolean;

    name: string;

    plannedEndDate: Moment | null;

    plannedStartDate: Moment | null;

    reason: GenericStatus | null;

    testId: string;

    testStatus: GenericStatus | null;

    constructor(testStatusUpdate?: Partial<TestStatusUpdate> | null) {
        const {
            details = '',
            hasDcf = false,
            name = '',
            plannedEndDate = null,
            plannedStartDate = null,
            reason = null,
            testId = '',
            testStatus = null,
        } = testStatusUpdate || {};

        this.details = details;
        this.hasDcf = hasDcf;
        this.name = name;
        this.plannedEndDate = plannedEndDate;
        this.plannedStartDate = plannedStartDate;
        this.reason = reason;
        this.testId = testId;
        this.testStatus = testStatus;
    }

    getAthleteFirstName(): string {
        return this.name.substring(this.name.indexOf(',') + 2, this.name.length);
    }

    getAthleteLastName(): string {
        return this.name.substring(0, this.name.indexOf(','));
    }

    isDetailEmpty(): boolean {
        return this.details?.length === 0 || false;
    }

    isStatusCancelled(): boolean {
        return this.testStatus?.specificCode === SpecificCode.Cancel.toString() || false;
    }

    isStatusClosed(): boolean {
        return this.testStatus?.specificCode === SpecificCode.Closed.toString() || false;
    }
}
