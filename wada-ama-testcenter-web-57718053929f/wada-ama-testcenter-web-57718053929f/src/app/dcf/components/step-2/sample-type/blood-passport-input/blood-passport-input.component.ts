import { trigger } from '@angular/animations';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { DELAYED_FADE_IN, FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';
import {
    controlHasModeRelatedErrors,
    isNullOrBlank,
    updateValidators,
    ValidationCategory,
    withCategory,
} from '@shared/utils';
import * as moment from 'moment';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { ParticipantInputComponent } from '@shared/components';
import { Participant } from '@shared/models';
import { BaseSampleInput } from '@dcf/utils/base-sample/base-sample-input.directive';

export const BLOOD_PASSPORT_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BloodPassportInputComponent),
    multi: true,
};

type Moment = moment.Moment;

@Component({
    selector: 'app-blood-passport-input',
    templateUrl: './blood-passport-input.component.html',
    styleUrls: ['./blood-passport-input.component.scss'],
    providers: [BLOOD_PASSPORT_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [DELAYED_FADE_IN, FADE_OUT]), trigger('radioFadeInOut', [FADE_IN, FADE_OUT])],
})
export class BloodPassportInputComponent extends BaseSampleInput implements OnInit {
    @ViewChild('bloodCollectionOfficialParticipantInput')
    bloodCollectionOfficialParticipantInput?: ParticipantInputComponent;

    @Output()
    readonly validateABPFieldsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() bloodCollectionOfficials: Array<Participant> = [];

    maxFromDate: Moment | undefined = undefined;

    maxToDate: Moment | undefined = undefined;

    minFromDate: Moment | undefined = undefined;

    minToDate: Moment | undefined = undefined;

    toSelectedDate: Moment | undefined = undefined;

    constructor(private controlContainer: ControlContainer, store: Store<fromRootStore.IState>) {
        super(store);
    }

    ngOnInit(): void {
        this.form = this.controlContainer.control as FormGroup;
        this.initValidators();
    }

    areABPFieldsInvalid(): boolean | undefined {
        return (
            (this.hasHadTrainingSession?.value === true && this.trainingType?.value === '') ||
            this.altitudeDataMissing() ||
            this.bloodLossDataMissing()
        );
    }

    emitABPValidation() {
        this.validateABPFieldsEmitter.emit(this.areABPFieldsInvalid());
    }

    handleCheckChange(checkedChanged: boolean, controlId: string): void {
        if (checkedChanged) {
            this.handleCheckChanged(controlId);
        } else {
            this.handleCheckNotChanged(controlId);
        }
        this.emitABPValidation();
    }

    initValidators(): void {
        this.handleCheckChange(
            this.form.controls.hasHadTrainingSession.value,
            `hasHadTrainingSession${this.sampleIndex}`
        );
        this.handleCheckChange(
            this.form.controls.hasHighAltitudeTraining.value,
            `hasHighAltitudeTraining${this.sampleIndex}`
        );
        this.handleCheckChange(
            this.form.controls.hasHighAltitudeSimulation.value,
            `hasHighAltitudeSimulation${this.sampleIndex}`
        );
        this.handleCheckChange(this.form.controls.hasBloodLoss.value, `hasBloodLoss${this.sampleIndex}`);
        this.handleCheckChange(this.form.controls.hasBloodTransfusion.value, `hasBloodTransfusion${this.sampleIndex}`);
    }

    markAsTouched(control: AbstractControl | null): void {
        if (control) {
            control.markAsTouched();
        }
    }

    updateToDateValidator(): void {
        if (this.toDate) {
            updateValidators(this.toDate, [withCategory(Validators.required, ValidationCategory.MandatoryDraft)]);
        }
    }

    private altitudeDataMissing() {
        return (
            (this.hasHighAltitudeTraining?.value === true && this.location?.value === '') ||
            (this.hasHighAltitudeTraining?.value === true && this.altitude?.value === '') ||
            (this.hasHighAltitudeTraining?.value === true && this.fromDate?.value === '') ||
            (this.hasHighAltitudeTraining?.value === true && this.toDate?.value === '') ||
            (this.hasHighAltitudeSimulation?.value === true && this.deviceType?.value === '') ||
            (this.hasHighAltitudeSimulation?.value === true && this.useManner?.value === '')
        );
    }

    private bloodLossDataMissing() {
        return (
            (this.hasBloodLoss?.value === true && this.timeBloodLoss?.value === '') ||
            (this.hasBloodLoss?.value === true && this.cause?.value === '') ||
            (this.hasBloodLoss?.value === true && this.volumeBloodLoss?.value === '') ||
            (this.hasBloodTransfusion?.value === true && this.timeTransfusion?.value === '') ||
            (this.hasBloodTransfusion?.value === true && this.volumeTransfusion?.value === '')
        );
    }

