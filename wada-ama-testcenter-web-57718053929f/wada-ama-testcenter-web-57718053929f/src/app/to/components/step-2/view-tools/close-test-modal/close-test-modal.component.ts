import { cloneDeep, find } from 'lodash-es';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestStatusUpdate, Test, TestStatuses, Warning } from '@to/models';
import { ColumnDef, DataSource, SpecificCode } from '@shared/models';
import { TranslationService } from '@core/services';
import { Subscription } from 'rxjs';
import { TableTranslationService } from '@shared/services';
import * as moment from 'moment';
import { CalendarUtils, formatDateWithZeroTimeZone } from '@shared/utils';

@Component({
    selector: 'app-close-test-modal',
    templateUrl: './close-test-modal.component.html',
    styleUrls: ['./close-test-modal.component.scss'],
})
export class CloseTestModalComponent extends CalendarUtils {
    readonly locale = 'en';

    @Output()
    readonly displayClosedTestsWarning: EventEmitter<Warning> = new EventEmitter<Warning>();

    @Output() readonly testsToCloseEmitter: EventEmitter<Array<TestStatusUpdate>> = new EventEmitter<
        Array<TestStatusUpdate>
    >();

    @Input() set closedTests(closedTests: Array<Test>) {
        if (closedTests?.length > 0) {
            this.checkTestStatus(closedTests);
        }
    }

    @Input() set statusUpdateError(statusUpdateError: boolean) {
        this.inError = statusUpdateError;
        if (statusUpdateError) this.handleCloseTestsError();
    }

    @Input() testStatuses: TestStatuses | null = null;

    translations$ = this.translationService.translations$;

    closedTestsWarning = new Warning();

    currentDate = moment();

    dataSource = new DataSource(Array<TestStatusUpdate>());

    dcfOrCancelledWarning = new Warning();

    inError = false;

    isLinkActive = false;

    isSaveActive = false;

    isValidationActive = false;

    returnToForm = false;

    showModal = false;

    subscriptions: Subscription = new Subscription();

    testsNotUpdatedWarning = new Warning();

    testsToClose: Array<TestStatusUpdate> = [];

    columns: Array<Partial<ColumnDef<TestStatusUpdate>>> = [
        {
            key: 'name',
            header: this.getHeaderTranslation('closedTestName'),
            cell: (e) => e.name,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: 'reason',
            header: this.getHeaderTranslation('closedTestReason'),
            cell: (e) => e.reason,
            mandatory: true,
        },
        {
            key: 'details',
            header: this.getHeaderTranslation('closedTestDetails'),
            cell: (e) => e.details,
            mandatory: true,
        },
    ];

    constructor(
        private translationService: TranslationService,
        private tableTranslationService: TableTranslationService
    ) {
        super();
    }

