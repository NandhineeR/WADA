import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DCFFormControls, FieldsSecurity, MAX_NON_CONFORMITIES, Participant, StatusEnum } from '@shared/models';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    CalendarUtils,
    controlHasModeRelatedErrors,
    dateIsRemoved,
    fieldRequired,
    isNotUndefinedNorNull,
    isNullOrBlank,
    NumberOfErrorsPerCategory,
    numberOfErrorsPerCategory,
    updateTimezoneValidators,
    validateDatetimeFormat,
    validateTimezone,
    ValidationCategory,
    withCategory,
} from '@shared/utils';
import { Observable, of, Subscription } from 'rxjs';
import { NonConformity, ProceduralInformation, SectionProceduralAutoCompletes, Timezone } from '@dcf/models';
import { distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { ConflictException } from '@core/models';
import { NonConformityInputComponent } from '@dcf/components/non-conformity-input/non-conformity-input.component';
import { numberOfErrorPerCategoryValidation } from '@shared/utils/number-of-error-validation';
import { scrollELementById } from '@shared/utils/html-util';
import { trigger } from '@angular/animations';
import { ANIMATE_CHILD_OUT } from '@core/components/animation/animation.component';
import { ParticipantInputComponent } from '@shared/components';
import { DOCUMENT } from '@angular/common';
import { CanComponentDeactivate } from '@dcf/guards';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-procedural-information-input',
    templateUrl: './procedural-information-input.component.html',
    styleUrls: ['./procedural-information-input.component.scss'],
    animations: [trigger('fadeOutChild', [ANIMATE_CHILD_OUT])],
})
export class ProceduralInformationInputComponent
    extends CalendarUtils
    implements OnDestroy, OnInit, CanComponentDeactivate {
    readonly MAX_NON_CONFORMITIES = MAX_NON_CONFORMITIES;

    readonly controls = DCFFormControls;

    @ViewChild('dcoParticipantInput') dcoParticipantInput?: ParticipantInputComponent;

    @Output()
    readonly initializeProcedureInfo: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly submitError: EventEmitter<NumberOfErrorsPerCategory> = new EventEmitter<NumberOfErrorsPerCategory>();

    @Output()
    readonly submitStep: EventEmitter<any> = new EventEmitter<any>();

    @Input() set autoCompletes(autocomplete: SectionProceduralAutoCompletes | null) {
        if (autocomplete) {
            this.athleteRepresentatives = autocomplete.athleteRepresentatives;
            this.dopingControlOfficers = autocomplete.dcos;
        }
        this._autoCompletes = autocomplete;
    }

    get autoCompletes(): SectionProceduralAutoCompletes | null {
        return this._autoCompletes;
    }

    @Input() set conflictException(conflictException: ConflictException | undefined) {
        this.hasSaveConflict = Boolean(conflictException);
        this._conflictException = conflictException;
        if (conflictException) {
            this.hasOptimisticLockException = conflictException.hasOptimisticLockException();
        }
    }

    get conflictException(): ConflictException | undefined {
        return this._conflictException;
    }

    @Input() dcfId = '';

    @Input() dcfStatus: StatusEnum | undefined = undefined;

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    @Input() inCreation = false;

    @Input() isCurrentStepValid$: Observable<boolean> = of(false);

    @Input() isEditMode = false;

    @Input() isMultipleDCF = false;

    @Input() locale = '';

    @Input() set nonConformitiesControl(data: any) {
        if (data) {
            this.clearNonConformities();
            data.forEach((nonConformity: any) => this.addNonConformitiesToForm(nonConformity));
        }
    }

    @Input() set proceduralInformation(value: ProceduralInformation | null) {
        if (value) {
            this.form.patchValue(value);
        }
    }

    @Input() route = '';

    @Input() saveError = false;

    @Input() showErrors = false;

    @Input() timezones: Array<Timezone> = [];

    _autoCompletes: SectionProceduralAutoCompletes | null = null;

    _conflictException: ConflictException | undefined;

    athleteRepresentatives: Array<Participant> = [];

    dopingControlOfficers: Array<Participant> = [];

    form = new FormGroup(
        {
            athleteRepresentative: new FormControl(undefined, []),
            dco: new FormControl(undefined, [
                withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
                withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
            ]),
            consentForResearch: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            proceduralIrregularities: new FormControl('', []),
            declarationOfTransfusion: new FormControl('', []),
            declarationOfSupplements: new FormControl('', []),
            endOfProcedureDate: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]),
            timezone: new FormControl(null),
            nonConformities: new FormArray([]),
            dcoComment: new FormControl(''),
            athleteComment: new FormControl(''),
        },
        { updateOn: 'blur' }
    );

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    private subscriptions = new Subscription();

    constructor(@Inject(DOCUMENT) private document: Document, public store: Store<fromRootStore.IState>) {
        super();
    }

    ngOnDestroy(): void {
        this.submitForm(false);
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.submitForm(false);
        this.subscriptions.add(
            this.form.statusChanges
                .pipe(
                    map(() => (this.form.invalid ? numberOfErrorsPerCategory(this.form) : {})),
                    distinctUntilChanged((a: NumberOfErrorsPerCategory, b: NumberOfErrorsPerCategory) =>
                        numberOfErrorPerCategoryValidation(a, b)
                    )
                )
                .subscribe((errors) => {
                    this.submitError.emit(errors);
                })
        );

        this.subscriptions.add(
            this.form.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
                if (this.isMultipleDCF) this.submitForm(false);
            })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitForm(true))
        );

        if (!this.inCreation && this.endOfProcedureDate && isNotUndefinedNorNull(this.endOfProcedureDate.value)) {
            this.endOfProcedureDate.setValidators([
                withCategory(dateIsRemoved, ValidationCategory.Business),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
            this.endOfProcedureDate.updateValueAndValidity();
        }

        this.initializeProcedureInfo.emit(true);
    }

    addNonConformity(): void {
        if (this.nonConformities) {
            const nonConformity = new NonConformity();
            const item = NonConformityInputComponent.buildFormGroup();
            this.nonConformities.push(item);
            item.patchValue(nonConformity);
        }
    }

    canDeactivate(): Observable<boolean> {
        this.submitForm(false);

        return this.isCurrentStepValid$.pipe(
            take(1),
            tap((valid) => !valid && setTimeout(() => scrollELementById('notifications')))
        );
    }

    deleteNonConformity(index: number): void {
        if (this.nonConformities) {
            this.nonConformities.removeAt(index);
        }
    }

    openCategoryDropdown(elementId: string): void {
        const appDropdown = this.document.getElementById(elementId);
        appDropdown?.click();
    }

    updateDCO(event: any): void {
        this.dopingControlOfficer?.setValue(event.participant);
    }

    private addNonConformitiesToForm(nonConformity: any): void {
        if (this.nonConformities) {
            const item = NonConformityInputComponent.buildFormGroup();
            this.nonConformities.push(item);
            item.patchValue(nonConformity);
        }
    }

    private clearNonConformities(): void {
        if (this.nonConformities) {
            while (this.nonConformities.length !== 0) {
                this.nonConformities.removeAt(0);
            }
        }
    }

    private isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    private submitForm(saving: boolean): void {
        this.submitStep.emit({ value: this.form.value, saving });
    }

    private updateValidatorsProcedureEndDateOnChange(): void {
        if (!isNullOrBlank(this.endOfProcedureDate?.value?.toString())) {
            updateTimezoneValidators(
                this.timezone,
                validateTimezone(this.endOfProcedureDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (this.timezone?.validator) {
            const validator = this.timezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateTimezoneValidators(this.timezone, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    get athleteComment(): AbstractControl | null {
        return this.form.get('athleteComment');
    }

    get athleteRepresentative(): AbstractControl | null {
        return this.form.get('athleteRepresentative');
    }

    get athleteRepresentativeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.athleteRepresentative,
            this.showErrors,
            this.inCreation,
            this.athleteRepresentative?.errors?.required
        );
    }

    get consentForResearch(): AbstractControl | null {
        return this.form.get('consentForResearch');
    }

    get consentForResearchHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.consentForResearch,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.consentForResearch?.errors?.required
        );
    }

    get endOfProcedureDate(): AbstractControl | null {
        return this.form.get('endOfProcedureDate');
    }

    get endOfProcedureDateHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.endOfProcedureDate,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.endOfProcedureDate?.errors?.required
        );
    }

    get dcoComment(): AbstractControl | null {
        return this.form.get('dcoComment');
    }

    get declarationOfTransfusion(): AbstractControl | null {
        return this.form.get('declarationOfTransfusion');
    }

    get declarationOfTransfusionHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.declarationOfTransfusion,
            this.showErrors,
            this.inCreation,
            this.declarationOfTransfusion?.errors?.required
        );
    }

    get declarationOfSupplements(): AbstractControl | null {
        return this.form.get('declarationOfSupplements');
    }

    get declarationOfSupplementsHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.declarationOfSupplements,
            this.showErrors,
            this.inCreation,
            this.declarationOfSupplements?.errors?.required
        );
    }

    get dopingControlOfficer(): AbstractControl | null {
        return this.form.get('dco');
    }

    get dopingControlOfficerHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.dopingControlOfficer,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.dopingControlOfficer?.errors?.lastNameRequired || this.dopingControlOfficer?.errors?.firstNameRequired
        );
    }

    get dopingControlOfficerHasFirstNameErrors(): boolean {
        return (
            ((this.dcoParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && this.dopingControlOfficerHasErrors)) &&
                this.dopingControlOfficer?.errors?.firstNameRequired) ||
            (!this.inCreation &&
                this.dopingControlOfficer?.errors?.firstNameRequired &&
                isNullOrBlank(this.dopingControlOfficer?.value?.firstName))
        );
    }

    get dopingControlOfficerHasLastNameErrors(): boolean {
        return (
            ((this.dcoParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && this.dopingControlOfficerHasErrors)) &&
                this.dopingControlOfficer?.errors?.lastNameRequired) ||
            (!this.inCreation &&
                this.dopingControlOfficer?.errors?.lastNameRequired &&
                isNullOrBlank(this.dopingControlOfficer?.value?.lastName))
        );
    }

    get formHasErrors(): boolean {
        return (
            this.showErrors &&
            this.form.invalid &&
            (this.athleteRepresentativeHasErrors ||
                this.dopingControlOfficerHasErrors ||
                this.consentForResearchHasErrors ||
                this.proceduralIrregularitiesHasErrors ||
                this.declarationOfTransfusionHasErrors ||
                this.declarationOfSupplementsHasErrors ||
                this.endOfProcedureDateHasErrors ||
                this.timezoneHasErrors)
        );
    }

    get nonConformities(): FormArray | null {
        return this.form.get('nonConformities') as FormArray;
    }

    get proceduralIrregularities(): AbstractControl | null {
        return this.form.get('proceduralIrregularities');
    }

    get proceduralIrregularitiesHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.proceduralIrregularities,
            this.showErrors,
            this.inCreation,
            this.proceduralIrregularities?.errors?.required
        );
    }

    get timezone(): AbstractControl | null {
        return this.form.get('timezone');
    }

    get timezoneHasErrors() {
        this.updateValidatorsProcedureEndDateOnChange();
        return controlHasModeRelatedErrors(
            this.timezone,
            (this.showErrors && this.isDCFCompleted()) || this.timezone?.errors?.validateEmptyTimezone?.error?.invalid,
            this.inCreation,
            this.timezone?.errors?.validateEmptyTimezone?.error?.invalid
        );
    }
}