    private handleCheckChanged(controlId: string) {
        switch (controlId) {
            case `hasHadTrainingSession${this.sampleIndex}`:
                this.hasHadTrainingSession?.patchValue(true);
                if (this.trainingType) {
                    updateValidators(this.trainingType, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.trainingType.markAsTouched();
                }
                break;
            case `hasHighAltitudeTraining${this.sampleIndex}`:
                this.hasHighAltitudeTraining?.patchValue(true);
                if (this.location && this.altitude && this.fromDate && this.toDate) {
                    updateValidators(this.location, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.location.markAsTouched();
                    updateValidators(this.altitude, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.altitude.markAsTouched();
                    updateValidators(this.fromDate, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.fromDate.markAsTouched();
                    this.toDate.markAsTouched();
                    this.updateToDateValidator();
                }
                break;
            case `hasHighAltitudeSimulation${this.sampleIndex}`:
                this.hasHighAltitudeSimulation?.patchValue(true);
                if (this.deviceType && this.useManner) {
                    updateValidators(this.deviceType, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.deviceType.markAsTouched();
                    updateValidators(this.useManner, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.useManner.markAsTouched();
                }
                break;
            case `hasBloodLoss${this.sampleIndex}`:
                this.hasBloodLoss?.patchValue(true);
                if (this.timeBloodLoss && this.cause && this.volumeBloodLoss) {
                    updateValidators(this.timeBloodLoss, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.timeBloodLoss.markAsTouched();
                    updateValidators(this.cause, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.cause.markAsTouched();
                    updateValidators(this.volumeBloodLoss, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.volumeBloodLoss.markAsTouched();
                }
                break;
            case `hasBloodTransfusion${this.sampleIndex}`:
                this.hasBloodTransfusion?.patchValue(true);
                if (this.timeTransfusion && this.volumeTransfusion) {
                    updateValidators(this.timeTransfusion, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.timeTransfusion.markAsTouched();
                    updateValidators(this.volumeTransfusion, [
                        withCategory(Validators.required, ValidationCategory.MandatoryDraft),
                    ]);
                    this.volumeTransfusion.markAsTouched();
                }
                break;
            default:
                break;
        }
    }

    private handleCheckNotChanged(controlId: string) {
        switch (controlId) {
            case `hasHadTrainingSession${this.sampleIndex}`:
                this.hasHadTrainingSession?.patchValue(false);
                if (this.trainingType) {
                    updateValidators(this.trainingType, []);
                }
                break;
            case `hasHighAltitudeTraining${this.sampleIndex}`:
                this.hasHighAltitudeTraining?.patchValue(false);
                if (this.location && this.altitude && this.fromDate && this.toDate) {
                    updateValidators(this.location, []);
                    updateValidators(this.altitude, []);
                    updateValidators(this.fromDate, []);
                    updateValidators(this.toDate, []);
                }
                break;
            case `hasHighAltitudeSimulation${this.sampleIndex}`:
                this.hasHighAltitudeSimulation?.patchValue(false);
                if (this.deviceType && this.useManner) {
                    updateValidators(this.deviceType, []);
                    updateValidators(this.useManner, []);
                }
                break;
            case `hasBloodLoss${this.sampleIndex}`:
                this.hasBloodLoss?.patchValue(false);
                if (this.timeBloodLoss && this.cause && this.volumeBloodLoss) {
                    updateValidators(this.timeBloodLoss, []);
                    updateValidators(this.cause, []);
                    updateValidators(this.volumeBloodLoss, []);
                }
                break;
            case `hasBloodTransfusion${this.sampleIndex}`:
                this.hasBloodTransfusion?.patchValue(false);
                if (this.timeTransfusion && this.volumeTransfusion) {
                    updateValidators(this.timeTransfusion, []);
                    updateValidators(this.volumeTransfusion, []);
                }
                break;
            default:
                break;
        }
    }

    get altitude(): AbstractControl | null {
        return this.altitudeTraining && this.altitudeTraining.get('altitude');
    }

    get altitudeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.altitude,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.altitude?.errors?.required
        );
    }

    get altitudeSimulation(): AbstractControl | null {
        return this.form.get('altitudeSimulation');
    }

    get altitudeSimulationHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.altitudeSimulation,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.altitudeSimulation?.errors?.required
        );
    }

    get altitudeTraining(): AbstractControl | null {
        return this.form.get('altitudeTraining');
    }

    get bloodCollectionOfficial(): AbstractControl | null {
        return this.form.get('bloodCollectionOfficial');
    }

    get bloodCollectionOfficialHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.bloodCollectionOfficial,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.bloodCollectionOfficial?.errors?.lastNameRequired ||
                this.bloodCollectionOfficial?.errors?.firstNameRequired
        );
    }

    get bloodCollectionOfficialHasFirstNameErrors(): boolean {
        return (
            ((this.bloodCollectionOfficialParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && this.bloodCollectionOfficialHasErrors)) &&
                this.bloodCollectionOfficial?.errors?.firstNameRequired) ||
            (!this.inCreation &&
                this.bloodCollectionOfficial?.errors?.firstNameRequired &&
                isNullOrBlank(this.bloodCollectionOfficial?.value?.firstName))
        );
    }

    get bloodCollectionOfficialHasLastNameErrors(): boolean {
        return (
            ((this.bloodCollectionOfficialParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && this.bloodCollectionOfficialHasErrors)) &&
                this.bloodCollectionOfficial?.errors?.lastNameRequired) ||
            (!this.inCreation &&
                this.bloodCollectionOfficial?.errors?.lastNameRequired &&
                isNullOrBlank(this.bloodCollectionOfficial?.value?.lastName))
        );
    }

    get bloodDonationOrLoss(): AbstractControl | null {
        return this.form.get('bloodDonationOrLoss');
    }

    get bloodTransfusion(): AbstractControl | null {
        return this.form.get('bloodTransfusion');
    }

    get cause(): AbstractControl | null {
        return this.bloodDonationOrLoss && this.bloodDonationOrLoss.get('cause');
    }

    get causeBloodLossHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.cause,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.cause?.errors?.required
        );
    }

