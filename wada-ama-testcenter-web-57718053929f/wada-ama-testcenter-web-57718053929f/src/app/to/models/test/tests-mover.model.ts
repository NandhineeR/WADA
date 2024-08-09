export class TestsMover {
    testIds: Array<number | null>;

    names: Array<string>;

    testingOrderNumber: string;

    constructor(moveTestingOrder?: Partial<TestsMover> | null) {
        const { testIds = [], names = [], testingOrderNumber = '' } = moveTestingOrder || {};

        this.testIds = testIds;
        this.names = names;
        this.testingOrderNumber = testingOrderNumber;
    }
}
