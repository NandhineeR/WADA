import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PopoverService } from '@core/services';
import { TranslationService } from '@core/services/translation.service';
import { SampleCorrection, SampleTargetFieldEnum } from '@dcf/models';
import { SampleType } from '@shared/models';
import { controlPopOverHasErrors, isNullOrBlank, ValidationCategory, withCategory } from '@shared/utils';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
    selector: 'app-popover-sample-correction',
    templateUrl: './popover-sample-correction.component.html',
    styleUrls: ['./popover-sample-correction.component.scss'],
})
export class PopoverSampleCorrectionComponent implements OnInit, OnDestroy {
    readonly fieldValidators: ValidatorFn | Array<ValidatorFn> = [
        withCategory(Validators.required, ValidationCategory.Mandatory),
    ];

    readonly sampleTargetFieldEnum = SampleTargetFieldEnum;

    @ViewChild('firstFormElement') firstFormElement?: ElementRef;

    @ViewChild('textareaReason') textareaReason?: ElementRef;

    @Output()
    readonly changeSampleEmitter: EventEmitter<SampleCorrection> = new EventEmitter<SampleCorrection>();

    @Input() currentSampleCode = '';

    @Input() currentSampleType = '';

    @Input() currentValidity = false;

    @Input() dcfRetentionPeriod: string | null = null;

    @Input() dcfToBeDeleted = false;

    @Input() hasAdverseResult = false;

    @Input() hasSampleResults = false;

    @Input() isLastMatchedSample = false;

    @Input() sampleId = '';

    @Input() sampleJarCode = '';

    @Input() sampleTargetField = '';

    @Input() sampleTypes: Array<SampleType> = [];

    translations$ = this.translationService.translations$;

    columns = '30% auto min-content min-content';

    isPopoverActive = false;

    isReasonEmpty = false;

    isTextAreaActive = false;

    sampleForm = new FormGroup({}, { updateOn: 'change' });

    private showErrors = false;

    private subscriptions = new Subscription();

    constructor(private popoverService: PopoverService, private translationService: TranslationService) {}

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.sampleForm = new FormGroup({}, { updateOn: 'change' });
    }

    /**
     * Closes popover resetting sample form
     */
    onClose(): void {
        this.showErrors = false;
        this.sampleForm = new FormGroup({}, { updateOn: 'change' });
        this.isPopoverActive = false;
    }

    /**
     * Emits a sample corrections model in order to correct fields such as sample type,
     * sample code, sample validity, or breaking a sample match given a reason for the operation
     */
    changeSample(): void {
        this.showErrors = true;
        if (!this.textareaReasonHasErrors && this.isTextAreaActive) {
            this.changeSampleEmitter.emit(
                new SampleCorrection({
                    reason: this.reason?.value || '',
                    sampleCode: this.sampleCode?.value || '',
                    sampleJarCode: this.sampleJarCode,
                    sampleId: this.sampleId,
                    sampleTargetField: this.sampleTargetField,
                    sampleType: this.sampleTypeSpecificCode?.value || '',
                    valid: this.validity?.value || false,
                })
            );
            this.requestClose();
        }
    }

    /**
     * Action executed when user click on the link for opening the popover sample correction,
     * sample form is initialized with default values according to the aimed fields to be changed
     */
    onOpen(): void {
        this.isPopoverActive = true;

        this.sampleForm.addControl('reason', new FormControl('', this.fieldValidators));

        if (this.reason && this.sampleTargetField === this.sampleTargetFieldEnum.MATCH_TYPE) {
            this.subscriptions.add(
                this.reason.valueChanges.pipe(startWith('')).subscribe((reason: string) => {
                    this.isReasonEmpty = isNullOrBlank(reason);
                })
            );
        }

        if (!isNullOrBlank(this.sampleTargetField)) {
            switch (this.sampleTargetField) {
                case this.sampleTargetFieldEnum.SAMPLE_CODE:
                    this.columns = '20% 75% min-content min-content';
                    this.sampleForm.addControl(
                        'sampleCode',
                        new FormControl(this.currentSampleCode, this.fieldValidators)
                    );
                    this.setFieldSubscription(this.sampleCode, this.currentSampleCode);
                    this.toggleReason(true);
                    break;
                case this.sampleTargetFieldEnum.SAMPLE_TYPE:
                    this.columns = '20% auto min-content min-content';
                    this.sampleForm.addControl(
                        'sampleTypeSpecificCode',
                        new FormControl(this.currentSampleType, this.fieldValidators)
                    );
                    this.toggleReason(true);
                    break;
                case this.sampleTargetFieldEnum.VALIDITY:
                    this.sampleForm.addControl(
                        'sampleValidity',
                        new FormControl(this.currentValidity, this.fieldValidators)
                    );
                    this.toggleReason(true);
                    break;
                case this.sampleTargetFieldEnum.MATCH_TYPE:
                    // there is no field to be compared to when breaking a match
                    this.toggleReason(false);
                    break;
                default:
                    break;
            }
        }
        this.setInitialFocus();
    }

    requestClose(): void {
        this.popoverService.closeAll();
    }

    /**
     * Adds onChange subscription to an input value
     */
    setFieldSubscription(sampleField: AbstractControl | null, fieldInitialValue: string): void {
        if (sampleField) {
            this.subscriptions.add(
                sampleField.valueChanges.subscribe((fieldValue: string) =>
                    this.toggleReason(fieldValue === fieldInitialValue)
                )
            );
        }
    }

    /**
     * Sets initial focus for when user clicks on the link for opening the popover
     */
    setInitialFocus(): void {
        if (this.firstFormElement) {
            setTimeout(() => this.firstFormElement && this.firstFormElement.nativeElement.focus());
        } else if (this.textareaReason) {
            setTimeout(() => this.textareaReason && this.textareaReason.nativeElement.focus());
        }
    }

    /**
     * Enable/ disable reason text area
     * @param fieldValueUnchanged check for reference field value changes
     */
    toggleReason(fieldValueUnchanged: boolean): void {
        if (this.reason) {
            if (fieldValueUnchanged) {
                this.isTextAreaActive = false;
                this.reason.disable();
            } else {
                this.isTextAreaActive = true;
                this.reason.enable();
            }
        }
    }

    get reason(): AbstractControl | null {
        return this.sampleForm.get('reason');
    }

    get sampleCode(): AbstractControl | null {
        return this.sampleForm.get('sampleCode');
    }

    get sampleTypeSpecificCode(): AbstractControl | null {
        return this.sampleForm.get('sampleTypeSpecificCode');
    }

    get textareaReasonHasErrors(): boolean {
        return controlPopOverHasErrors(this.reason, this.showErrors);
    }

    get validity(): AbstractControl | null {
        return this.sampleForm.get('sampleValidity');
    }
}
