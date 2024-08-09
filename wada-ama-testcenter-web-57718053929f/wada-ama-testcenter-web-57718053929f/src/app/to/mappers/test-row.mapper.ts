import { isNullOrBlank } from '@shared/utils';
import { TestStatusUpdate, Test, TestRow, TestUpdate } from '@to/models';

function getTestName(test: Test, athleteId: string) {
    let testName =
        test.athlete && !isNullOrBlank(test.athlete.firstName)
            ? `${test.athlete.lastName}, ${test.athlete.firstName}`
            : '';
    testName = testName === ', ' ? '' : testName;

    //  placeholder who's not binded to an athlete
    let name = '';
    if (isNullOrBlank(athleteId) && test.isPlaceholder) {
        name = test.placeHolderDescription;
    } else if (!isNullOrBlank(athleteId) && !test.isPlaceholder) {
        name = testName;
    } else if (!isNullOrBlank(athleteId) && test.isPlaceholder && !isNullOrBlank(test.placeHolderDescription)) {
        name = `${testName} - ${test.placeHolderDescription}`;
    }

    return name;
}

export function testRowToTestStatusUpdate(testRow: TestRow): TestStatusUpdate {
    const testStatusUpdate = new TestStatusUpdate();
    if (testRow) {
        let name = '';
        //  placeholder who's not binded to an athlete
        if (isNullOrBlank(testRow.athleteId) && testRow.isPlaceholder) {
            name = testRow.placeholder;
        } else if (!isNullOrBlank(testRow.athleteId) && !testRow.isPlaceholder) {
            name = testRow.name;
        } else if (!isNullOrBlank(testRow.athleteId) && testRow.isPlaceholder && !isNullOrBlank(testRow.placeholder)) {
            name = `${testRow.name} - ${testRow.placeholder}`;
        }
        testStatusUpdate.name = name;
        testStatusUpdate.testId = testRow.id?.toString() || '';
        testStatusUpdate.hasDcf = !isNullOrBlank(testRow.dcfId);
        testStatusUpdate.testStatus = testRow.status;
        testStatusUpdate.reason = testRow.subStatus;
        testStatusUpdate.details = testRow.reasonDetail;
        testStatusUpdate.plannedStartDate = testRow.plannedStartDate;
        testStatusUpdate.plannedEndDate = testRow.plannedEndDate;
    }
    return testStatusUpdate;
}

export function testRowsToTestStatusUpdates(testRows: Array<TestRow>): Array<TestStatusUpdate> {
    return testRows.map((testRow: TestRow) => testRowToTestStatusUpdate(testRow));
}

export function testStatusUpdateToTestUpdate(testStatusUpdate: TestStatusUpdate): TestUpdate {
    const testUpdate = new TestUpdate();
    if (testStatusUpdate) {
        testUpdate.status = testStatusUpdate.testStatus;
        testUpdate.subStatus = testStatusUpdate.reason;
        testUpdate.reasonDetail = testStatusUpdate.details;
        testUpdate.plannedStartDate = (testStatusUpdate.plannedStartDate || new Date()).toString();
        testUpdate.plannedEndDate = (testStatusUpdate.plannedEndDate || new Date()).toString();
    }
    return testUpdate;
}

function testToTestStatusUpdate(test: Test): TestStatusUpdate {
    const testStatusUpdate = new TestStatusUpdate();
    if (test) {
        const athleteId = test.athlete?.id?.toString() || '';
        const testName = getTestName(test, athleteId);
        testStatusUpdate.name = testName;
        testStatusUpdate.testId = test.id?.toString() || '';
        testStatusUpdate.hasDcf = !isNullOrBlank(test.dcfId);
        testStatusUpdate.testStatus = test.status;
        testStatusUpdate.reason = test.subStatus;
        testStatusUpdate.details = test.reasonDetail;
    }
    return testStatusUpdate;
}

export function testsToTestStatusUpdates(tests: Array<Test>): Array<TestStatusUpdate> {
    return tests.map((test: Test) => testToTestStatusUpdate(test));
}
