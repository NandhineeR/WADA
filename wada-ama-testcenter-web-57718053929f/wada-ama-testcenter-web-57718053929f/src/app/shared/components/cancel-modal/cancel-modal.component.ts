import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopoverService } from '@core/services';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationCategory, controlPopOverHasErrors, withCategory } from '@shared/utils/form-util';
import { isNullOrBlank } from '@shared/utils';

@Component({
    selector: 'app-cancel-modal',
    templateUrl: './cancel-modal.component.html',
    styleUrls: ['./cancel-modal.component.scss'],
})
export class CancelModalComponent {
    @Input() isCancellable = false;

    @Input() set hasError(hasError: boolean) {
        this.toggleReason(hasError);
        this._hasError = hasError;
    }

    @ViewChild('textareaReason', { static: true }) textareaReason?: ElementRef;

    @Output()
    readonly cancelEmitter: EventEmitter<string> = new EventEmitter<string>();

    _hasError = false;

    form = new FormGroup(
        {
            reason: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
        },
        { updateOn: 'blur' }
    );

    private showErrors = false;

    constructor(private popoverService: PopoverService) {}

    /**
     * Emit the cancel request to the parent of the popover, sending the respective reason
     */
    changeStatusToCancel(): void {
        this.showErrors = true;
        if (this.reason && !isNullOrBlank(this.reason.value)) {
            this.cancelEmitter.emit(this.reason.value);
            this.requestClose();
        }
    }

    /**
     * Focus on the reason when popover is opened
     */
    onOpen(): void {
        if (this.textareaReason) {
            this.textareaReason.nativeElement.focus();
        }
    }

    /**
     * On close, form is reset
     */
    onClose(): void {
        if (this.textareaReason) {
            this.showErrors = false;
            this.form.reset();
        }
    }

    requestClose(): void {
        this.popoverService.closeAll();
    }

    /**
     * Enable/ disable reason text area in the presence of a warning
     */
    toggleReason(disableField: boolean): void {
        if (this.reason) {
            if (disableField) {
                this.reason.disable();
            } else {
                this.reason.enable();
            }
        }
    }

    get reason(): AbstractControl | null {
        return this.form.get('reason');
    }

    get textareaReasonHasErrors(): boolean {
        return controlPopOverHasErrors(this.reason, this.showErrors);
    }
}