    get collectedAfter3Days(): AbstractControl | null {
        return this.form.get('collectedAfter3Days');
    }

    get collectedLast3DaysHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.collectedAfter3Days,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.collectedAfter3Days?.errors?.required
        );
    }

    get deviceType(): AbstractControl | null {
        return this.altitudeSimulation && this.altitudeSimulation.get('deviceType');
    }

    get deviceTypeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.deviceType,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.deviceType?.errors?.required
        );
    }

    get extremeEnvironment(): AbstractControl | null {
        return this.form.get('extremeEnvironment');
    }

    get fromDate(): AbstractControl | null {
        return this.altitudeTraining && this.altitudeTraining.get('start');
    }

    get fromDateHasErrors(): boolean {
        return (
            controlHasModeRelatedErrors(
                this.fromDate,
                this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
                this.inCreation,
                this.fromDate?.errors?.required
            ) && !this.showCalendar
        );
    }

    get hasBloodLoss(): AbstractControl | null {
        return this.form.get('hasBloodLoss');
    }

    get hasBloodLossHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.hasBloodLoss,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.hasBloodLoss?.errors?.required
        );
    }

    get hasBloodTransfusion(): AbstractControl | null {
        return this.form.get('hasBloodTransfusion');
    }

    get hasBloodTransfusionHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.hasBloodTransfusion,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.hasBloodTransfusion?.errors?.required
        );
    }

    get hasHighAltitudeSimulationHasErrors(): AbstractControl | null {
        return this.form.get('hasHighAltitudeSimulationHasErrors');
    }

    get hasHadTrainingSession(): AbstractControl | null {
        return this.form.get('hasHadTrainingSession');
    }

    get hasHadTrainingSessionHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.hasHadTrainingSession,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.hasHadTrainingSession?.errors?.required
        );
    }

    get hasHighAltitudeSimulation(): AbstractControl | null {
        return this.form.get('hasHighAltitudeSimulation');
    }

    get hasHighAltitudeTraining(): AbstractControl | null {
        return this.form.get('hasHighAltitudeTraining');
    }

    get hasHighAltitudeTrainingHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.hasHighAltitudeTraining,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.hasHighAltitudeTraining?.errors?.required
        );
    }

    get location(): AbstractControl | null {
        return this.altitudeTraining && this.altitudeTraining.get('location');
    }

    get locationHighHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.location,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.location?.errors?.required
        );
    }

    get seated(): AbstractControl | null {
        return this.form.get('seated');
    }

    get seatedHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.seated,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.seated?.errors?.required
        );
    }

    get tempLoggerId(): AbstractControl | null {
        return this.form.get('tempLoggerId');
    }

    get timeBloodLoss(): AbstractControl | null {
        return this.bloodDonationOrLoss && this.bloodDonationOrLoss.get('timeBloodLoss');
    }

    get timeBloodLossHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.timeBloodLoss,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.timeBloodLoss?.errors?.required
        );
    }

    get timeTransfusion(): AbstractControl | null {
        return this.bloodTransfusion && this.bloodTransfusion.get('timeBloodTransfusion');
    }

    get timeTransfusionHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.timeTransfusion,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.timeTransfusion?.errors?.required
        );
    }

    get toDate(): AbstractControl | null {
        return this.altitudeTraining && this.altitudeTraining.get('end');
    }

    get toDateHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.toDate,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.toDate?.errors?.required
        );
    }

    get trainingType(): AbstractControl | null {
        return this.form.get('trainingType');
    }

    get trainingTypeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.trainingType,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.trainingType?.errors?.required
        );
    }

    get useManner(): AbstractControl | null {
        return this.altitudeSimulation && this.altitudeSimulation.get('useManner');
    }

    get userMannerHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.useManner,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.useManner?.errors?.required
        );
    }

    get volumeBloodLoss(): AbstractControl | null {
        return this.bloodDonationOrLoss && this.bloodDonationOrLoss.get('volumeBloodLoss');
    }

    get volumeBloodLossHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.volumeBloodLoss,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.volumeBloodLoss?.errors?.required
        );
    }

    get volumeTransfusion(): AbstractControl | null {
        return this.bloodTransfusion && this.bloodTransfusion.get('volumeBloodTransfusion');
    }

    get volumeTransfusionHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.volumeTransfusion,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.volumeTransfusion?.errors?.required
        );
    }
}
