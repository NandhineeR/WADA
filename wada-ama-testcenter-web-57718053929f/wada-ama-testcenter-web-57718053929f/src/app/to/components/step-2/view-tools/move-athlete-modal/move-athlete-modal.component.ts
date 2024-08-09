import { isNullOrBlank } from '@shared/utils';
import { cloneDeep, remove } from 'lodash-es';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TestsMover, TestRow, Warning } from '@to/models';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { switchMap } from 'rxjs/operators';
import { TOItem } from '@shared/models';

@Component({
    selector: 'app-move-athlete-modal',
    templateUrl: './move-athlete-modal.component.html',
    styleUrls: ['./move-athlete-modal.component.scss'],
})
export class MoveAthleteModalComponent {
    @Output()
    readonly confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly moveToTOEmitter: EventEmitter<TestsMover> = new EventEmitter<TestsMover>();

    @Input() currentTestingOrderId = '';

    @Input() testsToMove: TestsMover = new TestsMover();

    loadingTOs$: Observable<boolean> = this.store.pipe(select(fromStore.getLoadingTestingOrders));

    toItems$: Observable<Array<TOItem>> = this.store.pipe(
        select(fromStore.getTestingOrderItems),
        switchMap((tos) => of(this.removeCurrentTO(tos)))
    );

    athleteNames = Array<string>();

    isSaveActive = true;

    selectedTestingOrder = '';

    showModal = false;

    testHasClosedWarning = new Warning();

    testHasDCFWarning = new Warning();

    constructor(private store: Store<fromRootStore.IState>) {}

    /**
     * move to testing order
     */
    moveToTestingOrder(): void {
        this.testsToMove.testingOrderNumber = this.selectedTestingOrder;
        this.moveToTOEmitter.emit(this.testsToMove);
        this.onClose();
    }

    onClose(): void {
        this.confirm.emit(false);
        this.showModal = false;
        this.testHasClosedWarning.names = [];
        this.testHasDCFWarning.names = [];
    }

    onConfirm(): void {
        this.confirm.emit(true);
        this.showModal = false;
    }

    removeCurrentTO(testingOrders: Array<TOItem>): Array<TOItem> {
        if (testingOrders.length > 0) {
            const updatedTOs = cloneDeep(testingOrders);
            remove(updatedTOs, (to: TOItem) => to.id === this.currentTestingOrderId);
            return updatedTOs;
        }
        return [];
    }

    selectTestingOrderNumber(toItem: TOItem): void {
        if (toItem) {
            this.selectedTestingOrder = toItem.testingOrderNumber;
        }
    }

    /**
     * Sets warning and returns row with no warning
     */
    setWarnings(tests: Array<TestRow>): void {
        this.testsToMove.names = [];
        this.testsToMove.testIds = [];
        tests.forEach((test) => {
            const testId = test.id?.toString() || '';
            if (!isNullOrBlank(test.dcfId)) {
                this.testHasDCFWarning.names.push(test.name);
                this.testHasDCFWarning.objectId = testId;
            } else {
                this.testsToMove.names.push(test.name);
                this.testsToMove.testIds.push(test.id);
            }
        });
    }

    /**
     * Called from a parent to open the modal
     */
    show(tests: Array<TestRow>): void {
        this.showModal = true;
        this.setWarnings(tests);
    }
}
