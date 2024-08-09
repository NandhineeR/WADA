export class TestDuplicate {
    organizationShortName: string;

    warningPeriod: string;

    constructor(duplicateTest?: Partial<TestDuplicate> | null) {
        const { organizationShortName = '', warningPeriod = '' } = duplicateTest || {};

        this.organizationShortName = organizationShortName;
        this.warningPeriod = warningPeriod;
    }
}
