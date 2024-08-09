import { cloneDeep, find } from 'lodash-es';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestStatusUpdate, Test, TestStatuses, Warning, TestRow } from '@to/models';
import { testRowToTestStatusUpdate } from '@to/mappers';
import { SpecificCode } from '@shared/models/enums';

@Component({
    selector: 'app-cancel-test-modal',
    templateUrl: './cancel-test-modal.component.html',
    styleUrls: ['./cancel-test-modal.component.scss'],
})
export class CancelTestModalComponent {
    @Output()
    readonly displayCancelledTestsWarning: EventEmitter<Warning> = new EventEmitter<Warning>();

    @Output() readonly testsToCancelEmitter: EventEmitter<Array<TestStatusUpdate>> = new EventEmitter<
        Array<TestStatusUpdate>
    >();

    @Input() set cancelledTests(cancelledTests: Array<Test>) {
        if (cancelledTests?.length > 0) {
            this.checkTestStatus(cancelledTests);
        }
    }

    @Input() set statusUpdateError(statusUpdateError: boolean) {
        this.inError = statusUpdateError;
        if (statusUpdateError) this.handleCancelTestsError();
    }

    @Input() testStatuses: TestStatuses | null = null;

    alreadyCancelledWarning = new Warning();

    cannotBeCancelledWarning = new Warning();

    inError = false;

    isSaveActive = false;

    showModal = false;

    testsNotUpdatedWarning = new Warning();

    testsToCancel: Array<TestStatusUpdate> = [];

    constructor() {}

    checkTestStatus(cancelledTests: Array<Test>): void {
        const testsNotCancelled: Array<Test> = cancelledTests.filter((test: Test) => !test.isStatusCancelled());
        if (testsNotCancelled?.length === 0) {
            this.onCloseModal(true);
        } else {
            testsNotCancelled.forEach((test) => {
                const testToCancel = find(this.testsToCancel, { testId: test.id });
                if (testToCancel instanceof TestStatusUpdate) {
                    this.testsNotUpdatedWarning.names.push(testToCancel.name);
                    this.testsNotUpdatedWarning.objectId = testToCancel.testId;
                }
            });
        }
    }

    handleCancelTestsError(): void {
        this.testsToCancel.forEach((test: TestStatusUpdate) => {
            this.testsNotUpdatedWarning.names.push(test.name);
            this.testsNotUpdatedWarning.objectId = test.testId;
        });
    }

    onCloseModal(displayMessages: boolean): void {
        this.setShowModal(false);
        if (displayMessages) {
            const cancelledWarning = new Warning();
            cancelledWarning.names = this.testsToCancel.map((test) => test.name);
            this.displayCancelledTestsWarning.emit(cloneDeep(cancelledWarning));
        }
    }

    onConfirm(): void {
        const updatedRows = this.setCancelledStatus(this.testsToCancel);
        this.testsToCancelEmitter.emit(updatedRows);
    }

    setCancelledStatus(testsToCancel: Array<TestStatusUpdate>): Array<TestStatusUpdate> {
        return testsToCancel
            .filter((test) => !test.isStatusCancelled())
            .map((test) => {
                const updatedTest = new TestStatusUpdate(test);

                if (this.testStatuses) {
                    const cancelledStatus = this.testStatuses.statuses.find(
                        (status) => status.specificCode === SpecificCode.Cancel.toString()
                    );
                    if (cancelledStatus) {
                        const updatedStatus = cloneDeep(cancelledStatus);
                        updatedStatus.reason = 'test cancelled';
                        updatedTest.testStatus = updatedStatus;
                    }
                }

                return updatedTest;
            });
    }

    setShowModal(showModal: boolean): void {
        this.showModal = showModal;
        this.testsNotUpdatedWarning = new Warning();
        this.alreadyCancelledWarning = new Warning();
        this.cannotBeCancelledWarning = new Warning();
    }

    setWarnings(testRowsToCancel: Array<TestRow>): Array<TestStatusUpdate> {
        const testsWithNoWarning: Array<TestStatusUpdate> = [];
        testRowsToCancel.forEach((testRow) => {
            const testToUpdate = testRowToTestStatusUpdate(testRow);
            // if the test cannot be cancelled because 1. it has a DCF 2. it is closed 3. the user doesn't have the right to cancel
            // (canBeCancelled will be true if the test is already cancelled or if the user doesn't have the right to cancel.
            // Here, we want to know if canBeCancelled is true not because the status already being set to cancelled, but because the user doesn't have the right to cancel)
            if (
                testToUpdate.hasDcf ||
                testToUpdate.isStatusClosed() ||
                (!testToUpdate.isStatusCancelled() && !testRow.canBeCancelled)
            ) {
                this.cannotBeCancelledWarning.names.push(testToUpdate.name);
                this.cannotBeCancelledWarning.objectId = testToUpdate.testId;
                // if the test cannot be cancelled because it is already cancelled
            } else if (testToUpdate.isStatusCancelled()) {
                this.alreadyCancelledWarning.names.push(testToUpdate.name);
                this.alreadyCancelledWarning.objectId = testToUpdate.testId;
            } else {
                testsWithNoWarning.push(testToUpdate);
            }
        });
        this.isSaveActive = testsWithNoWarning?.length > 0;

        return testsWithNoWarning;
    }

    show(testsToCancel: Array<TestRow>): void {
        this.testsToCancel = cloneDeep(this.setWarnings(testsToCancel));
        this.showModal = true;
    }

    get displayMessages(): boolean {
        return this.testsToCancel.length > 0 && !this.inError;
    }
}
