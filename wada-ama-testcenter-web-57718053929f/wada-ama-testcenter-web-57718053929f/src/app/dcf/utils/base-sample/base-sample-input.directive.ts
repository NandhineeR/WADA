import { EventEmitter, Input, OnDestroy, Output, Directive } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import {
    FieldsSecurity,
    Laboratory,
    LocalizedEntity,
    SampleTypeEnum,
    StatusEnum,
    DCFFormControls,
} from '@shared/models';
import {
    CalendarUtils,
    SAMPLE_CODE_VALIDATION_ERROR,
    controlHasModeRelatedErrors,
    hasControlChange,
    isNullOrBlank,
    latinize,
    updateCollectionDateValidators,
    updateTimezoneValidators,
    validateCollectionDate,
    validateTimezone,
    ValidationCategory,
} from '@shared/utils';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import * as fromStore from '@dcf/store';
import { ConflictException } from '@core/models';
import { MatchingStatus, Timezone } from '@dcf/models';

@Directive()
export class BaseSampleInput extends CalendarUtils implements OnDestroy {
    readonly controls = DCFFormControls;

    @Output()
    readonly sampleValuesOnChange = new EventEmitter<void>();

    @Output()
    readonly validateSampleCodeDuplication: EventEmitter<any> = new EventEmitter();

    @Input() collectionDateDisabled = false;

    @Input() dataQA = '';

    @Input() dcfStatus?: StatusEnum;

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    @Input() set form(form: FormGroup) {
        this._form = form;
        this.sampleCodeValue = '';
        this.collectionDateValue = '';
    }

    get form(): FormGroup {
        return this._form;
    }

    @Input() inCreation = false;

    @Input() isEditMode = false;

    @Input() isMatchingResultType3or2or1 = false;

    @Input() isMultipleDCF = false;

    @Input() set laboratories(labs: Array<Laboratory>) {
        this._laboratories = labs;
        if (labs.length > 0) {
            this.setDefaultLaboratory();
        }
    }

    get laboratories(): Array<Laboratory> {
        return this._laboratories;
    }

    @Input() locale = 'en';

    @Input() set manufacturers(manus: Array<LocalizedEntity>) {
        this._manufacturers = manus;
    }

    get manufacturers(): Array<LocalizedEntity> {
        return this._manufacturers;
    }

    @Input() set previousSampleCode(sampleCode: string) {
        if (sampleCode) {
            this._previousSampleCode = sampleCode?.toString() || '';
        }
    }

    get previousSampleCode(): string {
        return this._previousSampleCode || '';
    }

    @Input() readonly = false;

    @Input() sampleIndex = -1;

    @Input() showErrors = false;

    @Input() tempLoggerStatus: MatchingStatus | undefined;

    @Input() timezones: Array<Timezone> = [];

    duplicateException$: Observable<ConflictException | null> = this.store.select(fromStore.getConflictException);

    isSampleTimezoneRequired$: Observable<boolean> = this.store.select(fromRootStore.isSampleTimezoneRequired);

    defaultLaboratory?: Laboratory;

    hasDuplicateException = false;

    collectionDateValue = '';

    sampleCodeValue = '';

    subscriptions = new Subscription();

    private _form = new FormGroup({});

    private _laboratories: Array<Laboratory> = [];

    private _manufacturers: Array<LocalizedEntity> = [];

    private _previousSampleCode = '';

