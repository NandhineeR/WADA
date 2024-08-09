import { ObjectTargetEnum, Reason } from '@shared/models';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslationService } from '@core/services';
import { controlPopOverHasErrors, isNullOrBlank, ValidationCategory, withCategory } from '@shared/utils';

@Component({
    selector: 'app-delete-modal',
    templateUrl: './delete-modal.component.html',
    styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent {
    readonly objectTargetEnum = ObjectTargetEnum;

    @ViewChild('textareaReason') textareaReason?: ElementRef;

    @Output()
    readonly deleteObject: EventEmitter<Reason> = new EventEmitter<Reason>();

    @Input() hiddenBody = false;

    @Input() isDeletable = false;

    @Input() isOpened = false;

    @Input() name = '';

    @Input() objectId: string | null = null;

    @Input() shortName: string | null = null;

    @Input() targetObject: ObjectTargetEnum | null = null;

    translations$ = this.translationService.translations$;

    form = new FormGroup(
        {
            reason: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
        },
        { updateOn: 'change' }
    );

    private showErrors = false;

    constructor(private translationService: TranslationService) {}

    /**
     * On close, form is reset
     */
    onClose(): void {
        if (this.textareaReason) {
            this.showErrors = false;
            this.form.reset();
        }
        this.isOpened = false;
    }

    onDelete(): void {
        this.showErrors = true;
        if (this.reason && !isNullOrBlank(this.reason.value)) {
            const reason = new Reason();
            reason.objectId = this.objectId?.toString() || '';
            reason.details = this.reason.value;
            this.deleteObject.emit(reason);
            this.onClose();
        }
    }

    onOpen(): void {
        if (this.textareaReason) {
            this.textareaReason.nativeElement.focus();
        }
        this.isOpened = true;
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

    get reasonHasErrors(): boolean {
        return controlPopOverHasErrors(this.reason, this.showErrors);
    }
}
