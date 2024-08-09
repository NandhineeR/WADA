import { DcfBinding } from '@dcf/models';
import { filter, map, startWith } from 'rxjs/operators';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { controlPopOverHasErrors, isNullOrBlank, ValidationCategory, withCategory } from '@shared/utils';
import { PopoverService } from '@core/services';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import { TOItem } from '@shared/models';

@Component({
    selector: 'app-popover-change-testing-order',
    templateUrl: './popover-bind-dcf-to-testing-order.component.html',
    styleUrls: ['./popover-bind-dcf-to-testing-order.component.scss'],
})
export class PopoverChangeTestingOrderNumberComponent implements OnDestroy {
    readonly columns = '100% auto min-content';

    readonly fieldValidators: ValidatorFn | Array<ValidatorFn> = [
        withCategory(Validators.required, ValidationCategory.Mandatory),
    ];

    @ViewChild('firstFormElement') firstFormElement?: ElementRef;

    @ViewChild('textareaReason') textareaReason?: ElementRef;

    @Output()
    readonly changeTestingOrderEmitter: EventEmitter<DcfBinding> = new EventEmitter<DcfBinding>();

    @Input() currentTestingOrderId = '';

    @Input() dcfId = '';

    athleteId$: Observable<string | null> = this.store.pipe(select(fromStore.getAthleteId));

    loadingTOs$: Observable<boolean> = this.store.pipe(select(fromStore.getLoadingTOs));

    testingOrders$: Observable<Array<TOItem>> = this.store.pipe(select(fromStore.getTestingOrders));

    form = new FormGroup({}, { updateOn: 'change' });

    isPopoverActive = false;

    isReasonEmpty = false;

    isTextAreaActive = false;

    showTOWarning = false;

    tosInitialized = false;

    private showErrors = false;

    private subscriptions = new Subscription();

    constructor(private popoverService: PopoverService, private store: Store<fromRootStore.IState>) {}

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Emits a Bind Dcf To Testing Order model in order to pass this information to the parent
     * given a reason for this operation
     */
    bindDCFToTestingOrder(): void {
        this.showErrors = true;
        const toItem: TOItem = this.testingOrder?.value || new TOItem();
        if (!this.textareaReasonHasErrors && this.isTextAreaActive) {
            this.changeTestingOrderEmitter.emit(
                new DcfBinding({
                    reason: this.reason?.value || '',
                    testId: toItem.test?.id || '',
                    dcfId: this.dcfId,
                    testingOrderId: toItem.id,
                })
            );
            this.requestClose();
        }
    }

    onClose(): void {
        this.showErrors = false;
        this.form = new FormGroup({}, { updateOn: 'change' });
        this.isPopoverActive = false;
    }

    /**
     * Action executed when user click on the link for opening the popover change TO number,
     * form is initialized with default values accordingly to the aimed fields to be changed
     */
    onOpen(): void {
        this.isPopoverActive = true;
        this.form = new FormGroup({}, { updateOn: 'change' });
        this.form.addControl('reason', new FormControl('', this.fieldValidators));
        if (this.reason) {
            this.subscriptions.add(
                this.reason.valueChanges.pipe(startWith(this.reason.value)).subscribe((reason: string) => {
                    this.isReasonEmpty = isNullOrBlank(reason);
                })
            );
        }
        this.form.addControl('testingOrder', new FormControl(undefined, []));
        this.setFieldSubscription(this.testingOrder, this.currentTestingOrderId);

        if (!this.tosInitialized) {
            this.subscriptions.add(
                this.athleteId$
                    .pipe(
                        filter((athleteId: string | null) => !isNullOrBlank(athleteId)),
                        map((athleteId: string | null) => athleteId || '')
                    )
                    .subscribe((athleteId: string) => {
                        this.store.dispatch(fromStore.GetTestingOrders({ athleteId }));
                        this.tosInitialized = true;
                    })
            );
        }
    }

    requestClose(): void {
        this.popoverService.closeAll();
    }

    /**
     * When a TO is selected, the TO warning should disappear
     */
    selectedTOItem(to: TOItem): void {
        if (to) {
            this.setTOWarning('', false);
        }
    }

    /**
     * Adds onChange subscription to an input value
     */
    setFieldSubscription(testingOrder: AbstractControl | null, fieldInitialValue: string): void {
        if (testingOrder) {
            this.subscriptions.add(
                testingOrder.valueChanges
                    .pipe(startWith(testingOrder.value))
                    .subscribe((to: TOItem) =>
                        this.toggleReason(to ? isNullOrBlank(to.id) || to.id === fieldInitialValue : true)
                    )
            );
        }
    }

    setTOWarning(inputValue: string, warning: boolean): void {
        this.showTOWarning = warning && !isNullOrBlank(inputValue);
    }

    /**
     * Enable/ disable reason text area
     * @param disableReason disables reason
     */
    toggleReason(disableReason: boolean): void {
        if (this.reason) {
            if (disableReason) {
                this.isTextAreaActive = false;
                this.reason.disable();
            } else {
                this.isTextAreaActive = true;
                this.reason.enable();
            }
        }
    }

    get reason(): AbstractControl | null {
        return this.form.get('reason');
    }

    get testingOrder(): AbstractControl | null {
        return this.form.get('testingOrder');
    }

    get textareaReasonHasErrors(): boolean {
        return controlPopOverHasErrors(this.reason, this.showErrors);
    }
}
