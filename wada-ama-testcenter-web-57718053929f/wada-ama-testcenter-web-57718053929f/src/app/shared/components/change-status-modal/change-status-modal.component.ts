import { ObjectTargetEnum, Reason, StatusEnum } from '@shared/models';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslationService } from '@core/services';
import { controlHasModeRelatedErrors, isNullOrBlank, ValidationCategory, withCategory } from '@shared/utils';
import { Test } from '@to/models';

@Component({
    selector: 'app-change-status-modal',
    templateUrl: './change-status-modal.component.html',
    styleUrls: ['./change-status-modal.component.scss'],
})
export class ChangeStatusModalComponent {
    readonly objectTargetEnum = ObjectTargetEnum;

    @ViewChild('textareaReason') textareaReason?: ElementRef;

    @Input() set hasActiveTests(hasActiveTests: boolean) {
        this._hasActiveTests = hasActiveTests;
        this.updateHiddenBody();
    }

    @Input() set statusSpecificCode(statusSpecificCode: StatusEnum) {
        this.enumStringValue = StatusEnum[statusSpecificCode];
        this.updateHiddenBody();
    }

    get testsAthleteWithoutSamples(): Array<Test> {
        return this._testsAthleteWithoutSamples;
    }

    @Input() set testsAthleteWithoutSamples(testsAthleteWithoutSamples: Array<Test>) {
        this._testsAthleteWithoutSamples = testsAthleteWithoutSamples;
        this.hasTestsAthleteWithoutSamples = testsAthleteWithoutSamples.length > 0;
        this.updateHiddenBody();
    }

    @Input() isOpened = false;

    @Input() objectId: string | null = null;

    @Input() targetObject: ObjectTargetEnum | null = null;

    @Input() hasAnalysisInTests = false;

    @Output()
    readonly changeStatusEmitter: EventEmitter<Reason> = new EventEmitter<Reason>();

    _hasActiveTests = false;

    enumStringValue = '';

    form = new FormGroup(
        {
            reason: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
        },
        { updateOn: 'change' }
    );

    hasTestsAthleteWithoutSamples = false;

    hiddenBody = false;

    translations$ = this.translationService.translations$;

    private _testsAthleteWithoutSamples: Array<Test> = [];

    private showErrors = false;

    constructor(private translationService: TranslationService) {}

    /**
     * Emit the change status request to the parent of the popover, sending the respective reason
     */
    changeStatus(): void {
        this.showErrors = true;
        if (this.reason && !isNullOrBlank(this.reason.value)) {
            const reason = new Reason();
            reason.objectId = this.objectId?.toString() || '';
            reason.details = this.reason.value;
            this.changeStatusEmitter.emit(reason);
            this.onClose();
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
        this.isOpened = false;
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

    updateHiddenBody(): void {
        this.hiddenBody =
            !this.hasAnalysisInTests &&
            (this.hasTestsAthleteWithoutSamples ||
                (this.enumStringValue === StatusEnum[StatusEnum.Completed] && this._hasActiveTests));
    }

    get reason(): AbstractControl | null {
        return this.form.get('reason');
    }

    get reasonHasErrors(): boolean {
        return controlHasModeRelatedErrors(this.reason, this.showErrors, false, true);
    }
}
