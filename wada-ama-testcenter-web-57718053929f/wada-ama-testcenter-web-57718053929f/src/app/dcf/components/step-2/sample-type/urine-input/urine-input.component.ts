import { Participant } from '@shared/models';
import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import {
    AbstractControl,
    ControlContainer,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR,
    Validators,
} from '@angular/forms';
import { trigger } from '@angular/animations';
import { DELAYED_FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { ParticipantInputComponent } from '@shared/components';
import {
    withCategory,
    ValidationCategory,
    validateSpecificGravityDiluted,
    validateDatetimeFormat,
    fieldRequired,
    controlHasModeRelatedErrors,
    updateValidators,
    updateVolumeValidators,
    updateVolumeReasonValidators,
    isVolumeBelowMinimumReasonField,
    isNullOrBlank,
    hasValidationCategoryErrors,
} from '@shared/utils';
import { UrineSampleBoundaries } from '@dcf/models';
import { BaseSampleInput } from '@dcf/utils/base-sample/base-sample-input.directive';

export const URINE_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UrineInputComponent),
    multi: true,
};

@Component({
    selector: 'app-urine-input',
    templateUrl: './urine-input.component.html',
    styleUrls: ['./urine-input.component.scss'],
    providers: [URINE_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [DELAYED_FADE_IN, FADE_OUT])],
})
export class UrineInputComponent extends BaseSampleInput {
    @ViewChild('witnessChaperoneParticipantInput') witnessChaperoneParticipantInput?: ParticipantInputComponent;

    @Output() readonly updatePartialSample: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

    @Input() set urineSampleBoundaries(urineSampleBoundaries: UrineSampleBoundaries | null) {
        if (urineSampleBoundaries) {
            this.form = this.controlContainer.control as FormGroup;
            this.boundaries = urineSampleBoundaries;
            this.onVolumeChange(this.volume?.value);
            const partialTrueChecked = this.form.controls.partial.value;
            this.handleCheckChange(partialTrueChecked);
        }
    }

    @Input() witnessChaperones: Array<Participant> = [];

    boundaries: UrineSampleBoundaries | null = null;

    isFirstThresholdOrBelow = false;

    minimumSpecificGravity: number | null = null;

    minimumVolume: number | null = null;

    upperThreshold: number | null = null;

    constructor(private controlContainer: ControlContainer, store: Store<fromRootStore.IState>) {
        super(store);
    }

    /**
     * Handles switch for partial sample
     * @param partialTrueChecked - whether the sample is partial
     */
    handleCheckChange(partialTrueChecked: boolean): void {
        if (partialTrueChecked) {
            this.handleCheckPartial();
        } else {
            this.handleCheckNotPartial();
        }
    }

    isVolumeBelowMinimumReasonField(): boolean {
        return isVolumeBelowMinimumReasonField(Number.parseFloat(this.volume?.value), this.boundaries);
    }

    /**
     * Updates validators for volume and specific gravity each time the volume changes
     * @param newVolume - the updated volume
     */
    onVolumeChange(newVolume: string): void {
        this.setMinimumValues(newVolume);
        updateVolumeValidators(this.volume, this.boundaries);
        this.updateSpecificGravityValidators(newVolume);
        updateVolumeReasonValidators(newVolume, this.boundaries, this.volumeBelowMinimumReason);
    }

    /**
     * Sets the minimumVolume, minimumSpecificGravity and isFirstThreshold properties.
     * If the volume entered by the user is below the second volume threshold, then we use the first SG threshold (so isFirstThreshold = true)
     * else, the volume entered by the user is equal to or above the second volume threshold, in which case we use the second SG threshold (so isFirstThreshold = false)
     * @param volume - the updated volume in the form
     */
    setMinimumValues(volume: string) {
        if (this.boundaries && this.boundaries.minimumVolumeThreshold2 && this.boundaries.minimumVolumeThreshold1) {
            if (parseInt(volume, 10) < this.boundaries.minimumVolumeThreshold1) {
                this.minimumVolume = this.boundaries.minimumVolumeThreshold0;
                this.minimumSpecificGravity = this.boundaries.minimumSpecificGravityThreshold0;
                this.upperThreshold = this.boundaries.minimumVolumeThreshold1 - 1;
                this.isFirstThresholdOrBelow = true;
            } else if (parseInt(volume, 10) < this.boundaries.minimumVolumeThreshold2) {
                this.minimumVolume = this.boundaries.minimumVolumeThreshold1;
                this.minimumSpecificGravity = this.boundaries.minimumSpecificGravityThreshold1;
                this.upperThreshold = this.boundaries.minimumVolumeThreshold2 - 1;
                this.isFirstThresholdOrBelow = true;
            } else {
                this.minimumVolume = this.boundaries.minimumVolumeThreshold2;
                this.minimumSpecificGravity = this.boundaries.minimumSpecificGravityThreshold2;
                this.upperThreshold = null;
                this.isFirstThresholdOrBelow = false;
            }
        }
    }