    /**
     * Check if all tests returned from the server side have a closed status, if yes, modal is updated with returned data,
     * otherwise, create Test Not Updated Warning with the list of tests with status different than closed
     */
    checkTestStatus(closedTests: Array<Test>): void {
        const testsNotClosed: Array<Test> = closedTests.filter((test: Test) => !test.isStatusClosed());
        if (testsNotClosed.length === 0) {
            this.returnToForm = true;
            this.onCloseModal();
        } else {
            testsNotClosed.forEach((test) => {
                const row = find(this.dataSource.data, { testId: test.id });
                if (row instanceof TestStatusUpdate) {
                    this.testsNotUpdatedWarning.names.push(row.name);
                    this.testsNotUpdatedWarning.objectId = row.testId;
                }
            });
        }
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.subscriptions.add(
            this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
                headerTranslation = value;
            })
        );
        return headerTranslation;
    }

    handleCloseTestsError(): void {
        this.testsToClose.forEach((test: TestStatusUpdate) => {
            this.testsNotUpdatedWarning.names.push(test.name);
            this.testsNotUpdatedWarning.objectId = test.testId;
        });
    }

    isFormValid(): boolean {
        let isValid = true;
        this.dataSource.data.forEach((row) => {
            if ((row.details ? row.details.length < 1 : true) || row.reason === null) {
                isValid = false;
            }
        });
        return isValid;
    }

    isTestClosedOrCancelled(e: any): boolean {
        return e.isStatusClosed() || e.isStatusCancelled() || this.returnToForm;
    }

    onCloseModal(): void {
        this.setShowModal(false);
        this.isValidationActive = false;
        if (this.returnToForm && !this.isLinkActive) {
            const closedWarning = new Warning();
            closedWarning.names = this.dataSource.data.map((row) => row.name);
            this.displayClosedTestsWarning.emit(cloneDeep(closedWarning));
        }
    }

    /**
     * When user clicks in done, validates if tests can be changed to closed status, then emits request
     */
    onConfirm(): void {
        this.isValidationActive = true;
        if (this.isFormValid()) {
            const updatedRows = this.setClosedStatus(this.dataSource.data);
            this.testsToCloseEmitter.emit(updatedRows);
        }
    }

    setClosedStatus(testsToClose: Array<TestStatusUpdate>): Array<TestStatusUpdate> {
        return testsToClose
            .filter((row) => !row.isStatusClosed())
            .map((row) => {
                const updatedRow = new TestStatusUpdate(row);
                if (this.testStatuses) {
                    const closedStatus = this.testStatuses.statuses.find(
                        (status) => status.specificCode === SpecificCode.Closed.toString()
                    );
                    if (closedStatus) {
                        const updatedStatus = cloneDeep(closedStatus);
                        updatedStatus.reason = row.details;
                        updatedRow.testStatus = updatedStatus;
                        if (updatedRow.plannedStartDate?.toString() !== updatedRow.plannedEndDate?.toString()) {
                            this.updateDate(this.currentDate, updatedRow);
                        }
                    }
                }
                return updatedRow;
            });
    }

    setShowModal(showModal: boolean): void {
        this.showModal = showModal;
        this.closedTestsWarning = new Warning();
        this.dcfOrCancelledWarning = new Warning();
        this.testsNotUpdatedWarning = new Warning();
    }

    /**
     * Sets warning and returns tests with no warning
     */
    setWarnings(testsToClose: Array<TestStatusUpdate>, returnToForm: boolean): void {
        this.testsToClose = [];
        testsToClose.forEach((test) => {
            if (test.hasDcf || test.isStatusCancelled()) {
                this.dcfOrCancelledWarning.names.push(test.name);
                this.dcfOrCancelledWarning.objectId = test.testId;
            } else if (test.isStatusClosed() && !returnToForm) {
                this.closedTestsWarning.names.push(test.name);
                this.closedTestsWarning.objectId = test.testId;
            } else {
                this.testsToClose.push(test);
            }
        });
        this.isSaveActive = this.testsToClose.length > 0;
    }

    /**
     * Called from the parent to open the modal
     */
    show(testsToclose: Array<TestStatusUpdate>, returnToForm: boolean): void {
        // checks if user comes from the link when test is already closed
        this.isLinkActive = returnToForm;
        this.returnToForm = returnToForm;
        this.setWarnings(testsToclose, returnToForm);
        this.dataSource.data = cloneDeep(this.testsToClose);
        this.showModal = true;
    }

    updateDataSource(updatedRows: Array<TestStatusUpdate>): void {
        updatedRows.forEach((updatedRow) => {
            const row = find(this.dataSource.data, {
                testId: updatedRow.testId,
            });
            if (row) {
                row.reason = updatedRow.reason;
                row.details = updatedRow.details;
                row.testStatus = updatedRow.testStatus;
            }
        });
    }

    updateDate(event: any, e: any): void {
        e.plannedStartDate = event ? formatDateWithZeroTimeZone(event) : null;
        e.plannedEndDate = event ? formatDateWithZeroTimeZone(event) : null;
    }

    get displayMessages(): boolean {
        return this.testsToClose.length > 0 && !this.inError;
    }
}
