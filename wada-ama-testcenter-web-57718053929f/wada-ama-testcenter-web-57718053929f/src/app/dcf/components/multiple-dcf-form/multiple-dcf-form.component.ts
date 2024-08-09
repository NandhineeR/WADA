import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
    AthleteInformation,
    DCF,
    DCF_STATUS_CANCELLED,
    DCF_STATUS_COMPLETED,
    DCF_STATUS_DRAFT,
    ProceduralInformation,
    Sample,
    SectionProceduralAutoCompletes,
    Timezone,
    TimezoneField,
    UrineSampleBoundaries,
} from '@dcf/models';
import { Store, select } from '@ngrx/store';
import {
    CountryWithRegions,
    DCFFormControls,
    FieldsSecurity,
    Laboratory,
    LocalizedEntity,
    Participant,
    SampleTypeEnum,
    SportDiscipline,
    StatusEnum,
} from '@shared/models';
import {
    controlHasModeRelatedErrors,
    dateIsRemoved,
    getSportDisciplineSuggestions,
    isNotUndefinedNorNull,
    isNullOrBlank,
    toggleNotApplicable,
    updateCollectionDateValidators,
    updateTimezoneValidators,
    updateValidators,
    updateVolumeReasonValidators,
    updateVolumeValidators,
    validateCollectionDate,
    validateDatetimeFormat,
    validateTimezone,
    ValidationCategory,
    withCategory,
} from '@shared/utils';
import { LocationEnum } from '@to/models';
import { Observable } from 'rxjs';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import { BaseSampleComponent } from '@dcf/utils/base-sample/base-sample.component';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { SampleInputComponent } from '../step-2/sample-input/sample-input.component';
import { SetTimezoneDefaultModalComponent } from '../timezone-default-modal/timezone-default-modal.component';

@Component({
    selector: 'app-multiple-dcf-form',
    templateUrl: './multiple-dcf-form.component.html',
    styleUrls: ['./multiple-dcf-form.component.scss'],
})
export class MultipleDCFFormComponent extends BaseSampleComponent implements OnInit {
    readonly controls = DCFFormControls;

    readonly locationEnum = LocationEnum;

    @ViewChildren(SampleInputComponent)
    sampleInputComponents?: QueryList<SampleInputComponent>;

    @ViewChild('setTimezoneDefaultModalRef', { static: true })
    setTimezoneDefaultModalRef?: SetTimezoneDefaultModalComponent;

    @Output() readonly executeSampleCodeValidation = new EventEmitter<string>();

    @Output() readonly submitData = new EventEmitter<string>();

    @Input() athleteId = '';

    @Input() bloodCollectionOfficials: Array<Participant> = [];

    @Input() chaperones: Array<Participant> = [];

    @Input() set coaches(coaches: Map<string, Array<Participant>>) {
        this.coachesForAthlete = this.getParticipantForAthlete(coaches, this.athleteId);
    }

    @Input() countries: Array<CountryWithRegions> = [];

    @Input() set dcf(data: DCF | null) {
        if (data && !this.samplesInitialized) {
            this.initialSamples = data?.sampleInformation?.samples;
            this.samplesInitialized = true;
        }
    }

    @Input() set dcfStatus(status: string) {
        this._dcfStatus = status;
        this.dcfStatusAsEnum = this.convertStringToEnum(status);
    }

    get dcfStatus(): string {
        return this._dcfStatus;
    }

    @Input() set doctors(doctors: Map<string, Array<Participant>>) {
        this.doctorsForAthlete = this.getParticipantForAthlete(doctors, this.athleteId);
    }

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    @Input() form: FormGroup = new FormGroup({});

    @Input() inCreation = false;

    @Input() isEditMode = false;

    @Input() laboratories: Array<Laboratory> = [];

    @Input() locale = '';

    @Input() manufacturers: Array<LocalizedEntity> = [];

    @Input() proceduralInformation: ProceduralInformation | null = null;

    @Input() sampleDuplicateException$?: Observable<Map<string, string> | null>;

    @Input() showErrors = false;

    @Input() sportsDisciplines: Array<SportDiscipline> = [];

    @Input() testId = '';

    @Input() timezones: Array<Timezone> = [];

    @Input() urineSampleBoundaries: UrineSampleBoundaries | null = null;

    @Input() witnessChaperones: Array<Participant> = [];