    constructor(public store: Store<fromRootStore.IState>) {
        super();
        this.setHasDuplicateException();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    isCollectionDateDisabled(): boolean {
        return (
            (this.isMatchingResultType3or2or1 &&
                !(this.collectionDate?.value === null || this.collectionDate?.pristine === false)) ||
            this.collectionDateDisabled
        );
    }

    isDCFCompleted(): boolean {
        return this.dcfStatus === StatusEnum.Completed;
    }

    laboratorySuggestions = (token: string): Observable<Array<Laboratory>> => {
        const isBloodPassport =
            this.sampleType && this.sampleType.value && this.sampleType.value === SampleTypeEnum.BloodPassport;
        const latinizedToken = latinize(token.toLocaleLowerCase());
        const laboratoryList: Array<Laboratory> = this.laboratories.filter((laboratory: Laboratory): boolean =>
            isBloodPassport
                ? laboratory.biological === true &&
                  latinize(laboratory.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                : laboratory.accredited === true &&
                  latinize(laboratory.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
        );
        return of(laboratoryList);
    };

    manufacturersSuggestions = (token: string): Observable<Array<LocalizedEntity>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return of(
            this.manufacturers.filter(
                (manufacturer) => latinize(manufacturer.description.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
            )
        );
    };

    onChangeSampleCode(currentCode: string): void {
        if (this.form && currentCode !== this._previousSampleCode) {
            this._previousSampleCode = currentCode;
            if (isNullOrBlank(currentCode) && this.sampleCode) {
                this.sampleCode.markAsPristine();
            }
            this.validateSampleCodeDuplication.emit();
        }
    }

    onSelectedCollectionDate(): void {
        this.sampleValuesOnChange.emit();
    }

    onSelectedTimezone(): void {
        this.sampleValuesOnChange.emit();
    }

    onSelectedLaboratory(laboratory: Laboratory): void {
        this.form.patchValue({ laboratory });
        this.validateSampleCodeDuplication.emit();
    }

    onSelectedManufacturer(manufacturer: LocalizedEntity): void {
        this.form.patchValue({ manufacturer });
        this.validateSampleCodeDuplication.emit();
    }

    setDefaultLaboratory(): void {
        if (this.form) {
            if (!this.defaultLaboratory && this.laboratory && this.laboratory.value) {
                const lab: Laboratory = this.laboratory.value;
                if (lab.id) {
                    this.defaultLaboratory = this.laboratories.find((laboratory) => laboratory.id === lab.id);
                    this.laboratory.setValue(this.defaultLaboratory);
                }
            }
        }
    }

    setHasDuplicateException(): void {
        this.subscriptions.add(
            this.duplicateException$.subscribe((duplicateException: ConflictException | null) => {
                if (duplicateException && duplicateException.conflict) {
                    const index =
                        duplicateException.conflict.code === SAMPLE_CODE_VALIDATION_ERROR ? '' : this.sampleIndex;
                    const conflictParameters =
                        duplicateException.conflict.conflictParameters || new Map<string, string>();

                    const duplicateSampleCode = conflictParameters.get(`sampleCode${index}`) || '';
                    const duplicateSampleType = conflictParameters.get(`sampleType${index}`) || '';

                    const hasSameType = this.sampleType?.value === duplicateSampleType;
                    const hasSampleCode =
                        this.sampleCode?.value?.toUpperCase() === duplicateSampleCode.toUpperCase() || false;

                    this.hasDuplicateException = hasSameType && hasSampleCode;
                } else {
                    this.hasDuplicateException = false;
                }
            })
        );
    }

    private updateValidatorsCollectionDateOnChange(): void {
        if (
            !isNullOrBlank(this.collectionDate?.value?.toString()) &&
            hasControlChange(this.collectionDateValue, this.collectionDate)
        ) {
            this.collectionDateValue = this.collectionDate?.value?.toString() || '';
            updateTimezoneValidators(
                this.timezone,
                validateTimezone(this.collectionDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (
            this.timezone?.validator &&
            isNullOrBlank(this.sampleCode?.value?.toString()) &&
            isNullOrBlank(this.collectionDate?.value?.toString())
        ) {
            this.collectionDateValue = '';
            const validator = this.timezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateTimezoneValidators(this.timezone, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    private updateValidatorsSampleCodeOnChange(): void {
        if (
            !isNullOrBlank(this.sampleCode?.value?.toString()) &&
            hasControlChange(this.sampleCodeValue, this.sampleCode)
        ) {
            this.sampleCodeValue = this.sampleCode?.value?.toString() || '';
            updateCollectionDateValidators(
                this.collectionDate,
                validateCollectionDate(this.sampleCode?.value || ''),
                ValidationCategory.MandatoryDraft
            );
            updateTimezoneValidators(
                this.timezone,
                validateTimezone(this.sampleCode?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (this.collectionDate?.validator && isNullOrBlank(this.sampleCode?.value?.toString())) {
            this.sampleCodeValue = '';
            const validator = this.collectionDate.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateCollectionDateValidators(this.collectionDate, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    get collectionDate(): AbstractControl | null {
        return this.form.get('collectionDate');
    }

    get collectionDateHasErrors(): boolean {
        this.updateValidatorsSampleCodeOnChange();
        return controlHasModeRelatedErrors(
            this.collectionDate,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.collectionDate?.errors?.required
        );
    }

    get laboratory(): AbstractControl | null {
        return this.form.get('laboratory');
    }

    get laboratoryHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.laboratory,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.laboratory?.errors?.descriptionRequired?.error
        );
    }

    get manufacturer(): AbstractControl | null {
        return this.form.get('manufacturer');
    }

    get manufacturerHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.manufacturer,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.manufacturer?.errors?.descriptionRequired?.error
        );
    }

    get sampleCode(): AbstractControl | null {
        return this.form.get('sampleCode');
    }

    get sampleCodeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.sampleCode,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.sampleCode?.errors?.required?.error
        );
    }

    get sampleType(): AbstractControl | null {
        return this.form.get('sampleTypeSpecificCode');
    }

    get timezone(): AbstractControl | null {
        return this.form.get('timezone');
    }

    get timezoneHasErrors() {
        this.updateValidatorsSampleCodeOnChange();
        this.updateValidatorsCollectionDateOnChange();
        return controlHasModeRelatedErrors(
            this.timezone,
            (this.showErrors && (this.isMultipleDCF || this.isDCFCompleted())) ||
                this.timezone?.errors?.validateEmptyTimezone?.error?.invalid,
            this.inCreation,
            this.timezone?.errors?.validateEmptyTimezone?.error?.invalid
        );
    }
}