    private handleCheckNotPartial() {
        this.form.addControl(
            'laboratory',
            new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)])
        );
        this.form.addControl(
            'volume',
            new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)])
        );
        this.form.addControl('volumeBelowMinimumReason', new FormControl('', []));
        this.form.addControl(
            'specificGravity',
            new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)])
        );

        if (
            this.collectionDate &&
            this.witnessChaperone &&
            this.laboratory &&
            this.specificGravity &&
            this.volume &&
            this.boundaries
        ) {
            updateValidators(this.collectionDate, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
            if (!this.isMultipleDCF) {
                updateValidators(this.laboratory, [
                    withCategory(fieldRequired('description'), ValidationCategory.Mandatory),
                ]);
            }
            updateVolumeValidators(this.volume, this.boundaries);
            this.updateSpecificGravityValidators(this.volume?.value);
        }

        if (this.partialVolume) {
            this.form.removeControl('partialVolume');
            this.partial?.setValue(false);
            this.updatePartialSample.emit(this.form);
        }
    }

    private handleCheckPartial() {
        if (this.collectionDate) {
            updateValidators(this.collectionDate, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
        }

        if (this.form.controls.laboratory) {
            this.form.removeControl('laboratory');
        }
        if (this.form.controls.volume) {
            this.form.removeControl('volume');
        }
        if (this.form.controls.volumeBelowMinimumReason) {
            this.form.removeControl('volumeBelowMinimumReason');
        }
        if (this.form.controls.specificGravity) {
            this.form.removeControl('specificGravity');
        }

        if (!this.form.controls.partialVolume) {
            this.form.addControl('partialVolume', new FormControl('', []));
            if (this.partialVolume) {
                updateValidators(this.partialVolume, [withCategory(Validators.required, ValidationCategory.Mandatory)]);
            }
            this.partial?.setValue(true);
            this.updatePartialSample.emit(this.form);
        }
    }

    private updateSpecificGravityValidators(volume: string) {
        if (this.specificGravity && this.boundaries) {
            updateValidators(this.specificGravity, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(
                    validateSpecificGravityDiluted(parseInt(volume, 10), this.boundaries),
                    ValidationCategory.Warning
                ),
            ]);
        }
    }

    get partial(): AbstractControl | null {
        return this.form.get('partial');
    }

    get partialVolume(): AbstractControl | null {
        return this.form.get('partialVolume');
    }

    get partialVolumeHasErrors(): boolean {
        if (this.partialVolume) {
            updateValidators(this.partialVolume, [withCategory(Validators.required, ValidationCategory.Mandatory)]);
        }
        return controlHasModeRelatedErrors(
            this.partialVolume,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.partialVolume?.errors?.required
        );
    }

    get specificGravity(): AbstractControl | null {
        return this.form.get('specificGravity');
    }

    get specificGravityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.specificGravity,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.specificGravity?.errors?.required
        );
    }

    get specificGravityHasWarnings(): boolean {
        return (
            (this.specificGravity &&
                this.specificGravity.invalid &&
                hasValidationCategoryErrors(this.specificGravity, ValidationCategory.Warning)) ||
            false
        );
    }

    get volume(): AbstractControl | null {
        return this.form.get('volume');
    }

    get volumeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.volume,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.volume?.errors?.required
        );
    }

    get volumeBelowMinimumReason(): AbstractControl | null {
        return this.form.get('volumeBelowMinimumReason');
    }

    get volumeBelowMinimumReasonHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.volumeBelowMinimumReason,
            this.showErrors,
            this.inCreation,
            this.volumeBelowMinimumReason?.errors?.required
        );
    }

    get witnessChaperone(): AbstractControl | null {
        return this.form.get('witnessChaperone');
    }

    get witnessChaperoneHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.witnessChaperone,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.witnessChaperone?.errors?.lastNameRequired || this.witnessChaperone?.errors?.firstNameRequired
        );
    }

    get witnessChaperoneHasFirstNameErrors(): boolean {
        return (
            ((this.witnessChaperoneParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && this.witnessChaperoneHasErrors)) &&
                this.witnessChaperone?.errors?.firstNameRequired) ||
            (!this.inCreation &&
                this.witnessChaperone?.errors?.firstNameRequired &&
                isNullOrBlank(this.witnessChaperone?.value?.firstName))
        );
    }

    get witnessChaperoneHasLastNameErrors(): boolean {
        return (
            ((this.witnessChaperoneParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && this.witnessChaperoneHasErrors)) &&
                this.witnessChaperone?.errors?.lastNameRequired) ||
            (!this.inCreation &&
                this.witnessChaperone?.errors?.lastNameRequired &&
                isNullOrBlank(this.witnessChaperone?.value?.lastName))
        );
    }
}