    sectionProceduralAutoCompletes$: Observable<SectionProceduralAutoCompletes> = this.store.pipe(
        select(fromAutoCompletesStore.getDCFSectionProceduralAutoCompletes)
    );

    _dcfStatus = '';

    _filledTimezones: Array<TimezoneField> = [];

    addressForm?: AbstractControl;

    athlete?: AthleteInformation;

    canDisplayFormGroup = false;

    coachDisabled = false;

    coachesForAthlete: Array<Participant> = [];

    contactAttemptIsDirty = false;

    dcfStatusAsEnum: StatusEnum | null = null;

    doctorDisabled = false;

    doctorsForAthlete: Array<Participant> = [];

    editMailingAddress = false;

    initialSamples: Sample[] | undefined = undefined;

    samplesInitialized = false;

    tempEmail = '';

    constructor(public store: Store<fromRootStore.IState>) {
        super(store);
    }

    ngOnInit(): void {
        // Applies validations based on input applicability
        this.toggleFieldNotApplicable(
            'coachNotApplicable',
            !(this.coachNotApplicable && this.coachNotApplicable.value)
        );

        this.toggleFieldNotApplicable(
            'doctorNotApplicable',
            !(this.doctorNotApplicable && this.doctorNotApplicable.value)
        );

        if (!this.inCreation && this.notificationDate && isNotUndefinedNorNull(this.notificationDate.value)) {
            this.notificationDate.setValidators([
                withCategory(dateIsRemoved, ValidationCategory.Business),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
            this.notificationDate.updateValueAndValidity();
        }

        if (!this.inCreation && this.arrivalDate && isNotUndefinedNorNull(this.arrivalDate.value)) {
            this.arrivalDate.setValidators([
                withCategory(dateIsRemoved, ValidationCategory.Business),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
            this.arrivalDate.updateValueAndValidity();
        }

        this._filledTimezones = this.retrieveFilledTimezones();
    }

    deleteSample(deleteIndex: number): void {
        if (this.samples) {
            this.samples.removeAt(deleteIndex);
            this.dispatchSampleCodeValidation();
        }
    }

    dispatchSampleCodeValidation(): void {
        this.updateSamples();
        this.executeSampleCodeValidation.emit(this.testId);
    }

    enableIsDirty(): void {
        this.contactAttemptIsDirty = true;
    }

    getParticipantForAthlete(participantMap: Map<string, Array<Participant>>, athleteId: string): Array<Participant> {
        if (participantMap) {
            return participantMap.get(athleteId) || [];
        }
        return [];
    }

    openLinkTimezone(): void {
        window.open('https://www.timeanddate.com/time/map/', '_blank', 'toolbar=0,location=0,menubar=0');
    }

    setTimezoneDefaultByAthlete(timezone: Timezone): void {
        this.arrivalTimezone?.setValue(timezone);
        const updatedSamples: Sample[] = this.samples?.value;
        updatedSamples.forEach((sample: Sample) => {
            sample.timezone = timezone;
        });
        this.samples?.setValue(updatedSamples);
    }

    showSetTimezoneDefaultModal(timezone: Timezone): void {
        this._filledTimezones = this.retrieveFilledTimezones();
        if (this.setTimezoneDefaultModalRef) {
            if (this.hasFilledTimezones()) {
                this.setTimezoneDefaultModalRef.show(timezone);
            } else {
                this.setTimezoneDefaultByAthlete(timezone);
            }
        }
    }

    sportDisciplineSuggestions = (token: string): Observable<Array<SportDiscipline>> => {
        return getSportDisciplineSuggestions(token, this.sportsDisciplines);
    };

    // Toggle Participant inputs and calls toggle not applicable for changing validations
    toggleFieldNotApplicable(controlName: string, isNotApplicable: boolean): void {
        const fieldNotApplicableControl: AbstractControl | null = this.form.get(controlName);
        const isFieldDisabled = !isNotApplicable;
        if (fieldNotApplicableControl) {
            fieldNotApplicableControl.patchValue(isFieldDisabled);
        }
        const fieldControl: AbstractControl | null = this.form.get(controlName.replace('NotApplicable', ''));
        toggleNotApplicable(isFieldDisabled, fieldControl);
    }

    updateProceduralInformation(object: any): void {
        Object.entries(object.value).forEach(([key, value]) => {
            if (this.form.get(key)) this.form.get(key)?.patchValue(value);
        });
    }

    updateSamples() {
        let updatedSamples: Sample[] = this.samples?.value || [];
        if (this.sampleInputComponents && this.samples) {
            const sampleComponentForms = this.sampleInputComponents.map(
                (sampleInput: SampleInputComponent) => sampleInput.actualForm
            );

            if (sampleComponentForms.length > 0) {
                // remove deleted samples
                updatedSamples = sampleComponentForms
                    .map((form: FormGroup) => form.value)
                    .filter(
                        (sampleForm) =>
                            (this.samples?.value as Sample[]).find(
                                (sampleInNestedForm) => sampleInNestedForm.guid === sampleForm.guid
                            ) !== undefined
                    )
                    .map((sampleItem: Sample) => SampleFactory.createSampleFromForm(sampleItem));
            }

            this.samples?.patchValue(updatedSamples, { emitEvent: false });
            this.samples.controls.forEach((value: AbstractControl) => {
                const {
                    collectionDate,
                    timezone,
                    sampleCode,
                    volume,
                    volumeBelowMinimumReason,
                } = (value as FormGroup).controls;

                this.updateCollectionDateValidators(sampleCode, collectionDate);
                if (this.isTimezoneRequired) {
                    this.updateTimezoneValidators(sampleCode, collectionDate, timezone);
                }

                updateVolumeValidators(volume, this.urineSampleBoundaries);
                if (!isNullOrBlank(volume?.value?.toString())) {
                    updateVolumeReasonValidators(
                        volume.value.toString(),
                        this.urineSampleBoundaries,
                        volumeBelowMinimumReason
                    );
                }
            });
        }
    }

    public getForm(): FormGroup {
        this.updateSamples();
        return this.form;
    }

    private convertStringToEnum(status: string): StatusEnum | null {
        if (status === DCF_STATUS_COMPLETED) {
            return StatusEnum.Completed;
        }
        if (status === DCF_STATUS_DRAFT) {
            return StatusEnum.Draft;
        }
        if (status === DCF_STATUS_CANCELLED) {
            return StatusEnum.Cancelled;
        }
        return null;
    }

    private updateCollectionDateValidators(
        sampleCode: AbstractControl | null,
        collectionDate: AbstractControl | null
    ): void {
        if (!isNullOrBlank(sampleCode?.value?.toString())) {
            updateCollectionDateValidators(
                collectionDate,
                validateCollectionDate(sampleCode?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (collectionDate?.validator) {
            const validator = collectionDate.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateCollectionDateValidators(collectionDate, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    private updateNotificationTimezoneValidators(validator: ValidatorFn, category: ValidationCategory) {
        if (this.notificationTimezone) {
            updateValidators(this.notificationTimezone, [withCategory(validator, category)]);
        }
    }

    private updateTimezoneValidators(
        sampleCode: AbstractControl | null,
        collectionDate: AbstractControl | null,
        timezone: AbstractControl | null
    ): void {
        if (!isNullOrBlank(sampleCode?.value?.toString())) {
            updateTimezoneValidators(
                timezone,
                validateTimezone(sampleCode?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (!isNullOrBlank(collectionDate?.value?.toString()) && this.isTimezoneRequired) {
            updateTimezoneValidators(
                timezone,
                validateTimezone(collectionDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (
            timezone?.validator &&
            isNullOrBlank(sampleCode?.value?.toString()) &&
            isNullOrBlank(collectionDate?.value?.toString())
        ) {
            const validator = timezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateTimezoneValidators(timezone, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    private updateValidatorsArrivalDateOnChange() {
        if (!isNullOrBlank(this.arrivalDate?.value?.toString())) {
            updateTimezoneValidators(
                this.arrivalTimezone,
                validateTimezone(this.arrivalDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (this.arrivalTimezone?.validator) {
            const validator = this.arrivalTimezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateTimezoneValidators(this.arrivalTimezone, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    get address(): AbstractControl | null {
        return this.form.get('address');
    }

    get arrivalDate(): AbstractControl | null {
        return this.form.get('arrivalDate');
    }

    get arrivalDateHasErrors(): boolean {
        return (
            controlHasModeRelatedErrors(
                this.arrivalDate,
                this.showErrors,
                this.inCreation,
                this.arrivalDate?.errors?.required
            ) && !this.showCalendar
        );
    }

    get arrivalTimezone(): AbstractControl | null {
        return this.form.get('arrivalTimezone');
    }

    get arrivalTimezoneHasErrors() {
        this.updateValidatorsArrivalDateOnChange();
        return controlHasModeRelatedErrors(
            this.arrivalTimezone,
            this.showErrors || this.arrivalTimezone?.errors?.validateEmptyTimezone?.error?.invalid,
            this.inCreation,
            this.arrivalTimezone?.errors?.validateEmptyTimezone?.error?.invalid
        );
    }

    get coach(): AbstractControl | null {
        return this.form.get('coach');
    }

    get coachHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.coach,
            this.showErrors,
            this.inCreation,
            this.coach?.errors?.lastNameRequired || this.coach?.errors?.firstNameRequired
        );
    }

    get coachNotApplicable(): AbstractControl | null {
        return this.form.get('coachNotApplicable');
    }

    get doctor(): AbstractControl | null {
        return this.form.get('doctor');
    }

    get doctorHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.doctor,
            this.showErrors,
            this.inCreation,
            this.doctor?.errors?.lastNameRequired || this.doctor?.errors?.firstNameRequired
        );
    }

    get doctorNotApplicable(): AbstractControl | null {
        return this.form.get('doctorNotApplicable');
    }

    get filledTimezones(): TimezoneField[] {
        return this._filledTimezones;
    }

    get notificationDate(): AbstractControl | null {
        return this.form.get('notificationDate');
    }

    get notificationDateHasErrors(): boolean {
        return (
            controlHasModeRelatedErrors(
                this.notificationDate,
                this.showErrors,
                this.inCreation,
                this.notificationDate?.errors?.required
            ) && !this.showCalendar
        );
    }

    get notificationTimezone(): AbstractControl | null {
        return this.form.get('notificationTimezone');
    }

    get notificationTimezoneHasErrors() {
        if (!isNullOrBlank(this.notificationDate?.value?.toString())) {
            this.updateNotificationTimezoneValidators(
                validateTimezone(this.notificationDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (this.notificationTimezone?.validator) {
            const validator = this.notificationTimezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                this.updateNotificationTimezoneValidators(Validators.required, ValidationCategory.Mandatory);
            }
        }

        return controlHasModeRelatedErrors(
            this.notificationTimezone,
            this.showErrors || this.notificationTimezone?.errors?.validateEmptyTimezone?.error?.invalid,
            this.inCreation,
            this.notificationTimezone?.errors?.validateEmptyTimezone?.error?.invalid
        );
    }

    get notifyingChaperone(): AbstractControl | null {
        return this.form.get('notifyingChaperone');
    }

    get notifyingChaperoneHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.notifyingChaperone,
            this.showErrors,
            this.inCreation,
            this.notifyingChaperone?.errors?.lastNameRequired || this.notifyingChaperone?.errors?.firstNameRequired
        );
    }

    get samples(): FormArray | null {
        return this.form.get('samples') as FormArray;
    }

    get sportDiscipline(): AbstractControl | null {
        return this.form.get('sportDiscipline');
    }

    get sportDisciplineHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.sportDiscipline,
            this.showErrors,
            this.inCreation,
            this.sportDiscipline?.errors?.required
        );
    }

    private hasFilledTimezones(): boolean {
        const samples: Sample[] = this.samples?.value;
        const sampleWithTimezone = samples.find((sample: Sample) => {
            return sample.timezone != null;
        });
        return this.arrivalTimezone?.value || sampleWithTimezone;
    }

    private retrieveFilledTimezones(): TimezoneField[] {
        if (this.arrivalTimezone?.value) {
            this._filledTimezones.push(
                new TimezoneField({
                    dateTimeField: TimezoneField.datetimeFields.arrivalDate,
                    timezone: new Timezone(this.arrivalTimezone?.value),
                })
            );
        }

        const samples: Sample[] = this.samples?.value;
        samples.forEach((sample) => {
            if (sample.timezone) {
                const timezoneField = new TimezoneField({ timezone: sample.timezone });

                switch (sample.sampleTypeSpecificCode) {
                    case SampleTypeEnum.Urine:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.urineSample;
                        break;
                    case SampleTypeEnum.Blood:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.bloodSample;
                        break;
                    case SampleTypeEnum.BloodPassport:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.bpSample;
                        break;
                    case SampleTypeEnum.DriedBloodSpot:
                        timezoneField.dateTimeField = TimezoneField.datetimeFields.dbsSample;
                        break;
                    default:
                        timezoneField.dateTimeField = '';
                }

                this._filledTimezones.push(timezoneField);
            }
        });

        return this._filledTimezones;
    }
}
